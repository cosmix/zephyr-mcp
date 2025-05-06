export interface IssueLink {
  id: string;
  type: "ISSUE";
  issueKey: string;
  issueType?: string;
  summary?: string;
  status?: string;
  url?: string;
}

export interface WebLink {
  id: string;
  type: "WEB";
  url: string;
  name?: string;
}

export interface IssueLinkInput {
  issueKey: string;
}

export interface WebLinkInput {
  url: string;
  name?: string;
}

export interface LinkList {
  total: number;
  offset: number;
  limit: number;
  links: (IssueLink | WebLink)[];
}

// Argument types for Link tools
export interface DeleteLinkArgs {
  linkId: number;
}
