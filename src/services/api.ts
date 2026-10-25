/**
 * Future same-origin API boundary for a Node.js + Express service.
 * This prototype deliberately makes no network or database requests.
 * Supabase and all sensitive integrations belong behind that backend.
 */
export const API_PREFIX = '/api';

export type ApiEnvelope<T> = {
  data: T;
  requestId?: string;
};

export type ApiError = {
  code: string;
  message: string;
};

export interface ApiService {
  get<T>(path: `${typeof API_PREFIX}/${string}`): Promise<ApiEnvelope<T>>;
  post<TInput, TOutput>(
    path: `${typeof API_PREFIX}/${string}`,
    input: TInput,
  ): Promise<ApiEnvelope<TOutput>>;
}

// A future backend client can implement ApiService at this boundary.
// Visual components currently consume the synthetic fixtures in data/demo.ts.
