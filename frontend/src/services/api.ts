// In local dev, Vite proxies "/api" to the local server (see vite.config.ts).
// In production (e.g. client on Vercel, server on Render), set VITE_API_URL
// to the deployed server's base URL, e.g. https://cargopulse-api.onrender.com/api
// In local dev, Vite proxies "/api" to the local server (see vite.config.ts).
// In production (e.g. client on Vercel, server on Render), set VITE_API_URL
// to the deployed server's base URL, e.g. https://cargopulse-api.onrender.com/api
// Automatically ensure the API base ends with /api even if user omits it in Vercel env!
const getApiBase = () => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (!envUrl) return '/api';
  const clean = envUrl.replace(/\/+$/, '');
  if (!clean.endsWith('/api')) {
    return `${clean}/api`;
  }
  return clean;
};

const API_BASE = getApiBase();

export class ApiClient {
  private static getToken(): string | null {
    return localStorage.getItem('cargopulse_token');
  }

  static async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error(`[API Error] ${endpoint}:`, error.message);
      throw error;
    }
  }

  static get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static post<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static put<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
