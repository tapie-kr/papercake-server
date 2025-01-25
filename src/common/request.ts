import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export enum SiteType {
  CLARITY_INJECT = "CLARITY_INJECT",
  SESSION_CREATE = "SESSION_CREATE",
}

const defaultHeaders: Record<SiteType, Record<string, string>> = {
  [SiteType.CLARITY_INJECT]: {},
  [SiteType.SESSION_CREATE]: {
    Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    priority: "i",
  },
};

export class BrowserClient {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 5000,
      maxRedirects: 0,
      validateStatus: (status) => {
        return status >= 200 && status < 400;
      },
    });
  }

  async create(
    siteType: SiteType,
    config?: AxiosRequestConfig,
  ): Promise<AxiosInstance> {
    return axios.create({
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
  }
}

export const browserClient = new BrowserClient();
