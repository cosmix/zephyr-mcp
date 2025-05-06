import type {
  Link,
  ResourceId,
  PagedList,
  CreatedResource,
  KeyedCreatedResource,
  FolderLink,
  ProjectLink,
} from "./base";

export interface TestCycle {
  id: number;
  key: string;
  name: string;
  project: ProjectLink;
  folder?: FolderLink;
  status?: ResourceId;
  owner?: ResourceId;
  createdDate: string;
  modifiedDate: string;
  startDate?: string;
  endDate?: string;
  jiraIssue?: Link;
  links?: Link[];
  // Add other relevant fields based on OpenAPI spec
}

export interface TestCycleInput {
  name: string;
  projectKey: string;
  folderId?: number;
  statusId?: number;
  ownerId?: number;
  startDate?: string;
  endDate?: string;
  jiraIssueKey?: string;
  links?: Link[]; // TODO: Define LinkInput type if needed
  // Add other relevant fields based on OpenAPI spec
}

export interface TestCycleList extends PagedList<TestCycle> {}

export interface TestCycleLink extends Link {
  key: string;
  name: string;
}

// Argument types for Test Cycle tools
export interface GetTestCycleArgs {
  testCycleIdOrKey: string;
}

export interface ListTestCyclesArgs {
  projectKey?: string;
  folderId?: number;
  jiraIssueKey?: string;
  // Add other optional filter/pagination parameters based on API spec
}

export interface CreateTestCycleArgs {
  name: string;
  projectKey: string;
  folderId?: number;
  statusId?: number;
  ownerId?: number;
  startDate?: string;
  endDate?: string;
  jiraIssueKey?: string;
  links?: Link[];
}

export interface UpdateTestCycleArgs {
  testCycleIdOrKey: string;
  name?: string;
  folderId?: number;
  statusId?: number;
  ownerId?: number;
  startDate?: string;
  endDate?: string;
  jiraIssueKey?: string;
  links?: Link[];
}
