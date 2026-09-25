import { createClient } from 'redis';
import { config } from '../config';

class CacheService {
  private client: any = null;
  private isConnected = false;
  private memoryCache: Map<string, { val: string; expiresAt: number }> = new Map();

  constructor() {
    this.init();
  }

  private async init() {
    try {
      this.client = createClient({ url: config.redisUrl });
      this.client.on('error', (err: any) => {
        // Silently handle error and fall back to in-memory
        this.isConnected = false;
      });
      await this.client.connect();
      this.isConnected = true;
      console.log('✅ [CargoPulse] Redis connected successfully.');
    } catch (e) {
      this.isConnected = false;
      console.log('ℹ️ [CargoPulse] Redis not detected. Running resilient in-memory TTL caching.');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isConnected && this.client) {
      try {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
      } catch (err) {
        this.isConnected = false;
      }
    }

    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (item.expiresAt < Date.now()) {
      this.memoryCache.delete(key);
      return null;
    }
    return JSON.parse(item.val);
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    const stringified = JSON.stringify(value);
    if (this.isConnected && this.client) {
      try {
        await this.client.set(key, stringified, { EX: ttlSeconds });
        return;
      } catch (err) {
        this.isConnected = false;
      }
    }

    this.memoryCache.set(key, {
      val: stringified,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (err) {
        this.isConnected = false;
      }
    }
    this.memoryCache.delete(key);
  }

  async clearPrefix(prefix: string): Promise<void> {
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
  }
}

export const redisCache = new CacheService();
