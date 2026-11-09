export const API_PREFIX = '/api';

export type ApiEnvelope<T> = {
  data: T;
  requestId?: string;
};

export type ApiError = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
};

export interface ApiService {
  get<T>(path: `${typeof API_PREFIX}/${string}`): Promise<ApiEnvelope<T>>;
  post<TInput, TOutput>(
    path: `${typeof API_PREFIX}/${string}`,
    input: TInput,
  ): Promise<ApiEnvelope<TOutput>>;
  patch<TInput, TOutput>(
    path: `${typeof API_PREFIX}/${string}`,
    input: TInput,
  ): Promise<ApiEnvelope<TOutput>>;
  put<TInput, TOutput>(
    path: `${typeof API_PREFIX}/${string}`,
    input: TInput,
  ): Promise<ApiEnvelope<TOutput>>;
  delete<T>(path: `${typeof API_PREFIX}/${string}`): Promise<ApiEnvelope<T>>;
}

export class ApiServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiServiceError';
  }
}

async function request<TOutput, TInput = never>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: `${typeof API_PREFIX}/${string}`,
  input?: TInput,
): Promise<ApiEnvelope<TOutput>> {
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: input === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: input === undefined ? undefined : JSON.stringify(input),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    if (response.ok) {
      throw new ApiServiceError('The server returned an invalid response.', response.status, 'INVALID_RESPONSE');
    }
    payload = null;
  }
  if (!response.ok) {
    const error = (payload as { error?: ApiError } | null)?.error;
    throw new ApiServiceError(
      error?.message ?? 'The request could not be completed.',
      response.status,
      error?.code ?? 'REQUEST_FAILED',
      error?.fieldErrors,
    );
  }

  return payload as ApiEnvelope<TOutput>;
}

export const apiService: ApiService = {
  get<T>(path: `${typeof API_PREFIX}/${string}`) {
    return request<T>('GET', path);
  },
  post<TInput, TOutput>(path: `${typeof API_PREFIX}/${string}`, input: TInput) {
    return request<TOutput, TInput>('POST', path, input);
  },
  patch<TInput, TOutput>(path: `${typeof API_PREFIX}/${string}`, input: TInput) {
    return request<TOutput, TInput>('PATCH', path, input);
  },
  put<TInput, TOutput>(path: `${typeof API_PREFIX}/${string}`, input: TInput) {
    return request<TOutput, TInput>('PUT', path, input);
  },
  delete<T>(path: `${typeof API_PREFIX}/${string}`) {
    return request<T>('DELETE', path);
  },
};
