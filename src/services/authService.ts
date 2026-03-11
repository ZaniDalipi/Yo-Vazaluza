import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getServerUrl } from './orderService';

const ADMIN_PIN_KEY = 'yo_vazaluza_admin_pin_hash';
const AUTH_TOKEN_KEY = 'yo_vazaluza_auth_token';
const FAILED_ATTEMPTS_KEY = '@yo_vazaluza_failed_attempts';
const LOCKOUT_UNTIL_KEY = '@yo_vazaluza_lockout_until';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 3 * 60 * 1000; // 3 minutes

// Simple hash for client-side PIN storage (when server is offline)
async function hashPin(pin: string): Promise<string> {
  // Use a simple but effective hashing approach for client-side
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'yo-vazaluza-salt-2024');

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback: simple hash for environments without crypto.subtle
  let hash = 0;
  const str = pin + 'yo-vazaluza-salt-2024';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

// Secure storage helpers (uses SecureStore on native, AsyncStorage on web)
async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return AsyncStorage.getItem(key);
  }
}

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    await AsyncStorage.setItem(key, value);
  }
}

// Initialize default PIN if none exists
export async function ensureAdminPinExists(): Promise<void> {
  const existing = await secureGet(ADMIN_PIN_KEY);
  if (!existing) {
    // Set default PIN to 1234
    const hashed = await hashPin('1234');
    await secureSet(ADMIN_PIN_KEY, hashed);
  }
}

// Check if account is locked out
export async function getLockoutInfo(): Promise<{ isLocked: boolean; remainingMs: number; failedAttempts: number }> {
  const lockoutUntil = await AsyncStorage.getItem(LOCKOUT_UNTIL_KEY);
  const failedStr = await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY);
  const failedAttempts = failedStr ? parseInt(failedStr, 10) : 0;

  if (lockoutUntil) {
    const lockoutTime = parseInt(lockoutUntil, 10);
    const now = Date.now();
    if (now < lockoutTime) {
      return { isLocked: true, remainingMs: lockoutTime - now, failedAttempts };
    }
    // Lockout expired, reset
    await AsyncStorage.removeItem(LOCKOUT_UNTIL_KEY);
    await AsyncStorage.removeItem(FAILED_ATTEMPTS_KEY);
    return { isLocked: false, remainingMs: 0, failedAttempts: 0 };
  }

  return { isLocked: false, remainingMs: 0, failedAttempts };
}

// Verify admin PIN
export async function verifyAdminPin(pin: string): Promise<{ success: boolean; error?: string; attemptsRemaining?: number }> {
  // Check lockout first
  const lockout = await getLockoutInfo();
  if (lockout.isLocked) {
    const mins = Math.ceil(lockout.remainingMs / 60000);
    return { success: false, error: `Account locked. Try again in ${mins} minute${mins > 1 ? 's' : ''}.` };
  }

  // Try server-side verification first
  try {
    const serverUrl = await getServerUrl();
    const response = await fetch(`${serverUrl}/api/admin/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
      signal: (() => { const c = new AbortController(); setTimeout(() => c.abort(), 3000); return c.signal; })(),
    });

    if (response.ok) {
      const data = await response.json();
      // Reset failed attempts on success
      await AsyncStorage.removeItem(FAILED_ATTEMPTS_KEY);
      await AsyncStorage.removeItem(LOCKOUT_UNTIL_KEY);
      if (data.token) {
        await secureSet(AUTH_TOKEN_KEY, data.token);
      }
      return { success: true };
    }

    if (response.status === 401) {
      return await handleFailedAttempt();
    }
  } catch {
    // Server not reachable, fall back to local verification
  }

  // Local verification fallback
  const storedHash = await secureGet(ADMIN_PIN_KEY);
  const inputHash = await hashPin(pin);

  if (storedHash === inputHash) {
    await AsyncStorage.removeItem(FAILED_ATTEMPTS_KEY);
    await AsyncStorage.removeItem(LOCKOUT_UNTIL_KEY);
    return { success: true };
  }

  return await handleFailedAttempt();
}

async function handleFailedAttempt(): Promise<{ success: boolean; error: string; attemptsRemaining: number }> {
  const failedStr = await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY);
  const failedAttempts = (failedStr ? parseInt(failedStr, 10) : 0) + 1;
  await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, failedAttempts.toString());

  const attemptsRemaining = MAX_ATTEMPTS - failedAttempts;

  if (failedAttempts >= MAX_ATTEMPTS) {
    const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
    await AsyncStorage.setItem(LOCKOUT_UNTIL_KEY, lockoutUntil.toString());
    return {
      success: false,
      error: `Too many failed attempts. Locked for 3 minutes.`,
      attemptsRemaining: 0,
    };
  }

  return {
    success: false,
    error: `Incorrect PIN. ${attemptsRemaining} attempt${attemptsRemaining > 1 ? 's' : ''} remaining.`,
    attemptsRemaining,
  };
}

// Change admin PIN
export async function changeAdminPin(currentPin: string, newPin: string): Promise<{ success: boolean; error?: string }> {
  if (newPin.length < 4 || newPin.length > 8) {
    return { success: false, error: 'PIN must be 4-8 digits' };
  }
  if (!/^\d+$/.test(newPin)) {
    return { success: false, error: 'PIN must contain only digits' };
  }

  // Verify current PIN first
  const verification = await verifyAdminPin(currentPin);
  if (!verification.success) {
    return { success: false, error: 'Current PIN is incorrect' };
  }

  // Update locally
  const newHash = await hashPin(newPin);
  await secureSet(ADMIN_PIN_KEY, newHash);

  // Update on server too
  try {
    const serverUrl = await getServerUrl();
    await fetch(`${serverUrl}/api/admin/change-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPin, newPin }),
      signal: (() => { const c = new AbortController(); setTimeout(() => c.abort(), 3000); return c.signal; })(),
    });
  } catch {
    // Server update failed but local is updated
  }

  return { success: true };
}
