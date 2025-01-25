import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export enum SiteType {
  CLARITY_INJECT = "CLARITY_INJECT",
}

const defaultHeaders: Record<SiteType, Record<string, string>> = {
  [SiteType.CLARITY_INJECT]: {},
};

export class BrowserClient {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 5000,
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
