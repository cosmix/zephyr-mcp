import { ZephyrBaseService } from "./base-service";

export class LinkService extends ZephyrBaseService {
  constructor(apiKey: string, baseUrl: string) {
    super(apiKey, baseUrl);
  }

  /**
   * Delete a link by its ID.
   * @param linkId The unique identifier of the link to delete.
   * @returns Promise resolving when the deletion is complete.
   */
  async deleteLink(linkId: number): Promise<void> {
    await this.request<void>("DELETE", `/links/${linkId}`);
  }
}
