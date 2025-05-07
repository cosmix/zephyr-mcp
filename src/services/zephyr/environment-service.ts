import { ZephyrBaseService } from "./base-service";
import type { EnvironmentList } from "../../types/zephyr/environment";

export class EnvironmentService extends ZephyrBaseService {
  constructor(apiKey: string, baseUrl: string) {
    super(apiKey, baseUrl);
  }

  /**
   * List environments with optional pagination.
   * @param params Optional parameters for pagination.
   * @returns Promise resolving to a list of environments.
   */
  async listEnvironments(params?: {
    maxResults?: number;
    startAt?: number;
  }): Promise<EnvironmentList> {
    return this.request<EnvironmentList>(
      "GET",
      "/environments",
      undefined,
      params,
    );
  }
}
