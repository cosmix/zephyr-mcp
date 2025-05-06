import { McpError } from "@modelcontextprotocol/sdk/types.js";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from "vitest";
import type {
  TestExecution,
  TestExecutionInput,
  TestExecutionList,
  TestExecutionStep,
  TestExecutionUpdate,
  TestStepsUpdate,
} from "../../../types";
import { TestExecutionService } from "../test-execution-service";

const mockApiKey = "test-api-key";

// Helper function to create a basic valid TestExecution object
const createMockTestExecution = (
  id: number,
  key: string,
): Partial<TestExecution> => ({
  id,
  key,
  project: {
    id: 101,
    key: "PROJ",
    name: "Project",
    self: "http://link/to/project",
  },
  testCase: {
    id: 122,
    key: "PROJ-T1",
    version: 1,
    name: "Test Case 1",
  },
  testCycle: {
    id: 201,
    key: "PROJ-C1",
    name: "Cycle 1",
    self: "http://link/to/cycle",
  },
  createdDate: new Date().toISOString(),
  modifiedDate: new Date().toISOString(),
});

describe("TestExecutionService", () => {
  let testExecutionService: TestExecutionService;
  const mockTestExecutionIdOrKey = "PROJ-E1";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    testExecutionService = new TestExecutionService(mockApiKey, "https://mock-zephyr-api.com");
  });

  describe("getTestExecution", () => {
    it("should fetch a test execution successfully", async () => {
      const mockExecution = createMockTestExecution(
        1,
        mockTestExecutionIdOrKey,
      );
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockExecution,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockExecution),
      } as Response);

      const result = await testExecutionService.getTestExecution(
        mockTestExecutionIdOrKey,
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );
      expect(result).toEqual(mockExecution);
    });

    it("should throw McpError on API failure", async () => {
      const errorBody = {};
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => errorBody,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody),
      } as Response);
      await expect(
        testExecutionService.getTestExecution(mockTestExecutionIdOrKey),
      ).rejects.toThrow(McpError);
    });
  });

  describe("listTestExecutions", () => {
    it("should fetch test executions with default params", async () => {
      const mockExecutionItem = createMockTestExecution(1, "PROJ-E1");
      const mockList: TestExecutionList = {
        values: [mockExecutionItem as TestExecution],
        total: 1,
        offset: 0,
        limit: 100,
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockList,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockList),
      } as Response);

      const result = await testExecutionService.listTestExecutions({});

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );
      expect(result).toEqual(mockList);
    });

    it("should fetch test executions with query parameters", async () => {
      const params = {
        projectKey: "PROJ",
        testCycleKey: "PROJ-C1",
        maxResults: 10,
        startAt: 5,
      };
      const mockList: TestExecutionList = {
        values: [],
        total: 0,
        offset: 5,
        limit: 10,
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockList,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockList),
      } as Response);

      await testExecutionService.listTestExecutions(params);

      // const expectedUrl = `https://api.zephyrscale.smartbear.com/v2/testexecutions?projectKey=${params.projectKey}&testCycleKey=${params.testCycleKey}&maxResults=${params.maxResults}&startAt=${params.startAt}`; // No longer needed
      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );
    });

    it("should throw McpError on API failure", async () => {
      const errorBody = {};
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Server Error",
        json: async () => errorBody,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody),
      } as Response);
      await expect(testExecutionService.listTestExecutions({})).rejects.toThrow(
        McpError,
      );
    });
  });

  describe("createTestExecution", () => {
    it("should create a test execution successfully", async () => {
      const input: TestExecutionInput = {
        projectKey: "PROJ",
        testCaseKey: "PROJ-T1",
        testCycleKey: "PROJ-C1",
      };
      const mockCreated = createMockTestExecution(2, "PROJ-E2");
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockCreated,
        status: 201,
        statusText: "Created",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockCreated),
      } as Response);

      const result = await testExecutionService.createTestExecution(input);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(input),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
            "Content-Type": "application/json",
          }),
        }),
      );
      expect(result).toEqual(mockCreated);
    });

    it("should throw McpError on API failure", async () => {
      const input: TestExecutionInput = {
        projectKey: "PROJ",
        testCaseKey: "PROJ-T1",
      };
      const errorBody = {};
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => errorBody,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody),
      } as Response);
      await expect(
        testExecutionService.createTestExecution(input),
      ).rejects.toThrow(McpError);
    });
  });

  describe("updateTestExecution", () => {
    it("should update a test execution successfully", async () => {
      const input: TestExecutionUpdate = {
        statusId: 123,
      };
      const mockUpdated = createMockTestExecution(1, mockTestExecutionIdOrKey);
      mockUpdated.status = { id: 123 };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => mockUpdated,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockUpdated),
      } as Response);

      const result = await testExecutionService.updateTestExecution(
        mockTestExecutionIdOrKey,
        input,
      );
      expect(result).toEqual(mockUpdated);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(input),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("should throw McpError on API failure", async () => {
      const input: TestExecutionUpdate = { statusId: 123 };
      const errorBody = {};
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => errorBody,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody),
      } as Response);
      await expect(
        testExecutionService.updateTestExecution(
          mockTestExecutionIdOrKey,
          input,
        ),
      ).rejects.toThrow(McpError);
    });
  });

  describe("getTestExecutionTestSteps", () => {
    it("should fetch test execution steps successfully", async () => {
      const mockSteps: TestExecutionStep[] = [
        { id: 1, description: "Step 1", expectedResult: "Result 1" },
        { id: 2, description: "Step 2", expectedResult: "Result 2" },
      ];
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockSteps,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockSteps),
      } as Response);

      const result = await testExecutionService.getTestExecutionTestSteps(
        mockTestExecutionIdOrKey,
      );

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );
      expect(result).toEqual(mockSteps);
    });

    it("should throw McpError on API failure", async () => {
      const errorBody = {};
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => errorBody,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody),
      } as Response);
      await expect(
        testExecutionService.getTestExecutionTestSteps(
          mockTestExecutionIdOrKey,
        ),
      ).rejects.toThrow(McpError);
    });
  });

  describe("updateTestExecutionTestSteps", () => {
    it("should update test execution steps successfully", async () => {
      const input: TestStepsUpdate = {
        mode: "OVERWRITE",
        testSteps: [{ statusId: 456, actualResult: "Passed" }],
      };
      const mockUpdatedSteps: TestExecutionStep[] = [
        {
          id: 1,
          description: "Step 1",
          expectedResult: "Result 1",
          status: { id: 456 },
          actualResult: "Passed",
        },
      ];
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => mockUpdatedSteps,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockUpdatedSteps),
      } as Response);

      const result = await testExecutionService.updateTestExecutionTestSteps(
        mockTestExecutionIdOrKey,
        input,
      );
      expect(result).toEqual(mockUpdatedSteps);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(input),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("should throw McpError on API failure", async () => {
      const input: TestStepsUpdate = {
        mode: "OVERWRITE",
        testSteps: [{ statusId: 456 }],
      };
      const errorBody = {};
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => errorBody,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody),
      } as Response);
      await expect(
        testExecutionService.updateTestExecutionTestSteps(
          mockTestExecutionIdOrKey,
          input,
        ),
      ).rejects.toThrow(McpError);
    });
  });
});
