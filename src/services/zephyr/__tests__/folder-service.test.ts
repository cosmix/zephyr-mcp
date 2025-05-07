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
  Folder,
  FolderInput,
  FolderList,
  FolderType,
} from "../../../types";
import { FolderService } from "../folder-service";

const mockApiKey = "test-api-key";
const mockBaseUrl = "https://mock-zephyr-api.com";

describe("FolderService", () => {
  let folderService: FolderService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());

    folderService = new FolderService(mockApiKey, mockBaseUrl);
  });

  describe("getFolder", () => {
    it("should fetch a folder successfully", async () => {
      const mockFolder: Folder = {
        id: "123",
        name: "Test Folder",

        project: {
          id: 1,
          key: "PROJ",
          name: "Project 1",
          self: "/projects/1",
        },
        type: "TEST_CASE",
      };
      const folderId = 123;

      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockFolder,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockFolder),
      } as Response);

      const result = await folderService.getFolder(folderId);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );
      expect(result).toEqual(mockFolder);
    });

    it("should throw McpError on API failure for getFolder", async () => {
      const folderId = 123;
      const errorBody = { message: "Folder not found" };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => errorBody,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody),
      } as Response);
      await expect(folderService.getFolder(folderId)).rejects.toThrow(McpError);

      await expect(folderService.getFolder(folderId)).rejects.toMatchObject({
        code: -32004,
        message: expect.stringContaining("Zephyr API Error: HTTP 404"),
        data: expect.objectContaining({ status: 404 }),
      });
    });
  });

  describe("listFolders", () => {
    it("should fetch a list of folders successfully with default params", async () => {
      const mockFolderList: FolderList = {
        startAt: 0,
        maxResults: 1,
        total: 1,
        isLast: true,
        values: [
          {
            id: "123",
            name: "Test Folder",

            project: {
              id: 1,
              key: "PROJ",
              name: "Project 1",
              self: "/projects/1",
            },
            type: "TEST_CASE",
          },
        ],
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockFolderList,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockFolderList),
      } as Response);

      const result = await folderService.listFolders({});

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );
      expect(result).toEqual(mockFolderList);
    });

    it("should fetch folders with query parameters", async () => {
      const params: {
        projectIdOrKey: string;
        type: FolderType;
        maxResults: number;
        startAt: number;
      } = {
        projectIdOrKey: "PROJ",
        type: "TEST_CYCLE",
        maxResults: 50,
        startAt: 10,
      };
      const mockFolderList: FolderList = {
        values: [],
        startAt: 10,
        maxResults: 50,
        total: 0,
        isLast: true,
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockFolderList,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockFolderList),
      } as Response);

      await folderService.listFolders(params);

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

    it("should throw McpError on API failure for listFolders", async () => {
      const errorBody = { message: "Internal server error" };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Server Error",
        json: async () => errorBody,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody),
      } as Response);
      await expect(folderService.listFolders({})).rejects.toThrow(McpError);
      await expect(folderService.listFolders({})).rejects.toMatchObject({
        code: -38129,
        message: expect.stringContaining("Zephyr API Error: HTTP 500"),
        data: expect.objectContaining({ status: 500 }),
      });
    });
  });

  describe("createFolder", () => {
    it("should create a folder successfully", async () => {
      const folderInput: FolderInput = {
        name: "New Folder",
        projectId: "1", // Changed back to string
        type: "TEST_CASE",
      };
      const mockCreatedFolder: Folder = {
        id: "123",
        name: "New Folder",

        project: {
          id: 1,
          key: "PROJ",
          name: "Project 1",
          self: "/projects/1",
        },
        type: "TEST_CASE",
      };

      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockCreatedFolder,
        status: 201,
        statusText: "Created",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockCreatedFolder),
      } as Response);

      const result = await folderService.createFolder(folderInput);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(folderInput),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
            "Content-Type": "application/json",
          }),
        }),
      );
      expect(result).toEqual(mockCreatedFolder);
    });

    it("should throw McpError on API failure for createFolder", async () => {
      const folderInput: FolderInput = {
        name: "New Folder",
        projectId: "1",
        type: "TEST_CASE",
      };
      const errorBody = { message: "Invalid input" };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => errorBody,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody),
      } as Response);
      await expect(folderService.createFolder(folderInput)).rejects.toThrow(
        McpError,
      );
      await expect(
        folderService.createFolder(folderInput),
      ).rejects.toMatchObject({
        code: -38129,
        message: expect.stringContaining("Zephyr API Error: HTTP 400"),
        data: expect.objectContaining({ status: 400 }),
      });
    });
  });
});
