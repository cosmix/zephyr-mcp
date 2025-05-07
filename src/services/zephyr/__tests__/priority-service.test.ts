import { McpError } from "@modelcontextprotocol/sdk/types.js";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from "vitest";
import type { PriorityList } from "../../../types";
import { PriorityService } from "../priority-service";

const mockApiKey = "test-api-key";

describe("PriorityService", () => {
  let priorityService: PriorityService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    priorityService = new PriorityService(
      mockApiKey,
      "https://mock-zephyr-api.com",
    );
  });

  describe("listPriorities", () => {
    it("should fetch a list of priorities successfully with default params", async () => {
      const mockPriorityList: PriorityList = {
        startAt: 0,
        maxResults: 1,
        total: 1,
        isLast: true,
        values: [{ id: "20", name: "High", color: "#FF0000" }],
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockPriorityList,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockPriorityList),
      } as Response);

      const result = await priorityService.listPriorities({});

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );
      expect(result).toEqual(mockPriorityList);
    });

    it("should fetch priorities with pagination parameters if supported", async () => {
      const params = { maxResults: 50, startAt: 10 };
      const mockPriorityList: PriorityList = {
        values: [],
        startAt: 10,
        maxResults: 50,
        total: 0,
        isLast: true,
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockPriorityList,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockPriorityList),
      } as Response);

      await priorityService.listPriorities(params);

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

    it("should throw McpError on API failure for listPriorities", async () => {
      const errorBody = { message: "Failed to fetch priorities" };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Server Error",
        json: async () => errorBody,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody),
      } as Response);
      await expect(priorityService.listPriorities({})).rejects.toThrow(
        McpError,
      );
      await expect(priorityService.listPriorities({})).rejects.toMatchObject({
        code: -38129,
        message: expect.stringContaining("Zephyr API Error: HTTP 500"),
        data: expect.objectContaining({ status: 500 }),
      });
    });
  });
});
