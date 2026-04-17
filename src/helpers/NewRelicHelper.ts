type RequestOptions = {
  url?: string;
  method?: string;
};

const toStringPayload = (value: unknown): string => {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const truncate = (value: unknown, maxLength = 1000): string => {
  const text = toStringPayload(value);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export const reportInternalServerError = (
  error: unknown,
  options: RequestOptions = {},
): void => {
  const newRelic = (globalThis as any).newrelic;
  const httpStatus = Number((error as any)?.response?.status);
  console.log('[NewRelic] reportInternalServerError called', {
    httpStatus,
    url: options.url || (error as any)?.config?.url,
    method: options.method || (error as any)?.config?.method,
    message: (error as any)?.message,
  });

  if (!newRelic || !Number.isFinite(httpStatus) || httpStatus < 500) {
    return;
  }

  const requestUrl = options.url || (error as any)?.config?.url || 'unknown';
  const requestMethod = String(
    options.method || (error as any)?.config?.method || 'unknown',
  ).toUpperCase();
  const serverPayload = (error as any)?.response?.data;
  const errorMessage =
    (error as any)?.message ||
    (error as any)?.response?.data?.message ||
    'Internal Server Error';

  const attributes = {
    httpStatus,
    requestUrl,
    requestMethod,
    errorMessage: truncate(errorMessage, 500),
    serverPayload: truncate(serverPayload, 2000),
  };

  try {
    const errorObject =
      error instanceof Error ? error : new Error(String(errorMessage));
    console.log('[NewRelic] Recording error with attributes', attributes);
    newRelic.recordError(errorObject, attributes);
  } catch (reportingError) {
    if (__DEV__) {
      console.warn('[NewRelic] reportInternalServerError failed', reportingError);
    }
  }
};
