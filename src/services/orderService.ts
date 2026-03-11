import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_URL_KEY = '@yo_vazaluza_server_url';

// Default server URL - change this to your server's IP
const DEFAULT_SERVER_URL = Platform.OS === 'web'
  ? `${typeof window !== 'undefined' ? window.location.protocol : 'http:'}//${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`
  : 'http://localhost:3001';

let cachedServerUrl: string | null = null;

export async function getServerUrl(): Promise<string> {
  if (cachedServerUrl) return cachedServerUrl;
  try {
    const stored = await AsyncStorage.getItem(SERVER_URL_KEY);
    if (stored) {
      cachedServerUrl = stored;
      return stored;
    }
  } catch (e) {
    // Ignore
  }
  return DEFAULT_SERVER_URL;
}

export async function setServerUrl(url: string): Promise<void> {
  cachedServerUrl = url;
  await AsyncStorage.setItem(SERVER_URL_KEY, url);
}

interface OrderPayload {
  cupSize: {
    id: string;
    name: string;
    size: string;
    price: number;
    ounces: number;
    emoji: string;
  };
  flavors: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  toppings: Array<{
    topping: {
      id: string;
      name: string;
      emoji?: string;
      pricePerGram?: number;
    };
    grams: number;
  }>;
  sauces: Array<{
    id: string;
    name: string;
    emoji?: string;
  }>;
  totalPrice: number;
}

export async function submitOrder(order: OrderPayload): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const serverUrl = await getServerUrl();
    const response = await fetch(`${serverUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || 'Failed to submit order' };
    }

    const data = await response.json();
    return { success: true, orderId: data.order?.id };
  } catch (error: any) {
    // If server is not reachable, still allow the order (offline mode)
    console.warn('Order server not reachable:', error.message);
    return {
      success: false,
      error: 'Could not reach order server. The order was processed locally.',
    };
  }
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const serverUrl = await getServerUrl();
    const response = await fetch(`${serverUrl}/api/health`, {
      method: 'GET',
      signal: (() => { const c = new AbortController(); setTimeout(() => c.abort(), 3000); return c.signal; })(),
    });
    return response.ok;
  } catch {
    return false;
  }
}
