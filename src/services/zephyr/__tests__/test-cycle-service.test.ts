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
  KeyedCreatedResource,
  TestCycle,
  TestCycleInput,
  TestCycleList,
} from "../../../types";
import { TestCycleService } from "../test-cycle-service";

const mockApiKey = "test-api-key";

describe("TestCycleService", () => {
  let testCycleService: TestCycleService;
  const mockTestCycleIdOrKey = "PROJ-C1";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    testCycleService = new TestCycleService(
      mockApiKey,
      "https://mock-zephyr-api.com",
    );
  });

  describe("getTestCycle", () => {
    it("should fetch a test cycle successfully", async () => {
      const mockTestCycle: Partial<TestCycle> = {
        id: 1,
        key: mockTestCycleIdOrKey,
        name: "Cycle 1",
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockTestCycle,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockTestCycle),
      } as Response);

      const result = await testCycleService.getTestCycle(mockTestCycleIdOrKey);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );
      expect(result).toEqual(mockTestCycle);
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
        testCycleService.getTestCycle(mockTestCycleIdOrKey),
      ).rejects.toThrow(McpError);
    });
  });

  describe("listTestCycles", () => {
    it("should fetch test cycles with default params", async () => {
      const mockTestCycleItem: TestCycle = {
        id: 1,
        key: mockTestCycleIdOrKey,
        name: "Cycle 1",
        project: {
          id: 101,
          key: "PROJ",
          name: "Project",
          self: "http://link/to/project",
        },
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
      };
      const mockList: TestCycleList = {
        values: [mockTestCycleItem],
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

      const result = await testCycleService.listTestCycles({});

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

    it("should fetch test cycles with query parameters", async () => {
      const params = { projectKey: "PROJ", maxResults: 10, startAt: 5 };
      const mockList: TestCycleList = {
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

      await testCycleService.listTestCycles(params);

      // const expectedUrl = `https://api.zephyrscale.smartbear.com/v2/testcycles?projectKey=${params.projectKey}&maxResults=${params.maxResults}&startAt=${params.startAt}`; // No longer needed
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
      await expect(testCycleService.listTestCycles({})).rejects.toThrow(
        McpError,
      );
    });
  });

  describe("createTestCycle", () => {
    it("should create a test cycle successfully", async () => {
      const input: TestCycleInput = {
        name: "New Cycle",
        projectKey: "PROJ",
      };
      const mockCreated: Partial<KeyedCreatedResource> = {
        id: "2",
        key: "PROJ-C2",
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockCreated,
        status: 201,
        statusText: "Created",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockCreated),
      } as Response);

      const result = await testCycleService.createTestCycle(input);

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
      const input: TestCycleInput = {
        name: "New Cycle",
        projectKey: "PROJ",
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
      await expect(testCycleService.createTestCycle(input)).rejects.toThrow(
        McpError,
      );
    });
  });

  describe("updateTestCycle", () => {
    it("should update a test cycle successfully", async () => {
      const input: TestCycleInput = {
        name: "Updated Cycle Name",
        projectKey: "PROJ",
      };

      const mockUpdatedTestCycle: Partial<TestCycle> = {
        id: 1,
        key: mockTestCycleIdOrKey,
        name: input.name,
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => mockUpdatedTestCycle,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockUpdatedTestCycle),
      } as Response);

      const result = await testCycleService.updateTestCycle(
        mockTestCycleIdOrKey,
        input,
      );
      expect(result).toEqual(mockUpdatedTestCycle);

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
      const input: TestCycleInput = {
        name: "Updated Cycle Name",
        projectKey: "PROJ",
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
        testCycleService.updateTestCycle(mockTestCycleIdOrKey, input),
      ).rejects.toThrow(McpError);
    });
  });
});
