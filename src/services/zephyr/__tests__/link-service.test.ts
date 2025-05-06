import { McpError } from "@modelcontextprotocol/sdk/types.js";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from "vitest";
import { LinkService } from "../link-service";

const mockApiKey = "test-api-key";
const mockBaseUrl = "https://mock-zephyr-api.com";

describe("LinkService", () => {
  let linkService: LinkService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    linkService = new LinkService(mockApiKey, mockBaseUrl);
  });

  describe("deleteLink", () => {
    it("should delete a link successfully", async () => {
      const linkId = 12345;

      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 204,
        statusText: "No Content",

        json: async () => undefined,
        text: async () => "",
        headers: new Headers(),
      } as Response);

      await expect(linkService.deleteLink(linkId)).resolves.toBeUndefined();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );
    });

    it("should throw McpError on API failure for deleteLink", async () => {
      const linkId = 12345;
      const errorBody = { message: "Link not found" };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => errorBody,
        text: async () => JSON.stringify(errorBody),
        headers: new Headers({ "content-type": "application/json" }),
      } as Response);

      await expect(linkService.deleteLink(linkId)).rejects.toThrow(McpError);
      await expect(linkService.deleteLink(linkId)).rejects.toMatchObject({
        code: -32004,
        message: expect.stringContaining("Zephyr API Error: HTTP 404"),
        data: expect.objectContaining({ status: 404 }),
      });
    });

    it("should throw McpError on network failure", async () => {
      const linkId = 12345;
      const networkError = new Error("Network connection failed");
      (fetch as MockedFunction<typeof fetch>).mockRejectedValue(networkError);

      await expect(linkService.deleteLink(linkId)).rejects.toThrow(McpError);
      await expect(linkService.deleteLink(linkId)).rejects.toMatchObject({
        code: -32603,
        message: expect.stringContaining("Failed to complete request"),
        data: expect.objectContaining({
          originalError: networkError.message,
          method: "DELETE",
          path: `/links/${linkId}`,
        }),
      });
    });
  });
});
