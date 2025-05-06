export interface Priority {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface PriorityList {
  startAt: number;
  maxResults: number;
  total: number;
  isLast: boolean;
  values: Priority[];
}

// Argument types for Priority tools
export interface ListPrioritiesArgs {}
