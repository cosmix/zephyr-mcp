export type StatusType = "TEST_CASE" | "TEST_CYCLE" | "TEST_EXECUTION";

export interface Status {
  id: string;
  name: string;
  description?: string;
  type: StatusType;
  color?: string;
}

export interface StatusList {
  startAt: number;
  maxResults: number;
  total: number;
  isLast: boolean;
  values: Status[];
}

// Argument types for Status tools
export interface ListStatusesArgs {
  type?: StatusType;
  projectKey?: string;
}
