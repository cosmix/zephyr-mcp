import type {
  Link,
  ResourceId,
  PagedList,
  CreatedResource,
  KeyedCreatedResource,
} from "./base";
import type { TestCaseVersionLink } from "./test-case";
import type { TestCycleLink } from "./test-cycle";
import type { ProjectLink } from "./base";
import type { EnvironmentLink } from "./base";

export interface TestExecution {
  id: number;
  key: string;
  project: ProjectLink;
  testCase: TestCaseVersionLink;
  testCycle: TestCycleLink;
  status?: ResourceId;
  environment?: EnvironmentLink;
  owner?: ResourceId;
  createdDate: string;
  modifiedDate: string;
  executedDate?: string;
  jiraIssue?: Link;
  links?: Link[];
  testSteps?: TestExecutionStep[];
}

export interface TestExecutionInput {
  projectKey: string;
  testCaseKey: string;
  testCycleKey?: string;
  statusId?: number;
  environmentId?: number;
  ownerId?: number;
  executedDate?: string;
  jiraIssueKey?: string;
  links?: Link[];
  testSteps?: TestStepsUpdate;
}

export interface TestExecutionList extends PagedList<TestExecution> {}

export interface TestExecutionUpdate {
  statusId?: number;
  environmentId?: number;
  ownerId?: number;
  executedDate?: string;
  jiraIssueKey?: string;
  links?: Link[];
  testSteps?: TestStepsUpdate;
}

export interface TestExecutionStep {
  id: number;
  description: string;
  expectedResult: string;
  testData?: string;
  status?: ResourceId;
  actualResult?: string;
}

export interface TestStepsUpdate {
  mode: "OVERWRITE" | "APPEND";
  testSteps: TestExecutionStepInput[];
}

export interface TestExecutionStepInput {
  statusId?: number;
  actualResult?: string;
}

// Argument types for Test Execution tools
export interface GetTestExecutionArgs {
  testExecutionIdOrKey: string;
}

export interface ListTestExecutionsArgs {
  projectKey?: string;
  testCaseKey?: string;
  testCycleKey?: string;
  statusId?: number;
  environmentId?: number;
  ownerId?: number;
  jiraIssueKey?: string;
}

export interface CreateTestExecutionArgs {
  projectKey: string;
  testCaseKey: string;
  testCycleKey?: string;
  statusId?: number;
  environmentId?: number;
  ownerId?: number;
  executedDate?: string;
  jiraIssueKey?: string;
  links?: Link[];
  testSteps?: TestStepsUpdate;
}

export interface UpdateTestExecutionArgs {
  testExecutionIdOrKey: string;
  statusId?: number;
  environmentId?: number;
  ownerId?: number;
  executedDate?: string;
  jiraIssueKey?: string;
  links?: Link[];
  testSteps?: TestStepsUpdate;
}

export interface GetTestExecutionTestStepsArgs {
  testExecutionIdOrKey: string;
}

export interface UpdateTestExecutionTestStepsArgs {
  testExecutionIdOrKey: string;
  testSteps: TestStepsUpdate;
}
