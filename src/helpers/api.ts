import axios, { AxiosError } from 'axios';
import { reportInternalServerError } from './NewRelicHelper';

export const request = async (url: string, method = 'GET') => {
  try {
    const response = await axios({
      method,
      timeout: 10000,
      url,
    });

    return response.data;
  } catch (error) {
    reportInternalServerError(error, { method, url });
    throw error;
  }
};

export const simulateRequestError = (
  status: number,
  url = '/simulated-endpoint',
  method = 'GET',
) => {
  const normalizedMethod = method.toUpperCase();
  const config: any = { method: normalizedMethod, url };
  const response: any = {
    config,
    headers: {},
    status,
    statusText: `Simulated ${status}`,
    data: {
      message: `Simulated server response ${status}`,
      source: 'local-simulator',
    },
  };

  const simulatedError = new AxiosError(
    `Simulated HTTP ${status}`,
    status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST',
    config,
    undefined,
    response,
  );

  reportInternalServerError(simulatedError, {
    method: normalizedMethod,
    url,
  });

  return Promise.reject(simulatedError);
};
