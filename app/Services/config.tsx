import { Platform } from 'react-native';

const api = {
  defaults: {
    baseURL: 'https://app-homologacao.aws.assim.com.br/api',
    // baseURL: 'https://assim-app-teste.aws.assim.com.br/api',
    // baseURL: 'http://192.168.1.182:8000/api/v1',
    timeout: 20000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  },

  interceptors: {
    request: {
      use: (successHandler: (config: any) => any, errorHandler: (error: any) => any) => {
        api._requestInterceptor = { successHandler, errorHandler };
      }
    },
    response: {
      use: (successHandler: (response: any) => any, errorHandler: (error: any) => any) => {
        api._responseInterceptor = { successHandler, errorHandler };
      }
    }
  },

  _requestInterceptor: null,
  _responseInterceptor: null,

  async request(config: any) {
    const isFormData = config.data instanceof FormData;
    const url = (config.baseURL || api.defaults.baseURL) + config.url;
    const method = (config.method?.toUpperCase() || 'GET');
    const headers = {
      ...api.defaults.headers,
      ...config.headers,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' })
    };

    if (isFormData) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);

        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value as string);
        });

        if (config.onProgress && xhr.upload) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              config.onProgress(progress);
            }
          };
        }

        xhr.onload = () => {
          let responseData;
          try {
            responseData = JSON.parse(xhr.responseText);
          } catch {
            responseData = null;
          }

          const formattedResponse = {
            status: xhr.status,
            data: responseData,
            headers: {},
            config
          };

          if (xhr.status >= 200 && xhr.status < 300) {
            if (api._responseInterceptor?.successHandler) {
              resolve(api._responseInterceptor.successHandler(formattedResponse));
            } else {
              resolve(formattedResponse);
            }
          } else {
            const error = { response: formattedResponse };
            if (api._responseInterceptor?.errorHandler) {
              reject(api._responseInterceptor.errorHandler(error));
            } else {
              reject(error);
            }
          }
        };

        xhr.onerror = () => {
          reject({ response: { status: xhr.status, data: { message: 'Erro de rede' }, config } });
        };

        xhr.send(config.data);
      });
    }

    // fetch para JSON normal
    try {
      let processedConfig = config;
      if (api._requestInterceptor?.successHandler) {
        processedConfig = api._requestInterceptor.successHandler(config) || config;
      }

      const body = method !== 'GET'
        ? JSON.stringify(config.data)
        : null;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout || api.defaults.timeout);

      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      const formattedResponse = {
        status: response.status,
        data: responseData,
        headers: response.headers,
        config
      };

      if (api._responseInterceptor?.successHandler) {
        return api._responseInterceptor.successHandler(formattedResponse);
      }

      return formattedResponse;
    } catch (error) {
      if (api._responseInterceptor?.errorHandler) {
        return api._responseInterceptor.errorHandler(error);
      }
      throw error;
    }
  }
};

// Configuração inicial dos interceptors
api.interceptors.request.use(
  (config) => config,
  (error) => {
    console.log('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return error.response;
    }
    console.error('Erro na resposta da API:', error.message);
    return Promise.reject(error);
  }
);

export const HandleRequest = async (
  endpoint: string,
  data: any,
  errorMessage: string,
  method: string = 'post',
  token?: string,
  headers?: any,
  baseURL?: string,
  onProgress?: (progress: number) => void
) => {
  try {
    const isFormData = data instanceof FormData;

    const requestHeaders = {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    };

    const response = await api.request({
      method: method.toLowerCase(),
      url: endpoint,
      data: data,
      headers: requestHeaders,
      baseURL: baseURL || api.defaults.baseURL,
      timeout: isFormData ? 120000 : 20000,
      onProgress // suporte unificado ao progresso
    });

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error: any) {
    console.error(`Erro na requisição ${endpoint}:`, error);

    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || errorMessage,
      };
    } else {
      return {
        status: 500,
        message: 'Erro de rede ou servidor indisponível',
      };
    }
  }
};

export default api;
