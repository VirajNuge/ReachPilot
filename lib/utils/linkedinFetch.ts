import https from "node:https";

export interface LinkedInFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: string | Buffer | ArrayBuffer;
  timeout?: number;
}

export async function linkedinFetch(
  url: string,
  options: LinkedInFetchOptions = {}
): Promise<{ ok: boolean; status: number; statusText: string; json: () => Promise<any>; text: () => Promise<string> }> {
  const parsed = new URL(url);
  const method = options.method || "GET";
  const timeout = options.timeout || 15000;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method,
        family: 4, // Force IPv4 to prevent hanging on Windows!
        headers: options.headers || {},
        timeout,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          
          const response = {
            ok: res.statusCode ? res.statusCode >= 200 && res.statusCode < 300 : false,
            status: res.statusCode || 0,
            statusText: res.statusMessage || "",
            text: async () => buffer.toString("utf8"),
            json: async () => {
              const text = buffer.toString("utf8");
              return text ? JSON.parse(text) : {};
            },
          };
          resolve(response);
        });
      }
    );

    req.on("timeout", () => req.destroy(new Error(`linkedinFetch timeout (${timeout}ms)`)));
    req.on("error", reject);

    if (options.body) {
      if (options.body instanceof ArrayBuffer) {
        req.write(Buffer.from(options.body));
      } else {
        req.write(options.body);
      }
    }
    req.end();
  });
}
