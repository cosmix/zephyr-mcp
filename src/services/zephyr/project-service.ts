import type { Project, ProjectList } from "../../types/zephyr/project";
import { ZephyrBaseService } from "./base-service";

export class ProjectService extends ZephyrBaseService {
  constructor(apiKey: string, baseUrl: string) {
    super(apiKey, baseUrl);
  }

  /**
   * Retrieve a specific project by its ID or key
   * @param projectIdOrKey The unique identifier or key of the project
   * @returns Promise resolving to the Project details
   */
  async getProject(projectIdOrKey: string): Promise<Project> {
    return this.request<Project>("GET", `/projects/${projectIdOrKey}`);
  }

  /**
   * List projects with optional pagination and filtering
   * @param params Optional parameters for filtering and pagination
   * @returns Promise resolving to a list of projects
   */
  async listProjects(params?: {
    maxResults?: number;
    startAt?: number;
    query?: string;
  }): Promise<ProjectList> {
    return this.request<ProjectList>("GET", "/projects", undefined, params);
  }
}
