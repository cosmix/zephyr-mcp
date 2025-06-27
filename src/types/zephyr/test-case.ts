import type { Link, PagedList, ResourceId } from "./base";
import type { IssueLink, WebLink } from "./link";

interface TestCaseOwner {
  self: string;
  accountId: string;
}

interface TestCaseLinks {
  self: string;
  issues?: IssueLink[];
  webLinks?: WebLink[];
}

interface TestScriptLink {
  self: string;
}

export interface TestCase {
  id: number;
  key: string;
  name: string;
  project: ResourceId;
  folder?: ResourceId;
  status?: ResourceId;
  priority?: ResourceId;
  owner?: TestCaseOwner;
  createdOn: string;

  objective?: string | null;
  precondition?: string | null;
  estimatedTime?: number | null;
  labels?: string[];
  component?: ResourceId | null;

  links?: TestCaseLinks;

  testScript?: TestScriptLink;
  testSteps?: TestStep[];
  customFields?: Record<string, any>;
}

export interface TestCaseInput {
  name: string;
  projectKey: string;
  folderId?: number;
  statusId?: number;
  priorityId?: number;
  ownerId?: number;
  jiraIssueKey?: string;
  links?: Link[];
  parameters?: any;
  testScript?: TestScriptInput;
  testSteps?: TestStepsInput;
}

/**
 * Represents the input for updating an existing Test Case.
 * All fields are optional, allowing for partial updates.
 */
export interface TestCaseUpdateInput {
  name?: string;
  folderId?: number;
  statusId?: number;
  priorityId?: number;
  ownerId?: number;
  jiraIssueKey?: string;
  links?: Link[];
  parameters?: any; // Consider a more specific type if parameters structure is known
  testScript?: TestScriptInput;
  testSteps?: TestStepsInput;
}


export interface TestCaseList extends PagedList<TestCase> {}

export interface TestCaseVersionLink {
  id: number;
  key: string;
  name: string;
  version: number;
}

export interface TestScript {
  type: "STEP_BY_STEP" | "BDD" | "PLAIN";
  text?: string;
  steps?: TestStep[];
}

export interface TestScriptInput {
  type: "STEP_BY_STEP" | "BDD" | "PLAIN";
  text?: string;
  steps?: TestStepInput[];
}

export interface TestStep {
  id: number;
  description: string;
  expectedResult: string;
  testData?: string;
}

export interface TestStepInput {
  description: string;
  expectedResult: string;
  testData?: string;
}

export interface TestStepsList extends PagedList<TestStep> {}

export interface TestStepsInput {
  mode: "OVERWRITE" | "APPEND";
  testSteps: TestStepInput[];
}

export interface GetTestCaseArgs {
  testCaseKey: string;
}

export interface ListTestCasesArgs {
  projectKey?: string;
  folderId?: number;
  jiraIssueKey?: string;
}

export interface CreateTestCaseArgs {
  name: string;
  projectKey: string;
  folderId?: number;
  statusId?: number;
  priorityId?: number;
  ownerId?: number;
  jiraIssueKey?: string;
  links?: Link[];
  parameters?: any;
  testScript?: TestScriptInput;
  testSteps?: TestStepsInput;
}

export interface UpdateTestCaseArgs {
  testCaseKey: string;
  name?: string;
  folderId?: number;
  statusId?: number;
  priorityId?: number;
  ownerId?: number;
  jiraIssueKey?: string;
  links?: Link[];
  parameters?: any;
  testScript?: TestScriptInput;
  testSteps?: TestStepsInput;
}

export interface GetTestCaseLinksArgs {
  testCaseKey: string;
}

export interface CreateTestCaseIssueLinkArgs {
  testCaseKey: string;
  issueKey: string;
}

export interface CreateTestCaseWebLinkArgs {
  testCaseKey: string;
  url: string;
  description?: string;
}

export interface GetTestCaseTestScriptArgs {
  testCaseKey: string;
}

export interface CreateTestCaseTestScriptArgs {
  testCaseKey: string;
  type: "STEP_BY_STEP" | "BDD" | "PLAIN";
  text?: string;
  steps?: TestStepInput[];
}

export interface GetTestCaseTestStepsArgs {
  testCaseKey: string;
}

export interface CreateTestCaseTestStepsArgs {
  testCaseKey: string;
  steps: TestStepInput[];
}
