import { McpError } from "@modelcontextprotocol/sdk/types.js";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from "vitest";
import { EnvironmentService } from "../environment-service";

const mockApiKey = "test-api-key";
const mockBaseUrl = "https://mock-zephyr-api.com"; // Added mock base URL

describe("EnvironmentService", () => {
  let environmentService: EnvironmentService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());

    environmentService = new EnvironmentService(mockApiKey, mockBaseUrl);
  });

  describe("listEnvironments", () => {
    it("should fetch a list of environments successfully with default params", async () => {
      const mockEnvironmentList = {
        total: 1,
        offset: 0,
        limit: 1,
        items: [{ id: "30", name: "Production", description: "Prod Env" }],
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockEnvironmentList,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockEnvironmentList),
      } as Response);

      const result = await environmentService.listEnvironments({});

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );

      expect(result).toEqual(mockEnvironmentList);
    });

    it("should fetch environments with pagination parameters if supported", async () => {
      const params = { maxResults: 50, startAt: 10 };
      const mockEnvironmentList = {
        items: [],
        offset: 10,
        limit: 50,
        total: 0,
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockEnvironmentList,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockEnvironmentList),
      } as Response);

      await environmentService.listEnvironments(params);

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

    it("should throw McpError on API failure for listEnvironments", async () => {
      const errorBody = { message: "Failed to fetch environments" };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Server Error",
        json: async () => errorBody,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody),
      } as Response);
      await expect(environmentService.listEnvironments({})).rejects.toThrow(
        McpError,
      );
      await expect(
        environmentService.listEnvironments({}),
      ).rejects.toMatchObject({
        code: -38129,
        message: expect.stringContaining("Zephyr API Error: HTTP 500"),
        data: expect.objectContaining({ status: 500 }),
      });
    });
  });
});
