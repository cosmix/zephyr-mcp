import { McpError } from "@modelcontextprotocol/sdk/types.js";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from "vitest";
import { ProjectService } from "../project-service";

const mockApiKey = "test-api-key";

describe("ProjectService", () => {
  let projectService: ProjectService;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    projectService = new ProjectService(
      mockApiKey,
      "https://mock-zephyr-api.com",
    );
  });

  describe("getProject", () => {
    it("should fetch a project by ID/Key successfully", async () => {
      const mockProject = { id: 1, key: "PROJ", name: "Test Project" };
      const projectIdOrKey = "PROJ";

      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockProject,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockProject),
      } as Response);

      const result = await projectService.getProject(projectIdOrKey);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );
      expect(result).toEqual(mockProject);
    });

    it("should throw McpError on API failure", async () => {
      const projectIdOrKey = "PROJ";
      const errorResponse = { message: "Not Found" };
      const status = 404;

      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        json: async () => errorResponse,
        status: status,
        statusText: "Not Found",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorResponse),
      } as Response);

      await expect(projectService.getProject(projectIdOrKey)).rejects.toThrow(
        McpError,
      );

      await expect(
        projectService.getProject(projectIdOrKey),
      ).rejects.toMatchObject({
        code: -32004,
        message: expect.stringContaining("Zephyr API Error: HTTP 404"),
        data: expect.objectContaining({ status: 404 }),
      });
    });
  });

  describe("listProjects", () => {
    it("should fetch a list of projects successfully", async () => {
      const mockProjects = {
        startAt: 0,
        maxResults: 1,
        total: 1,
        values: [{ id: 1, key: "PROJ", name: "Test Project" }],
      };

      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockProjects,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockProjects),
      } as Response);

      const result = await projectService.listProjects({});

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );
      expect(result).toEqual(mockProjects);
    });

    it("should fetch projects with pagination parameters", async () => {
      const mockProjects = {
        values: [],
        startAt: 10,
        maxResults: 50,
        total: 0,
      };
      const params = { maxResults: 50, startAt: 10 };

      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockProjects,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockProjects),
      } as Response);

      await projectService.listProjects(params);

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
      const errorResponse = { message: "Server Error" };
      const status = 500;

      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        json: async () => errorResponse,
        status: status,
        statusText: "Server Error",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorResponse),
      } as Response);

      await expect(projectService.listProjects({})).rejects.toThrow(McpError);
      await expect(projectService.listProjects({})).rejects.toMatchObject({
        code: -38129,
        message: expect.stringContaining("Zephyr API Error: HTTP 500"),
        data: expect.objectContaining({ status: 500 }),
      });
    });
  });
});
