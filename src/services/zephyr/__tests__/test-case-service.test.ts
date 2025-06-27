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
  IssueLink,
  IssueLinkInput,
  KeyedCreatedResource,
  LinkList,
  TestCase,
  TestCaseInput,
  TestCaseList,
  TestCaseUpdateInput,
  TestScript,
  TestScriptInput,
  TestStep,
  TestStepsInput,
  TestStepsList,
  WebLink,
  WebLinkInput,
} from "../../../types";
import { TestCaseService } from "../test-case-service";

const mockApiKey = "test-api-key";

describe("TestCaseService", () => {
  let testCaseService: TestCaseService;
  const mockTestCaseKey = "PROJ-T1";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    testCaseService = new TestCaseService(
      mockApiKey,
      "https://mock-zephyr-api.com",
    );
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
        project: { id: 1 },
        createdOn: new Date().toISOString(),
        priority: { id: 1 },
        status: { id: 1 },
      };
      const mockList: Partial<TestCaseList> = {
        values: [mockTestCaseItem],
        total: 1,
        offset: 0,
        limit: 50,
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
      const mockList: Partial<TestCaseList> = { values: [], total: 0 };
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
    it("should update a test case with only name change successfully", async () => {
      const input: TestCaseUpdateInput = {
        name: "Updated Test Case Name",
      };
      const mockCurrentTestCase: Partial<TestCase> = {
        id: 1,
        key: mockTestCaseKey,
        name: "Original Test Case Name",
        project: { id: 1 },
        createdOn: new Date().toISOString(),
        priority: { id: 1 },
        status: { id: 1 },
      };
      const mockUpdatedTestCase: Partial<TestCase> = {
        ...mockCurrentTestCase,
        name: input.name,
      };
      
      // Mock the first call to get current test case
      (fetch as MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockCurrentTestCase,
          statusText: "OK",
          headers: new Headers({ "content-type": "application/json" }),
          text: async () => JSON.stringify(mockCurrentTestCase),
        } as Response)
        // Mock the second call to update the test case
        .mockResolvedValueOnce({
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

      // Should make two calls: first GET, then PUT
      expect(fetch).toHaveBeenCalledTimes(2);
      
      // Check the PUT call
      expect(fetch).toHaveBeenNthCalledWith(2,
        expect.any(URL),
        expect.objectContaining({
          method: "PUT",
          body: expect.stringContaining('"Updated Test Case Name"'),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("should update a test case with multiple fields successfully", async () => {
      const input: TestCaseUpdateInput = {
        name: "Updated Test Case Name",
        folderId: 123,
        priorityId: 4,
      };
      const mockCurrentTestCase: Partial<TestCase> = {
        id: 1,
        key: mockTestCaseKey,
        name: "Original Test Case Name",
        project: { id: 1 },
        createdOn: new Date().toISOString(),
        priority: { id: 1 },
        status: { id: 1 },
        folder: { id: 1 },
      };
      const mockUpdatedTestCase: Partial<TestCase> = {
        ...mockCurrentTestCase,
        name: input.name,
        folder: { id: input.folderId! },
        priority: { id: input.priorityId! },
      };
      
      // Mock the first call to get current test case
      (fetch as MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockCurrentTestCase,
          statusText: "OK",
          headers: new Headers({ "content-type": "application/json" }),
          text: async () => JSON.stringify(mockCurrentTestCase),
        } as Response)
        // Mock the second call to update the test case
        .mockResolvedValueOnce({
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

      // Should make two calls: first GET, then PUT
      expect(fetch).toHaveBeenCalledTimes(2);
      
      // Check the PUT call contains the merged data
      expect(fetch).toHaveBeenNthCalledWith(2,
        expect.any(URL),
        expect.objectContaining({
          method: "PUT",
          body: expect.stringContaining('"Updated Test Case Name"'),
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("should throw an error if no fields are provided for update", async () => {
      const input: TestCaseUpdateInput = {};
      await expect(
        testCaseService.updateTestCase(mockTestCaseKey, input),
      ).rejects.toThrow("No fields provided for update.");
    });

    it("should throw McpError on API failure", async () => {
      const input: TestCaseUpdateInput = {
        name: "Updated Test Case Name",
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
            id: "1",
            type: "ISSUE",
            issueKey: "JIRA-123",
            url: "http://jira/JIRA-123",
          },
          {
            id: "2",
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
      const mockCreatedLink: Partial<IssueLink> = {
        id: "3",
        type: "ISSUE",
        issueKey: "JIRA-456",
      };
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
      const mockCreatedLink: Partial<WebLink> = {
        id: "4",
        type: "WEB",
        url: "http://new-example.com",
      };
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
        steps: [{
          inline: {
            description: "Step 1",
            testData: null,
            expectedResult: "Result 1",
            customFields: {},
            reflectRef: null,
          },
          testCase: null,
        }],
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
      ).resolves.toEqual({});

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
      ).resolves.toEqual({});

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
    it("should fetch test steps successfully (single page)", async () => {
      const mockSteps: TestStepsList = {
        values: [{
          inline: {
            description: "Step 1",
            testData: null,
            expectedResult: "Result 1",
            customFields: {},
            reflectRef: null,
          },
          testCase: null,
        }],
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
      expect(result.values?.length).toBe(1);
      expect(result.values?.[0]?.inline.description).toBe("Step 1");
      expect(result.total).toBe(1);
    });

    it("should fetch and aggregate test steps from multiple pages", async () => {
      const page1: any = {
        values: Array.from({ length: 100 }, (_, i) => ({
          inline: {
            description: `Step ${i + 1}`,
            testData: null,
            expectedResult: `Result ${i + 1}`,
            customFields: {},
            reflectRef: null,
          },
          testCase: null,
        })),
        total: 150,
        offset: 0,
        limit: 100,
      };
      const page2: any = {
        values: Array.from({ length: 50 }, (_, i) => ({
          inline: {
            description: `Step ${101 + i}`,
            testData: null,
            expectedResult: `Result ${101 + i}`,
            customFields: {},
            reflectRef: null,
          },
          testCase: null,
        })),
        total: 150,
        offset: 100,
        limit: 100,
      };
      (fetch as MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page1,
          status: 200,
          statusText: "OK",
          headers: new Headers({ "content-type": "application/json" }),
          text: async () => JSON.stringify(page1),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page2,
          status: 200,
          statusText: "OK",
          headers: new Headers({ "content-type": "application/json" }),
          text: async () => JSON.stringify(page2),
        } as Response);

      const result =
        await testCaseService.getTestCaseTestSteps(mockTestCaseKey);
      expect(result.values?.length).toBe(150);
      expect(result.values?.[0]?.inline.description).toBe("Step 1");
      expect(result.values?.[149]?.inline.description).toBe("Step 150");
      expect(result.total).toBe(150);
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

      // Expected transformed payload that should be sent to API
      const expectedTransformedPayload = {
        mode: "OVERWRITE",
        items: [
          {
            inline: {
              description: "New Step 1",
              testData: null,
              expectedResult: "New Result 1",
              customFields: {},
              reflectRef: null,
            },
            testCase: null,
          },
        ],
      };

      const mockCreatedSteps: TestStep[] = [
        {
          inline: {
            description: "New Step 1",
            testData: null,
            expectedResult: "New Result 1",
            customFields: {},
            reflectRef: null,
          },
          testCase: null,
        },
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
          body: JSON.stringify(expectedTransformedPayload),
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
