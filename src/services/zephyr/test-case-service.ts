import type {
  Link,
  TestCase,
  TestCaseInput,
  TestCaseList,
  TestCaseUpdateInput,
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
    testCaseInput: TestCaseUpdateInput,
  ): Promise<TestCase> {
    try {
      if (Object.keys(testCaseInput).length === 0) {
        throw new Error("No fields provided for update.");
      }

      // First, get the current test case to merge with updates
      const currentTestCase = await this.getTestCase(testCaseKey);

      // Create the complete test case object by merging current data with updates
      // The Zephyr API requires a complete TestCase object for updates
      const updatePayload: any = {
        ...currentTestCase,
        // Apply updates, preserving structure expected by API
        name: testCaseInput.name ?? currentTestCase.name,
      };

      // Update specific fields if provided
      if (testCaseInput.folderId !== undefined) {
        updatePayload.folder = testCaseInput.folderId ? { id: testCaseInput.folderId } : null;
      }
      if (testCaseInput.statusId !== undefined) {
        updatePayload.status = { id: testCaseInput.statusId };
      }
      if (testCaseInput.priorityId !== undefined) {
        updatePayload.priority = { id: testCaseInput.priorityId };
      }
      if (testCaseInput.ownerId !== undefined) {
        updatePayload.owner = testCaseInput.ownerId ? { accountId: testCaseInput.ownerId } : null;
      }

      // Handle nested parameters if provided
      if (testCaseInput.parameters) {
        if (testCaseInput.parameters.objective !== undefined) {
          updatePayload.objective = testCaseInput.parameters.objective;
        }
        if (testCaseInput.parameters.precondition !== undefined) {
          updatePayload.precondition = testCaseInput.parameters.precondition;
        }
        if (testCaseInput.parameters.estimatedTime !== undefined) {
          updatePayload.estimatedTime = testCaseInput.parameters.estimatedTime;
        }
        if (testCaseInput.parameters.labels !== undefined) {
          updatePayload.labels = testCaseInput.parameters.labels;
        }
        if (testCaseInput.parameters.customFields !== undefined) {
          updatePayload.customFields = testCaseInput.parameters.customFields;
        }
      }

      const response = await this.request<TestCase>(
        "PUT",
        `testcases/${testCaseKey}`,
        updatePayload,
      );
      
      // If the API returns an empty object (no content), fetch the updated test case
      if (!response || Object.keys(response).length === 0) {
        const updatedTestCase = await this.getTestCase(testCaseKey);
        if (!updatedTestCase) {
          throw new Error(`Failed to retrieve updated test case ${testCaseKey}`);
        }
        return updatedTestCase;
      }
      
      return response;
    } catch (error) {
      // Re-throw McpErrors directly, but add context to other errors
      if (error instanceof Error && error.constructor.name === 'McpError') {
        throw error;
      }
      // Re-throw with more context for other errors
      throw new Error(
        `Failed to update test case ${testCaseKey}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
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
    // Transform simple input format to complex API format
    const transformedPayload = {
      mode: testStepsInput.mode,
      items: testStepsInput.testSteps.map(step => ({
        inline: {
          description: step.description,
          testData: step.testData || null,
          expectedResult: step.expectedResult,
          customFields: {},
          reflectRef: null,
        },
        testCase: null,
      })),
    };

    const response = await this.request<TestStep[]>(
      "POST",
      `testcases/${testCaseKey}/teststeps`,
      transformedPayload,
    );
    return response;
  }
}
