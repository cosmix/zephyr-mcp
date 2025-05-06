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
  TestCase,
  TestCaseInput,
  TestCaseList,
  LinkList,
  IssueLinkInput,
  WebLinkInput,
  Link,
  TestScript,
  TestScriptInput,
  TestStepsList,
  TestStepsInput,
  TestStep,
} from "../../../types";
import { TestCaseService } from "../test-case-service";

const mockApiKey = "test-api-key";

describe("TestCaseService", () => {
  let testCaseService: TestCaseService;
  const mockTestCaseKey = "PROJ-T1";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    testCaseService = new TestCaseService(mockApiKey, "https://mock-zephyr-api.com");
  });

  describe("getTestCase", () => {
    it("should fetch a test case successfully", async () => {
      const mockTestCase: Partial<TestCase> = {
        id: 1,
        key: mockTestCaseKey,
        name: "Test Case 1",
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockTestCase,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockTestCase),
      } as Response);

      const result = await testCaseService.getTestCase(mockTestCaseKey);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );
      expect(result).toEqual(mockTestCase);
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
        testCaseService.getTestCase(mockTestCaseKey),
      ).rejects.toThrow(McpError);
    });
  });

  describe("listTestCases", () => {
    it("should fetch test cases with default params", async () => {
      const mockTestCaseItem: TestCase = {
        id: 1,
        key: mockTestCaseKey,
        name: "Test Case 1",
        project: { id: "PROJ-ID" },
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
      };
      const mockList: Partial<TestCaseList> = {
        items: [mockTestCaseItem],
        total: 1,
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockList,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockList),
      } as Response);

      const result = await testCaseService.listTestCases({});

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

    it("should fetch test cases with query parameters", async () => {
      const params = { projectKey: "PROJ", maxResults: 10, startAt: 5 };

      const mockList: Partial<TestCaseList> = { items: [], total: 0 };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockList,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockList),
      } as Response);

      await testCaseService.listTestCases(params);

      
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
      await expect(testCaseService.listTestCases({})).rejects.toThrow(McpError);
    });
  });

  describe("createTestCase", () => {
    it("should create a test case successfully", async () => {
      const input: TestCaseInput = {
        name: "New Test Case",
        projectKey: "PROJ",
      };
      const mockCreated: Partial<KeyedCreatedResource> = {
        id: "2",
        key: "PROJ-T2",
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockCreated,
        status: 201,
        statusText: "Created",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockCreated),
      } as Response);

      const result = await testCaseService.createTestCase(input);

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
      const input: TestCaseInput = {
        name: "New Test Case",
        projectKey: "PROJ",
      };
      const errorBody1 = {};
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => errorBody1,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody1),
      } as Response);
      await expect(testCaseService.createTestCase(input)).rejects.toThrow(
        McpError,
      );
    });
  });

  describe("updateTestCase", () => {
    it("should update a test case successfully", async () => {
      const input: TestCaseInput = {
        name: "Updated Test Case Name",
        projectKey: "PROJ",
      };

      const mockUpdatedTestCase: Partial<TestCase> = {
        id: 1,
        key: mockTestCaseKey,
        name: input.name,
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockUpdatedTestCase,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockUpdatedTestCase),
      } as Response);

      const result = await testCaseService.updateTestCase(
        mockTestCaseKey,
        input,
      );
      expect(result).toEqual(mockUpdatedTestCase);

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
      const input: TestCaseInput = {
        name: "Updated Test Case Name",
        projectKey: "PROJ",
      };
      const errorBody2 = {};
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => errorBody2,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody2),
      } as Response);
      await expect(
        testCaseService.updateTestCase(mockTestCaseKey, input),
      ).rejects.toThrow(McpError);
    });
  });

  describe("getTestCaseLinks", () => {
    it("should fetch links for a test case successfully", async () => {
      const mockLinks: LinkList = {
        links: [
          {
            id: "link-1",
            type: "ISSUE",
            issueKey: "JIRA-123",
            url: "http://jira/JIRA-123",
          },
          {
            id: "link-2",
            type: "WEB",
            url: "http://example.com",
            name: "Example",
          },
        ],
        total: 2,
        offset: 0,
        limit: 100,
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockLinks,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockLinks),
      } as Response);

      const result = await testCaseService.getTestCaseLinks(mockTestCaseKey);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );
      expect(result).toEqual(mockLinks);
    });

    it("should throw McpError on API failure", async () => {
      const errorBody3 = {};
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => errorBody3,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody3),
      } as Response);
      await expect(
        testCaseService.getTestCaseLinks(mockTestCaseKey),
      ).rejects.toThrow(McpError);
    });
  });

  describe("createTestCaseIssueLink", () => {
    it("should create an issue link successfully", async () => {
      const input: IssueLinkInput = { issueKey: "JIRA-456" };
      const mockCreatedLink: Partial<Link> = { id: "link-3" };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockCreatedLink,
        status: 201,
        statusText: "Created",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockCreatedLink),
      } as Response);

      const result = await testCaseService.createTestCaseIssueLink(
        mockTestCaseKey,
        input,
      );

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
      expect(result).toEqual(mockCreatedLink);
    });

    it("should throw McpError on API failure", async () => {
      const input: IssueLinkInput = { issueKey: "JIRA-456" };
      const errorBody4 = {};
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => errorBody4,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody4),
      } as Response);
      await expect(
        testCaseService.createTestCaseIssueLink(mockTestCaseKey, input),
      ).rejects.toThrow(McpError);
    });
  });

  describe("createTestCaseWebLink", () => {
    it("should create a web link successfully", async () => {
      const input: WebLinkInput = {
        url: "http://new-example.com",
        name: "New Example",
      };
      const mockCreatedLink: Partial<Link> = { id: "link-4" };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockCreatedLink,
        status: 201,
        statusText: "Created",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockCreatedLink),
      } as Response);

      const result = await testCaseService.createTestCaseWebLink(
        mockTestCaseKey,
        input,
      );

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
      expect(result).toEqual(mockCreatedLink);
    });

    it("should throw McpError on API failure", async () => {
      const input: WebLinkInput = {
        url: "http://new-example.com",
        name: "New Example",
      };
      const errorBody5 = {};
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => errorBody5,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(errorBody5),
      } as Response);
      await expect(
        testCaseService.createTestCaseWebLink(mockTestCaseKey, input),
      ).rejects.toThrow(McpError);
    });
  });

  describe("getTestCaseTestScript", () => {
    it("should fetch the test script successfully", async () => {
      const mockScript: TestScript = {
        type: "STEP_BY_STEP",
        steps: [{ id: 1, description: "Step 1", expectedResult: "Result 1" }],
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockScript,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockScript),
      } as Response);

      const result =
        await testCaseService.getTestCaseTestScript(mockTestCaseKey);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        }),
      );
      expect(result).toEqual(mockScript);
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
        testCaseService.getTestCaseTestScript(mockTestCaseKey),
      ).rejects.toThrow(McpError);
    });
  });

  describe("createTestCaseTestScript", () => {
    it("should create a STEP_BY_STEP test script successfully", async () => {
      const input: TestScriptInput = {
        type: "STEP_BY_STEP",
        steps: [{ description: "New Step 1", expectedResult: "New Result 1" }],
      };

      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 204,
        statusText: "No Content",
        headers: new Headers(),
        text: async () => "",
      } as Response);

      await expect(
        testCaseService.createTestCaseTestScript(mockTestCaseKey, input),
      ).resolves.toBeUndefined();

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
    });

    it("should create a PLAIN test script successfully", async () => {
      const input: TestScriptInput = {
        type: "PLAIN",
        text: "Plain text script content",
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 204,
        statusText: "No Content",
        headers: new Headers(),
        text: async () => "",
      } as Response);

      await expect(
        testCaseService.createTestCaseTestScript(mockTestCaseKey, input),
      ).resolves.toBeUndefined();

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
    });

    it("should throw McpError on API failure", async () => {
      const input: TestScriptInput = { type: "PLAIN", text: "Fail script" };
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
        testCaseService.createTestCaseTestScript(mockTestCaseKey, input),
      ).rejects.toThrow(McpError);
    });
  });

  describe("getTestCaseTestSteps", () => {
    it("should fetch test steps successfully", async () => {
      const mockSteps: TestStepsList = {
        items: [{ id: 1, description: "Step 1", expectedResult: "Result 1" }],
        total: 1,
        offset: 0,
        limit: 100,
      };
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockSteps,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockSteps),
      } as Response);

      const result =
        await testCaseService.getTestCaseTestSteps(mockTestCaseKey);

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
        testCaseService.getTestCaseTestSteps(mockTestCaseKey),
      ).rejects.toThrow(McpError);
    });
  });

  describe("createTestCaseTestSteps", () => {
    it("should create test steps successfully", async () => {
      const input: TestStepsInput = {
        mode: "OVERWRITE",
        testSteps: [
          { description: "New Step 1", expectedResult: "New Result 1" },
        ],
      };

      const mockCreatedSteps: TestStep[] = [
        { id: 2, description: "New Step 1", expectedResult: "New Result 1" },
      ];
      (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockCreatedSteps,
        status: 201,
        statusText: "Created",
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(mockCreatedSteps),
      } as Response);

      const result = await testCaseService.createTestCaseTestSteps(
        mockTestCaseKey,
        input,
      );

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
      expect(result).toEqual(mockCreatedSteps);
    });

    it("should throw McpError on API failure", async () => {
      const input: TestStepsInput = {
        mode: "OVERWRITE",
        testSteps: [
          { description: "Fail Step", expectedResult: "Should fail" },
        ],
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
        testCaseService.createTestCaseTestSteps(mockTestCaseKey, input),
      ).rejects.toThrow(McpError);
    });
  });
});
