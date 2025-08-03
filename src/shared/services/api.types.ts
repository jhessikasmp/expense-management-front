export interface ApiResponse {
  success: boolean;
  message?: string;
  data: unknown;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiConfig {
  baseURL: string;
  headers?: Record<string, string>;
}
