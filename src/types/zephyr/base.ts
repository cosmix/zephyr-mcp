

export interface Link {
  id: number; 
  self: string;
}

export interface ResourceId {
  id: number; 
}

export interface PagedList<T> {
  total: number;
  offset: number;
  limit: number;
  values: T[]; 
}

export interface McpError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface CreatedResource {
  id: string;
}

export interface KeyedCreatedResource extends CreatedResource {
  key: string;
}

export interface JiraUserLink extends Link {
  name: string;
  displayName: string;
}

export interface ProjectLink extends Link {
  key: string;
  name: string;
}

export interface FolderLink extends Link {
  name: string;
  type: string;
}

export interface StatusLink extends Link {
  name: string;
  description?: string;
}

export interface PriorityLink extends Link {
  name: string;
  description?: string;
}

export interface EnvironmentLink extends Link {
  name: string;
  description?: string;
}
