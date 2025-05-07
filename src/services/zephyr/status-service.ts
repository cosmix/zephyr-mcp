import { ZephyrBaseService } from "./base-service";
import type { StatusList, StatusType } from "../../types";

export class StatusService extends ZephyrBaseService {
  constructor(apiKey: string, baseUrl: string) {
    super(apiKey, baseUrl);
  }

  /**
   * List statuses with optional filtering by type and project.
   * @param params Optional parameters for filtering and pagination.
   * @returns Promise resolving to a list of statuses.
   */
  async listStatuses(params?: {
    type?: StatusType;
    projectKey?: string;
    maxResults?: number;
    startAt?: number;
  }): Promise<StatusList> {
    return this.request<StatusList>("GET", "/statuses", undefined, params);
  }
}
