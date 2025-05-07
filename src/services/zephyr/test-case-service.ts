import type {
  Link,
  TestCase,
  TestCaseInput,
  TestCaseList,
  TestScript,
  TestScriptInput,
  TestStep,
  TestStepsInput,
  TestStepsList,
} from "../../types";
import { ZephyrBaseService } from "./base-service";

export class TestCaseService extends ZephyrBaseService {
  constructor(apiKey: string, baseUrl: string) {
    super(apiKey, baseUrl);
  }

  async getTestCase(testCaseKey: string): Promise<TestCase> {
    const response = await this.request<TestCase>(
      "GET",
      `/testcases/${testCaseKey}`,
    );
    return response;
  }

  async listTestCases(params?: {
    projectKey?: string;
    folderId?: number;
    maxResults?: number;
    startAt?: number;
  }): Promise<TestCaseList> {
    const response = await this.request<TestCaseList>(
      "GET",
      "testcases",
      undefined,
      params,
    );
    return response;
  }

  async createTestCase(testCaseInput: TestCaseInput): Promise<TestCase> {
    const response = await this.request<TestCase>(
      "POST",
      "testcases",
      testCaseInput,
    );
    return response;
  }

  async updateTestCase(
    testCaseKey: string,
    testCaseInput: TestCaseInput,
  ): Promise<TestCase> {
    const response = await this.request<TestCase>(
      "PUT",
      `testcases/${testCaseKey}`,
      testCaseInput,
    );
    return response;
  }

  async getTestCaseLinks(testCaseKey: string): Promise<Link[]> {
    const response = await this.request<Link[]>(
      "GET",
      `testcases/${testCaseKey}/links`,
    );
    return response;
  }

  async createTestCaseIssueLink(
    testCaseKey: string,
    issueLinkInput: any,
  ): Promise<Link> {
    const response = await this.request<Link>(
      "POST",
      `testcases/${testCaseKey}/links/issues`,
      issueLinkInput,
    );
    return response;
  }

  async createTestCaseWebLink(
    testCaseKey: string,
    webLinkInput: any,
  ): Promise<Link> {
    const response = await this.request<Link>(
      "POST",
      `testcases/${testCaseKey}/links/weblinks`,
      webLinkInput,
    );
    return response;
  }

  async getTestCaseTestScript(testCaseKey: string): Promise<TestScript> {
    const response = await this.request<TestScript>(
      "GET",
      `testcases/${testCaseKey}/testscript`,
    );
    return response;
  }

  async createTestCaseTestScript(
    testCaseKey: string,
    testScriptInput: TestScriptInput,
  ): Promise<TestScript> {
    const response = await this.request<TestScript>(
      "POST",
      `testcases/${testCaseKey}/testscript`,
      testScriptInput,
    );
    return response;
  }

  async getTestCaseTestSteps(testCaseKey: string): Promise<TestStepsList> {
    const maxResults = 100;
    let startAt = 0;
    let allSteps: TestStep[] = [];
    let isLast = false;
    let total = 0;
    let firstPage: TestStepsList | undefined = undefined;

    while (!isLast) {
      const response = await this.request<any>(
        "GET",
        `/testcases/${testCaseKey}/teststeps`,
        undefined,
        { maxResults, startAt },
      );
      if (!firstPage) firstPage = response;
      if (response.values) {
        allSteps = allSteps.concat(response.values);
      } else if (response.items) {
        allSteps = allSteps.concat(response.items);
      }
      total = response.total ?? allSteps.length;
      isLast =
        typeof response.isLast === "boolean"
          ? response.isLast
          : allSteps.length >= total;
      startAt += maxResults;
    }

    // Only include properties defined in TestStepsList
    return {
      ...firstPage,
      values: allSteps,
      total: allSteps.length,
      maxResults,
    } as TestStepsList;
  }

  async createTestCaseTestSteps(
    testCaseKey: string,
    testStepsInput: TestStepsInput,
  ): Promise<TestStep[]> {
    const response = await this.request<TestStep[]>(
      "POST",
      `testcases/${testCaseKey}/teststeps`,
      testStepsInput,
    );
    return response;
  }
}
