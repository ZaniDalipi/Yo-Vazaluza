const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configuration
const PORT = process.env.PORT || 3001;
const ADMIN_PIN_HASH_FILE = path.join(__dirname, '.admin-pin-hash');
const fs = require('fs');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// IN-MEMORY ORDER STORE
// ============================================
let orders = [];
let orderCounter = 1;

// ============================================
// ADMIN PIN MANAGEMENT
// ============================================

function hashPin(pin) {
  return crypto.createHash('sha256').update(pin + 'yo-vazaluza-salt-2024').digest('hex');
}

function getStoredPinHash() {
  try {
    if (fs.existsSync(ADMIN_PIN_HASH_FILE)) {
      return fs.readFileSync(ADMIN_PIN_HASH_FILE, 'utf8').trim();
    }
  } catch (e) {
    // File doesn't exist yet
  }
  return null;
}

function setAdminPinHash(hash) {
  fs.writeFileSync(ADMIN_PIN_HASH_FILE, hash, 'utf8');
}

// Initialize default PIN (1234) if none set
if (!getStoredPinHash()) {
  setAdminPinHash(hashPin('1234'));
  console.log('Default admin PIN set to: 1234 (change this immediately!)');
}

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', orders: orders.length, uptime: process.uptime() });
});

// Submit a new order (from tablet kiosk)
app.post('/api/orders', (req, res) => {
  const { cupSize, flavors, toppings, sauces, totalPrice, customerName } = req.body;

  if (!cupSize || !flavors || flavors.length === 0) {
    return res.status(400).json({ error: 'Invalid order: cup size and at least one flavor required' });
  }

  const order = {
    id: `ORD-${String(orderCounter++).padStart(4, '0')}`,
    cupSize,
    flavors,
    toppings: toppings || [],
    sauces: sauces || [],
    totalPrice: totalPrice || 0,
    customerName: customerName || null,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.unshift(order);

  // Broadcast to all connected kitchen displays
  broadcastToKitchen({
    type: 'NEW_ORDER',
    order,
  });

  res.status(201).json({ success: true, order });
});

// Get all orders (for kitchen dashboard)
app.get('/api/orders', (req, res) => {
  const { status } = req.query;
  let filtered = orders;
  if (status) {
    filtered = orders.filter(o => o.status === status);
  }
  res.json({ orders: filtered });
});

// Update order status (kitchen actions: preparing, ready, completed)
app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['new', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();

  // Broadcast status update
  broadcastToKitchen({
    type: 'ORDER_UPDATED',
    order,
  });

  res.json({ success: true, order });
});

// Admin PIN verification
app.post('/api/admin/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (!pin || typeof pin !== 'string') {
    return res.status(400).json({ error: 'PIN required' });
  }

  const storedHash = getStoredPinHash();
  const inputHash = hashPin(pin);

  if (inputHash === storedHash) {
    // Generate a session token
    const token = crypto.randomBytes(32).toString('hex');
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid PIN' });
  }
});

// Change admin PIN
app.post('/api/admin/change-pin', (req, res) => {
  const { currentPin, newPin } = req.body;

  if (!currentPin || !newPin) {
    return res.status(400).json({ error: 'Current PIN and new PIN required' });
  }

  if (newPin.length < 4 || newPin.length > 8) {
    return res.status(400).json({ error: 'PIN must be 4-8 digits' });
  }

  if (!/^\d+$/.test(newPin)) {
    return res.status(400).json({ error: 'PIN must contain only digits' });
  }

  const storedHash = getStoredPinHash();
  const currentHash = hashPin(currentPin);

  if (currentHash !== storedHash) {
    return res.status(401).json({ error: 'Current PIN is incorrect' });
  }

  setAdminPinHash(hashPin(newPin));
  res.json({ success: true, message: 'PIN changed successfully' });
});

// Cup size pricing management
let cupSizePricing = [
  { id: 'small', name: 'Little Cup', size: 'small', price: 4.99, ounces: 8, emoji: '🥤' },
  { id: 'medium', name: 'Regular Cup', size: 'medium', price: 6.99, ounces: 12, emoji: '🍵' },
  { id: 'large', name: 'Big Cup', size: 'large', price: 8.99, ounces: 16, emoji: '🪣' },
];

app.get('/api/pricing/cups', (req, res) => {
  res.json({ cupSizes: cupSizePricing });
});

app.put('/api/pricing/cups', (req, res) => {
  const { cupSizes } = req.body;
  if (!Array.isArray(cupSizes)) {
    return res.status(400).json({ error: 'cupSizes array required' });
  }
  cupSizePricing = cupSizes;
  res.json({ success: true, cupSizes: cupSizePricing });
});

// Serve kitchen dashboard
app.get('/kitchen', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'kitchen.html'));
});

// Serve root with info
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// WEBSOCKET FOR REAL-TIME KITCHEN UPDATES
// ============================================
const kitchenClients = new Set();

wss.on('connection', (ws, req) => {
  console.log('Kitchen display connected');
  kitchenClients.add(ws);

  // Send current pending orders on connection
  const pendingOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  ws.send(JSON.stringify({
    type: 'INITIAL_ORDERS',
    orders: pendingOrders,
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG' }));
      }
    } catch (e) {
      // Ignore invalid messages
    }
  });

  ws.on('close', () => {
    console.log('Kitchen display disconnected');
    kitchenClients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
    kitchenClients.delete(ws);
  });
});

function broadcastToKitchen(message) {
  const data = JSON.stringify(message);
  for (const client of kitchenClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

// ============================================
// START SERVER
// ============================================
server.listen(PORT, () => {
  console.log(`\n🍦 Yo-Vazaluza Order Server running on port ${PORT}`);
  console.log(`   Kitchen Dashboard: http://localhost:${PORT}/kitchen`);
  console.log(`   API Health Check:  http://localhost:${PORT}/api/health`);
  console.log(`   Server Info:       http://localhost:${PORT}\n`);
});
