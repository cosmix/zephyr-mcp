import type { Link } from "./base";

export interface Project {
  id: string;
  key: string;
  name: string;
  description?: string;
  url?: string;
  lead?: {
    id: string;
    name: string;
    email?: string;
  };
  type?: "CLASSIC" | "SCRUM" | "KANBAN";
  links?: Link[];
}

export interface ProjectList {
  startAt: number;
  maxResults: number;
  total: number;
  isLast: boolean;
  values: Project[];
}

// Argument types for Project tools
export interface GetProjectArgs {
  projectIdOrKey: string;
}

export interface ListProjectsArgs {}
