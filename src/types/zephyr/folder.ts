import type { Link, ProjectLink } from "./base";

export type FolderType = "TEST_CASE" | "TEST_CYCLE";

export interface Folder {
  id: string;
  name: string;
  description?: string;
  type: FolderType;
  project?: ProjectLink;
  parentFolder?: {
    id: string;
    name: string;
  };
  links?: Link[];
}

export interface FolderInput {
  name: string;
  description?: string;
  type: FolderType;
  projectId?: string; // Note: API expects projectKey, might need adjustment later if service uses this directly
  parentFolderId?: number;
}

export interface FolderList {
  startAt: number;
  maxResults: number;
  total: number;
  isLast: boolean;
  values: Folder[];
}

// Argument types for Folder tools
export interface GetFolderArgs {
  folderId: number;
}

export interface ListFoldersArgs {
  projectKey?: string;
  type?: FolderType;
}

export interface CreateFolderArgs {
  name: string;
  type: FolderType;
  projectKey: string;
  description?: string;
  parentFolderId?: number;
}
