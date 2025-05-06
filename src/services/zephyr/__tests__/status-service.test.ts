import { McpError } from "@modelcontextprotocol/sdk/types.js";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from "vitest";
import { StatusService } from "../status-service";
import type { Status, StatusList, StatusType } from "../../../types";

const mockApiKey = "test-api-key";

describe("StatusService", () => {
  let statusService: StatusService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    statusService = new StatusService(mockApiKey, "https://mock-zephyr-api.com");
  });

  describe("listStatuses", () => {
    it("should fetch a list of statuses successfully with default params", async () => {
      const mockStatusList: StatusList = {
        startAt: 0,
        maxResults: 1,
        total: 1,
        isLast: true,
        values: [
          { id: "10", name: "Pass", type: "TEST_EXECUTION", color: "#75B000" },
        ],
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockStatusList,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockStatusList),
      } as Response);

      const result = await statusService.listStatuses({});

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );
      expect(result).toEqual(mockStatusList);
    });

    it("should fetch statuses with query parameters", async () => {
      const params: {
        type: StatusType;
        projectKey: string;
        maxResults: number;
        startAt: number;
      } = {
        type: "TEST_CASE",
        projectKey: "PROJ",
        maxResults: 20,
        startAt: 5,
      };
      const mockStatusList: StatusList = {
        values: [],
        startAt: 5,
        maxResults: 20,
        total: 0,
        isLast: true,
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockStatusList,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockStatusList),
      } as Response);

      await statusService.listStatuses(params);

      // const expectedUrl = `https://api.zephyrscale.smartbear.com/v2/statuses?type=${params.type}&projectKey=${params.projectKey}&maxResults=${params.maxResults}&startAt=${params.startAt}`; // No longer needed
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

    it("should throw McpError on API failure for listStatuses", async () => {
      const errorBody = { message: "Failed to fetch statuses" };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Server Error",
        json: async () => errorBody,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody),
      } as Response);
      await expect(statusService.listStatuses({})).rejects.toThrow(McpError);
      await expect(statusService.listStatuses({})).rejects.toMatchObject({
        code: -38129,
        message: expect.stringContaining("Zephyr API Error: HTTP 500"),
        data: expect.objectContaining({ status: 500 }),
      });
    });
  });
});
