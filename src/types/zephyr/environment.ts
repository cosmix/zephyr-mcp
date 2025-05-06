import type { PagedList } from "./base";

export interface Environment {
  id: string;
  name: string;
  description?: string;
}

// Argument types for Environment tools
export interface ListEnvironmentsArgs {}

export interface EnvironmentList extends PagedList<Environment> {}

export interface CreateEnvironmentInput {
  name: string;
  description?: string;
}

export interface UpdateEnvironmentInput {
  name?: string;
  description?: string;
}
