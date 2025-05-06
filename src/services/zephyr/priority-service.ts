import { ZephyrBaseService } from "./base-service";
import type { PriorityList } from "../../types/zephyr/priority"; 

export class PriorityService extends ZephyrBaseService {
  
  constructor(apiKey: string, baseUrl: string) {
    super(apiKey, baseUrl);
  }

  /**
   * List priorities with optional pagination.
   * @param params Optional parameters for pagination.
   * @returns Promise resolving to a list of priorities.
   */
  async listPriorities(params?: {
    maxResults?: number;
    startAt?: number;
  }): Promise<PriorityList> {
    return this.request<PriorityList>("GET", "/priorities", undefined, params);
  }
}
