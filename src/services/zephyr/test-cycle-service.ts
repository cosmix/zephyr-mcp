import type {
  Link,
  TestCycle,
  TestCycleInput,
  TestCycleList,
} from "../../types";
import { ZephyrBaseService } from "./base-service";

export class TestCycleService extends ZephyrBaseService {
  
  constructor(apiKey: string, baseUrl: string) {
    super(apiKey, baseUrl);
  }

  async getTestCycle(testCycleIdOrKey: string): Promise<TestCycle> {
    const response = await this.request<TestCycle>(
      "GET",
      `/testcycles/${testCycleIdOrKey}`, 
    );
    return response;
  }

  async listTestCycles(params?: {
    projectKey?: string;
    folderId?: number;
    maxResults?: number;
    startAt?: number;
  }): Promise<TestCycleList> {
    const response = await this.request<TestCycleList>(
      "GET",
      "/testcycles", 
      undefined,
      params,
    );
    return response;
  }

  async createTestCycle(testCycleInput: TestCycleInput): Promise<TestCycle> {
    const response = await this.request<TestCycle>(
      "POST",
      "/testcycles", 
      testCycleInput,
    );
    return response;
  }

  async updateTestCycle(
    testCycleIdOrKey: string,
    testCycleInput: TestCycleInput,
  ): Promise<TestCycle> {
    const response = await this.request<TestCycle>(
      "PUT",
      `/testcycles/${testCycleIdOrKey}`, 
      testCycleInput,
    );
    return response;
  }
}
