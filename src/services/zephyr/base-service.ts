import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";

type HeadersInit = Headers | Record<string, string> | [string, string][];

export abstract class ZephyrBaseService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    if (!apiKey) {
      throw new McpError(-32093, "Zephyr API key is required");
    }
    if (!baseUrl) {
      throw new McpError(-32094, "Zephyr Base URL is required");
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  protected async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body?: unknown,
    queryParams?: Record<string, string | number>,
  ): Promise<T> {
    // Ensure base URL ends with '/' and path does not start with '/' for clean concatenation
    const cleanBaseUrl = this.baseUrl.endsWith("/")
      ? this.baseUrl
      : this.baseUrl + "/";
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const fullUrlString = cleanBaseUrl + cleanPath;

    // Use URL object primarily for handling query parameters safely
    const url = new URL(fullUrlString);

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const headers: HeadersInit = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const requestOptions: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        let errorData: any = await response.text();
        try {
          errorData = JSON.parse(errorData);
        } catch (parseError) {}

        const errorCode =
          response.status === 401 || response.status === 403
            ? -32001
            : response.status === 404
              ? -32004
              : -38129;

        throw new McpError(
          errorCode,
          `Zephyr API Error: HTTP ${response.status}`,
          {
            status: response.status,
            error: errorData,

            requestedUrl: response.status === 404 ? url.toString() : undefined,
          },
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return (await response.json()) as T;
      }

      return undefined as T;
    } catch (error) {
      if (error instanceof McpError) {
        console.error(
          `[Zephyr MCP] McpError ${error.code}: ${error.message}`,
          error.data,
        );
        throw error;
      }

      console.error(
        `[Zephyr MCP] Unexpected error during request: Method=${method}, Path=${path}`,
        error,
      );
      throw new McpError(
        ErrorCode.InternalError,
        "Failed to complete request due to an unexpected error",
        {
          originalError: error instanceof Error ? error.message : String(error),
          path: path,
          method: method,
        },
      );
    }
  }
}
