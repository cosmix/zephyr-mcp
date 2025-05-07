import { ZephyrBaseService } from "./base-service";
import type {
  Folder,
  FolderInput,
  FolderList,
} from "../../types/zephyr/folder";

export class FolderService extends ZephyrBaseService {
  constructor(apiKey: string, baseUrl: string) {
    super(apiKey, baseUrl);
  }

  /**
   * Retrieve a specific folder by its ID
   * @param folderId The unique identifier of the folder
   * @returns Promise resolving to the Folder details
   */
  async getFolder(folderId: number): Promise<Folder> {
    return this.request<Folder>("GET", `/folders/${folderId}`);
  }

  /**
   * List folders with optional pagination and filtering
   * @param params Optional parameters for filtering and pagination
   * @returns Promise resolving to a list of folders
   */
  async listFolders(params?: {
    maxResults?: number;
    startAt?: number;
    query?: string;
    type?: "TEST_CASE" | "TEST_CYCLE";
    projectIdOrKey?: string;
  }): Promise<FolderList> {
    return this.request<FolderList>("GET", "/folders", undefined, params);
  }

  /**
   * Create a new folder
   * @param folderInput Details for creating the folder
   * @returns Promise resolving to the created Folder
   */
  async createFolder(folderInput: FolderInput): Promise<Folder> {
    return this.request<Folder>("POST", "/folders", folderInput);
  }
}
