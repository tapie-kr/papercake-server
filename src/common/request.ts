import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import * as https from "node:https";

export enum SiteType {
  CLARITY_INJECT = "CLARITY_INJECT",
  SESSION_CREATE = "SESSION_CREATE",
  COLLECT_DATA = "COLLECT_DATA",
}

const defaultHeaders: Record<SiteType, Record<string, string>> = {
  [SiteType.CLARITY_INJECT]: {},
  [SiteType.SESSION_CREATE]: {
    Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    priority: "i",
  },
  [SiteType.COLLECT_DATA]: {
    Accept: "application/x-clarity-gzip",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    Priority: "u=1, i",
  },
};

export class BrowserClient {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      maxRedirects: 0,
      // proxy: {
      //   host: "localhost",
      //   port: 8080,
      //   protocol: "http",
      // },
      validateStatus: (status) => {
        return status >= 200 && status < 400;
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });

    this.axiosInstance.interceptors.request.use((config) => {
      console.log("[Axios Request]", {
        url: config.url,
        method: config.method?.toUpperCase(),
        headers: config.headers,
        params: config.params,
        bodyLength: config.data?.length || 0,
      });
      return config;
    });
  }

  async create(
    siteType: SiteType,
    config?: AxiosRequestConfig,
  ): Promise<AxiosInstance> {
    const instance = axios.create({
      ...this.axiosInstance.defaults,
      headers: {
        ...this.axiosInstance.defaults.headers,
        common: {
          ...this.axiosInstance.defaults.headers.common,
          ...config?.headers,
          ...defaultHeaders[siteType],
        },
      },
    });

    // Add request logging
    instance.interceptors.request.use((config) => {
      console.log("[Axios Request]", {
        url: config.url,
        method: config.method?.toUpperCase(),
        headers: config.headers,
        params: config.params,
        bodyLength: config.data?.length || 0,
      });
      return config;
    });

    // Add response logging
    instance.interceptors.response.use((response) => {
      console.log("[Axios Response]", {
        status: response.status,
        headers: response.headers,
        data: response.data,
        url: response.config.url,
        method: response.config.method?.toUpperCase(),
      });
      return response;
    });

    return instance;
  }
}

export const browserClient = new BrowserClient();
