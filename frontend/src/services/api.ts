export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const rawBase = import.meta.env.VITE_API_URL || '/api';
const cleanBase = rawBase.replace(/\/+$/, '');
const API_BASE = cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('replymuse_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred.';
    if (typeof body === 'object' && body !== null) {
      if (typeof body.detail === 'string') {
        errorMsg = body.detail;
      } else if (Array.isArray(body.detail)) {
        errorMsg = body.detail
          .map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.msg) return `${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg}`;
            return JSON.stringify(err);
          })
          .join('; ');
      } else if (body.detail && typeof body.detail.message === 'string') {
        errorMsg = body.detail.message;
      } else if (body.message) {
        errorMsg = body.message;
      }
    } else if (typeof body === 'string' && body) {
      errorMsg = body;
    }

    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      localStorage.removeItem('replymuse_token');
    }

    throw new ApiError(response.status, errorMsg, body);
  }

  return body as T;
}
