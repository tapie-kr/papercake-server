import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import crypto from "crypto";
import axios from "axios";

interface CacheData {
  content: string;
  metadata: Record<string, any>;
  timestamp: number;
  etag?: string;
  lastModified?: string;
}

class CacheManager {
  private readonly CACHE_DIR: string;

  constructor(cacheDirName: string = "cache") {
    this.CACHE_DIR = path.join(process.cwd(), cacheDirName);
    this.initCacheDir();
  }

  private initCacheDir(): void {
    if (!existsSync(this.CACHE_DIR)) {
      mkdirSync(this.CACHE_DIR);
    }
  }

  public async getOrFetchClarityScript(version: string): Promise<{
    content: string;
    headers: Record<string, string>;
    cached: boolean;
  }> {
    const cacheKey = `clarity-${version}`;
    const cacheFile = path.join(this.CACHE_DIR, `${cacheKey}.js`);
    const metaFile = path.join(this.CACHE_DIR, `${cacheKey}.meta.json`);

    let metadata: Record<string, any> = {};
    if (existsSync(metaFile)) {
      metadata = JSON.parse(readFileSync(metaFile, "utf-8"));
    }

    const headers: Record<string, string> = {};
    if (existsSync(cacheFile) && metadata) {
      if (metadata.etag) {
        headers["If-None-Match"] = metadata.etag;
      }
      if (metadata.lastModified) {
        headers["If-Modified-Since"] = metadata.lastModified;
      }
    }

    try {
      const response = await axios.get(
        `https://www.clarity.ms/s/${version}/clarity.js`,
        {
          headers,
        },
      );

      if (response.status === 304 && existsSync(cacheFile)) {
        return {
          content: readFileSync(cacheFile, "utf-8"),
          headers: metadata.headers || {},
          cached: true,
        };
      }
      if (response.status === 200 && response.headers) {
        const content = response.data;
        const newMetadata = {
          headers: Object.fromEntries(
            Object.entries(response.headers).map(([k, v]) => [k, String(v)]),
          ),
          etag: response.headers["etag"]?.toString(),
          lastModified: response.headers["last-modified"]?.toString(),
          timestamp: Date.now(),
        };

        writeFileSync(cacheFile, content);
        writeFileSync(metaFile, JSON.stringify(newMetadata));

        return {
          content,
          headers: newMetadata.headers,
          cached: false,
        };
      }

      throw new Error(`Unexpected status: ${response.status}`);
    } catch (error) {
      if (existsSync(cacheFile)) {
        return {
          content: readFileSync(cacheFile, "utf-8"),
          headers: metadata.headers || {},
          cached: true,
        };
      }
      throw error;
    }
  }

  private getHash(key: string): string {
    return crypto.createHash("md5").update(key).digest("hex");
  }
}

export default CacheManager;
