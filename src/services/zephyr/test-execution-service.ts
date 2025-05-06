import type {
  TestExecution,
  TestExecutionInput,
  TestExecutionList,
  TestExecutionStep,
  TestExecutionUpdate,
  TestStepsUpdate
} from "../../types";
import { ZephyrBaseService } from "./base-service";

export class TestExecutionService extends ZephyrBaseService {

  constructor(apiKey: string, baseUrl: string) {
    super(apiKey, baseUrl);
  }

  async getTestExecution(testExecutionIdOrKey: string): Promise<TestExecution> {
    const response = await this.request<TestExecution>(
      "GET",
      `/testexecutions/${testExecutionIdOrKey}`, 
    );
    return response;
  }

  async listTestExecutions(params?: {
    projectKey?: string;
    testCycleKey?: string;
    maxResults?: number;
    startAt?: number;
  }): Promise<TestExecutionList> {
    const response = await this.request<TestExecutionList>(
      "GET",
      "/testexecutions", 
      undefined,
      params,
    );
    return response;
  }

  async createTestExecution(
    testExecutionInput: TestExecutionInput,
  ): Promise<TestExecution> {
    const response = await this.request<TestExecution>(
      "POST",
      "/testexecutions", 
      testExecutionInput,
    );
    return response;
  }

  async updateTestExecution(
    testExecutionIdOrKey: string,
    testExecutionUpdate: TestExecutionUpdate,
  ): Promise<TestExecution> {
    const response = await this.request<TestExecution>(
      "PUT",
      `/testexecutions/${testExecutionIdOrKey}`, 
      testExecutionUpdate,
    );
    return response;
  }

  async getTestExecutionTestSteps(
    testExecutionIdOrKey: string,
  ): Promise<TestExecutionStep[]> {
    const response = await this.request<TestExecutionStep[]>(
      "GET",
      `/testexecutions/${testExecutionIdOrKey}/teststeps`, 
    );
    return response;
  }

  async updateTestExecutionTestSteps(
    testExecutionIdOrKey: string,
    testStepsUpdate: TestStepsUpdate,
  ): Promise<TestExecutionStep[]> {
    const response = await this.request<TestExecutionStep[]>(
      "PUT",
      `/testexecutions/${testExecutionIdOrKey}/teststeps`, 
      testStepsUpdate,
    );
    return response;
  }
}
