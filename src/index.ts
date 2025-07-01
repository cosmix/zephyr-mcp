#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { EnvironmentService } from "./services/zephyr/environment-service";
import { FolderService } from "./services/zephyr/folder-service";
import { LinkService } from "./services/zephyr/link-service";
import { PriorityService } from "./services/zephyr/priority-service";
import { ProjectService } from "./services/zephyr/project-service";
import { StatusService } from "./services/zephyr/status-service";
import { TestCaseService } from "./services/zephyr/test-case-service";
import { TestCycleService } from "./services/zephyr/test-cycle-service";
import { TestExecutionService } from "./services/zephyr/test-execution-service";

import type { FolderInput } from "./types/zephyr/folder";
import type { WebLinkInput } from "./types/zephyr/link";
import type {
  TestCaseInput,
  TestCaseUpdateInput,
  TestScriptInput,
  TestStepInput,
  TestStepsInput,
} from "./types/zephyr/test-case";
import type { TestCycleInput } from "./types/zephyr/test-cycle";
import type {
  TestExecutionInput,
  TestExecutionUpdate,
  TestStepsUpdate,
} from "./types/zephyr/test-execution";

import {
  isCreateFolderArgs,
  isCreateTestCaseArgs,
  isCreateTestCaseIssueLinkArgs,
  isCreateTestCaseTestScriptArgs,
  isCreateTestCaseTestStepsArgs,
  isCreateTestCaseWebLinkArgs,
  isCreateTestCycleArgs,
  isCreateTestExecutionArgs,
  isDeleteLinkArgs,
  isGetFolderArgs,
  isGetProjectArgs,
  isGetTestCaseArgs,
  isGetTestCaseLinksArgs,
  isGetTestCaseTestScriptArgs,
  isGetTestCaseTestStepsArgs,
  isGetTestCycleArgs,
  isGetTestExecutionArgs,
  isGetTestExecutionTestStepsArgs,
  isListEnvironmentsArgs,
  isListFoldersArgs,
  isListPrioritiesArgs,
  isListProjectsArgs,
  isListStatusesArgs,
  isListTestCasesArgs,
  isListTestCyclesArgs,
  isListTestExecutionsArgs,
  isUpdateTestCaseArgs,
  isUpdateTestCaseTestStepsArgs,
  isUpdateTestCycleArgs,
  isUpdateTestExecutionArgs,
  isUpdateTestExecutionTestStepsArgs,
} from "./types/zephyr/guards";

const API_KEY = process.env.ZEPHYR_API_KEY;
const BASE_URL = process.env.ZEPHYR_BASE_URL;

if (!API_KEY) {
  console.error("ZEPHYR_API_KEY environment variable is required");
  process.exit(1);
}
if (!BASE_URL) {
  console.error("ZEPHYR_BASE_URL environment variable is required");
  process.exit(1);
}

class ZephyrServer {
  private server: Server;
  private apiKey: string;
  private projectService: ProjectService;
  private folderService: FolderService;
  private statusService: StatusService;
  private priorityService: PriorityService;
  private environmentService: EnvironmentService;
  private linkService: LinkService;
  private testCaseService: TestCaseService;
  private testCycleService: TestCycleService;
  private testExecutionService: TestExecutionService;

  constructor() {
    this.server = new Server(
      {
        name: "zephyr-mcp",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.apiKey = API_KEY as string;
    const baseUrl = BASE_URL as string;

    this.projectService = new ProjectService(this.apiKey, baseUrl);
    this.folderService = new FolderService(this.apiKey, baseUrl);
    this.statusService = new StatusService(this.apiKey, baseUrl);
    this.priorityService = new PriorityService(this.apiKey, baseUrl);
    this.environmentService = new EnvironmentService(this.apiKey, baseUrl);
    this.linkService = new LinkService(this.apiKey, baseUrl);
    this.testCaseService = new TestCaseService(this.apiKey, baseUrl);
    this.testCycleService = new TestCycleService(this.apiKey, baseUrl);
    this.testExecutionService = new TestExecutionService(this.apiKey, baseUrl);

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      console.error("Received SIGINT, closing server...");
      await this.server.close();
      process.exit(0);
    });
    process.on("SIGTERM", async () => {
      console.error("Received SIGTERM, closing server...");
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: "get_test_case",
          description: "Get a specific test case by its key.",
          inputSchema: {
            type: "object",
            properties: {
              testCaseKey: {
                type: "string",
                description: "The key of the test case (e.g., PROJ-T123)",
              },
            },
            required: ["testCaseKey"],
          },
        },
        {
          name: "list_test_cases",
          description:
            "List test cases with optional filtering by project, folder, or Jira issue.",
          inputSchema: {
            type: "object",
            properties: {
              projectKey: {
                type: "string",
                description: "Key of the project (e.g., PROJ)",
              },
              folderId: {
                type: "number",
                description: "Numeric ID of the folder",
              },
              jiraIssueKey: {
                type: "string",
                description: "Key of the linked Jira issue (e.g., PROJ-456)",
              },
            },
            additionalProperties: true,
          },
        },
        {
          name: "create_test_case",
          description: "Create a new test case.",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Name of the test case" },
              projectKey: { type: "string", description: "Key of the project" },
              folderId: { type: "number" },
              statusId: { type: "number" },
              priorityId: { type: "number" },
              ownerId: { type: "number" },
              jiraIssueKey: { type: "string" },
              links: { type: "array", items: { type: "object" } },
              parameters: { type: "object" },
              testScript: { type: "object" },
              testSteps: { type: "object" },
            },
            required: ["name", "projectKey"],
            additionalProperties: true,
          },
        },
        {
          name: "update_test_case",
          description: "Update an existing test case.",
          inputSchema: {
            type: "object",
            properties: {
              testCaseKey: { type: "string" },
              name: { type: "string" },
              folderId: { type: "number" },
              statusId: { type: "number" },
              priorityId: { type: "number" },
              ownerId: { type: "number" },
              jiraIssueKey: { type: "string" },
              links: { type: "array", items: { type: "object" } },
              parameters: { type: "object" },
              testScript: { type: "object" },
              testSteps: { type: "object" },
            },
            required: ["testCaseKey"],
            additionalProperties: true,
          },
        },
        {
          name: "get_test_case_links",
          description: "Get links associated with a test case.",
          inputSchema: {
            type: "object",
            properties: { testCaseKey: { type: "string" } },
            required: ["testCaseKey"],
          },
        },
        {
          name: "create_test_case_issue_link",
          description: "Create an issue link for a test case.",
          inputSchema: {
            type: "object",
            properties: {
              testCaseKey: { type: "string" },
              issueKey: { type: "string" },
            },
            required: ["testCaseKey", "issueKey"],
          },
        },
        {
          name: "create_test_case_web_link",
          description: "Create a web link for a test case.",
          inputSchema: {
            type: "object",
            properties: {
              testCaseKey: { type: "string" },
              url: { type: "string" },
              description: { type: "string" },
            },
            required: ["testCaseKey", "url"],
          },
        },
        {
          name: "get_test_case_test_script",
          description: "Get the test script for a test case.",
          inputSchema: {
            type: "object",
            properties: { testCaseKey: { type: "string" } },
            required: ["testCaseKey"],
          },
        },
        {
          name: "create_test_case_test_script",
          description: "Create or update the test script for a test case.",
          inputSchema: {
            type: "object",
            properties: {
              testCaseKey: { type: "string" },
              type: { type: "string", enum: ["STEP_BY_STEP", "BDD", "PLAIN"] },
              text: { type: "string" },
              steps: { type: "array", items: { type: "object" } },
            },
            required: ["testCaseKey", "type"],
            additionalProperties: true,
          },
        },
        {
          name: "get_test_case_test_steps",
          description: "Get the test steps for a test case.",
          inputSchema: {
            type: "object",
            properties: { testCaseKey: { type: "string" } },
            required: ["testCaseKey"],
          },
        },
        {
          name: "create_test_case_test_steps",
          description: "Create or update test steps for a test case. Each step should be a simple object with description, testData, and expectedResult properties (NOT wrapped in an 'inline' object).",
          inputSchema: {
            type: "object",
            properties: {
              testCaseKey: { type: "string" },
              steps: { 
                type: "array", 
                items: { 
                  type: "object",
                  properties: {
                    description: { type: "string", description: "Step description" },
                    testData: { type: "string", description: "Test data for the step (optional)" },
                    expectedResult: { type: "string", description: "Expected result of the step" }
                  },
                  required: ["description", "expectedResult"],
                  additionalProperties: false
                },
                description: "Array of test step objects in simple format: {description, testData?, expectedResult}"
              },
              mode: { type: "string", enum: ["OVERWRITE", "APPEND"], description: "Mode for creating test steps (default: OVERWRITE)" },
            },
            required: ["testCaseKey", "steps"],
          },
        },
        {
          name: "update_test_case_test_steps",
          description: "Update test steps for a test case with specified mode. Each step should be a simple object with description, testData, and expectedResult properties (NOT wrapped in an 'inline' object).",
          inputSchema: {
            type: "object",
            properties: {
              testCaseKey: { type: "string" },
              steps: { 
                type: "array", 
                items: { 
                  type: "object",
                  properties: {
                    description: { type: "string", description: "Step description" },
                    testData: { type: "string", description: "Test data for the step (optional)" },
                    expectedResult: { type: "string", description: "Expected result of the step" }
                  },
                  required: ["description", "expectedResult"],
                  additionalProperties: false
                },
                description: "Array of test step objects in simple format: {description, testData?, expectedResult}"
              },
              mode: { type: "string", enum: ["OVERWRITE", "APPEND"], description: "Mode for updating test steps (default: OVERWRITE)" },
            },
            required: ["testCaseKey", "steps"],
          },
        },

        {
          name: "get_test_cycle",
          description: "Get a specific test cycle by its ID or key.",
          inputSchema: {
            type: "object",
            properties: { testCycleIdOrKey: { type: "string" } },
            required: ["testCycleIdOrKey"],
          },
        },
        {
          name: "list_test_cycles",
          description: "List test cycles with optional filtering.",
          inputSchema: {
            type: "object",
            properties: {
              projectKey: { type: "string" },
              folderId: { type: "number" },
              jiraIssueKey: { type: "string" },
            },
            additionalProperties: true,
          },
        },
        {
          name: "create_test_cycle",
          description: "Create a new test cycle.",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string" },
              projectKey: { type: "string" },
              folderId: { type: "number" },
              statusId: { type: "number" },
              ownerId: { type: "number" },
              startDate: { type: "string", format: "date-time" },
              endDate: { type: "string", format: "date-time" },
              jiraIssueKey: { type: "string" },
              links: { type: "array", items: { type: "object" } },
            },
            required: ["name", "projectKey"],
            additionalProperties: true,
          },
        },
        {
          name: "update_test_cycle",
          description: "Update an existing test cycle.",
          inputSchema: {
            type: "object",
            properties: {
              testCycleIdOrKey: { type: "string" },
              name: { type: "string" },
              folderId: { type: "number" },
              statusId: { type: "number" },
              ownerId: { type: "number" },
              startDate: { type: "string", format: "date-time" },
              endDate: { type: "string", format: "date-time" },
              jiraIssueKey: { type: "string" },
              links: { type: "array", items: { type: "object" } },
            },
            required: ["testCycleIdOrKey"],
            additionalProperties: true,
          },
        },

        {
          name: "get_test_execution",
          description: "Get a specific test execution by its ID or key.",
          inputSchema: {
            type: "object",
            properties: { testExecutionIdOrKey: { type: "string" } },
            required: ["testExecutionIdOrKey"],
          },
        },
        {
          name: "list_test_executions",
          description: "List test executions with optional filtering.",
          inputSchema: {
            type: "object",
            properties: {
              projectKey: { type: "string" },
              testCaseKey: { type: "string" },
              testCycleKey: { type: "string" },
              statusId: { type: "number" },
              environmentId: { type: "number" },
              ownerId: { type: "number" },
              jiraIssueKey: { type: "string" },
            },
            additionalProperties: true,
          },
        },
        {
          name: "create_test_execution",
          description: "Create a new test execution.",
          inputSchema: {
            type: "object",
            properties: {
              projectKey: { type: "string" },
              testCaseKey: { type: "string" },
              testCycleKey: { type: "string" },
              statusId: { type: "number" },
              environmentId: { type: "number" },
              ownerId: { type: "number" },
              executedDate: { type: "string", format: "date-time" },
              jiraIssueKey: { type: "string" },
              links: { type: "array", items: { type: "object" } },
              testSteps: { type: "object" },
            },
            required: ["projectKey", "testCaseKey"],
            additionalProperties: true,
          },
        },
        {
          name: "update_test_execution",
          description: "Update an existing test execution.",
          inputSchema: {
            type: "object",
            properties: {
              testExecutionIdOrKey: { type: "string" },
              statusId: { type: "number" },
              environmentId: { type: "number" },
              ownerId: { type: "number" },
              executedDate: { type: "string", format: "date-time" },
              jiraIssueKey: { type: "string" },
              links: { type: "array", items: { type: "object" } },
              testSteps: { type: "object" },
            },
            required: ["testExecutionIdOrKey"],
            additionalProperties: true,
          },
        },
        {
          name: "get_test_execution_test_steps",
          description: "Get the test steps for a test execution.",
          inputSchema: {
            type: "object",
            properties: { testExecutionIdOrKey: { type: "string" } },
            required: ["testExecutionIdOrKey"],
          },
        },
        {
          name: "update_test_execution_test_steps",
          description: "Update test steps for a test execution.",
          inputSchema: {
            type: "object",
            properties: {
              testExecutionIdOrKey: { type: "string" },
              testSteps: { type: "object" },
            },
            required: ["testExecutionIdOrKey", "testSteps"],
          },
        },

        {
          name: "get_project",
          description: "Get a specific project by its ID or key.",
          inputSchema: {
            type: "object",
            properties: { projectIdOrKey: { type: "string" } },
            required: ["projectIdOrKey"],
          },
        },
        {
          name: "list_projects",
          description: "List projects.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: true,
          },
        },

        {
          name: "get_folder",
          description: "Get a specific folder by its ID.",
          inputSchema: {
            type: "object",
            properties: { folderId: { type: "number" } },
            required: ["folderId"],
          },
        },
        {
          name: "list_folders",
          description: "List folders with optional filtering.",
          inputSchema: {
            type: "object",
            properties: {
              projectKey: { type: "string" },
              type: { type: "string", enum: ["TEST_CASE", "TEST_CYCLE"] },
            },
            additionalProperties: true,
          },
        },
        {
          name: "create_folder",
          description: "Create a new folder.",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string" },
              type: { type: "string", enum: ["TEST_CASE", "TEST_CYCLE"] },
              projectKey: { type: "string" },
              description: { type: "string" },
              parentFolderId: { type: "number" },
            },
            required: ["name", "type", "projectKey"],
            additionalProperties: true,
          },
        },

        {
          name: "list_statuses",
          description: "List statuses with optional filtering.",
          inputSchema: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["TEST_CASE", "TEST_CYCLE", "TEST_EXECUTION"],
              },
              projectKey: { type: "string" },
            },
            additionalProperties: true,
          },
        },

        {
          name: "list_priorities",
          description: "List priorities.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: true,
          },
        },

        {
          name: "list_environments",
          description: "List environments.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: true,
          },
        },

        {
          name: "delete_link",
          description: "Delete a link by its ID.",
          inputSchema: {
            type: "object",
            properties: { linkId: { type: "number" } },
            required: ["linkId"],
          },
        },
      ];
      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;

      try {
        let result: any;

        switch (toolName) {
          case "get_test_case":
            if (!isGetTestCaseArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for get_test_case",
                args,
              );

            const [singleTestCase, testSteps] = await Promise.all([
              this.testCaseService.getTestCase(args.testCaseKey),
              this.testCaseService.getTestCaseTestSteps(args.testCaseKey),
            ]);

            const combinedResult = { ...singleTestCase };
            delete combinedResult.testScript;

            combinedResult.testSteps = testSteps.values;

            result = {
              content: [
                { type: "text", text: JSON.stringify(combinedResult, null, 2) },
              ],
            };
            break;
          case "list_test_cases":
            if (!isListTestCasesArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for list_test_cases",
                args,
              );
            const testCases = await this.testCaseService.listTestCases(args);
            result = {
              content: [
                { type: "text", text: JSON.stringify(testCases, null, 2) },
              ],
            };
            break;
          case "create_test_case":
            if (!isCreateTestCaseArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for create_test_case",
                args,
              );
            const createdTestCase = await this.testCaseService.createTestCase(
              args as TestCaseInput,
            );
            result = {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(createdTestCase, null, 2),
                },
              ],
            };
            break;
          case "update_test_case":
            if (!isUpdateTestCaseArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for update_test_case",
                args,
              );
            try {
              const { testCaseKey: tcUpdateKey, ...tcUpdateData } = args;

              // Ensure we have a properly typed update payload
              const updatePayload: TestCaseUpdateInput = tcUpdateData;

              const updatedTestCase = await this.testCaseService.updateTestCase(
                tcUpdateKey,
                updatePayload,
              );
              
              // Ensure we always have valid content for MCP response
              if (!updatedTestCase) {
                result = {
                  content: [
                    {
                      type: "text",
                      text: JSON.stringify({
                        success: false,
                        error: "Failed to update test case - no response received"
                      }, null, 2),
                    },
                  ],
                };
              } else {
                result = {
                  content: [
                    {
                      type: "text",
                      text: JSON.stringify(updatedTestCase, null, 2),
                    },
                  ],
                };
              }
            } catch (error) {
              // Handle any errors and provide valid MCP response
              result = {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      success: false,
                      error: error instanceof Error ? error.message : "Unknown error occurred while updating test case"
                    }, null, 2),
                  },
                ],
              };
            }
            break;
          case "get_test_case_links":
            if (!isGetTestCaseLinksArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for get_test_case_links",
                args,
              );
            const tcLinks = await this.testCaseService.getTestCaseLinks(
              args.testCaseKey,
            );
            result = {
              content: [
                { type: "text", text: JSON.stringify(tcLinks, null, 2) },
              ],
            };
            break;
          case "create_test_case_issue_link":
            if (!isCreateTestCaseIssueLinkArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for create_test_case_issue_link",
                args,
              );
            const createdIssueLink =
              await this.testCaseService.createTestCaseIssueLink(
                args.testCaseKey,
                { issueKey: args.issueKey },
              );
            result = {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(createdIssueLink, null, 2),
                },
              ],
            };
            break;
          case "create_test_case_web_link":
            if (!isCreateTestCaseWebLinkArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for create_test_case_web_link",
                args,
              );
            const webLinkInput: WebLinkInput = {
              url: args.url,
              name: args.description || args.url,
            };
            const createdWebLink =
              await this.testCaseService.createTestCaseWebLink(
                args.testCaseKey,
                webLinkInput,
              );
            result = {
              content: [
                { type: "text", text: JSON.stringify(createdWebLink, null, 2) },
              ],
            };
            break;
          case "get_test_case_test_script":
            if (!isGetTestCaseTestScriptArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for get_test_case_test_script",
                args,
              );
            const tcScript = await this.testCaseService.getTestCaseTestScript(
              args.testCaseKey,
            );
            result = {
              content: [
                { type: "text", text: JSON.stringify(tcScript, null, 2) },
              ],
            };
            break;
          case "create_test_case_test_script":
            if (!isCreateTestCaseTestScriptArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for create_test_case_test_script",
                args,
              );
            const createdTcScript =
              await this.testCaseService.createTestCaseTestScript(
                args.testCaseKey,
                args as TestScriptInput,
              );
            result = {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(createdTcScript, null, 2),
                },
              ],
            };
            break;
          case "get_test_case_test_steps":
            if (!isGetTestCaseTestStepsArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for get_test_case_test_steps",
                args,
              );
            const tcSteps = await this.testCaseService.getTestCaseTestSteps(
              args.testCaseKey,
            );
            result = {
              content: [
                { type: "text", text: JSON.stringify(tcSteps, null, 2) },
              ],
            };
            break;
          case "create_test_case_test_steps":
            if (!isCreateTestCaseTestStepsArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for create_test_case_test_steps",
                args,
              );
            const testStepsInput: TestStepsInput = {
              mode: args.mode || "OVERWRITE",
              testSteps: args.steps as TestStepInput[],
            };
            const createdOrUpdatedSteps =
              await this.testCaseService.createTestCaseTestSteps(
                args.testCaseKey,
                testStepsInput,
              );
            result = {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(createdOrUpdatedSteps, null, 2),
                },
              ],
            };
            break;
          case "update_test_case_test_steps":
            if (!isUpdateTestCaseTestStepsArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for update_test_case_test_steps",
                args,
              );
            const updateTestStepsInput: TestStepsInput = {
              mode: args.mode || "OVERWRITE",
              testSteps: args.steps as TestStepInput[],
            };
            const updatedSteps =
              await this.testCaseService.createTestCaseTestSteps(
                args.testCaseKey,
                updateTestStepsInput,
              );
            result = {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(updatedSteps, null, 2),
                },
              ],
            };
            break;

          case "get_test_cycle":
            if (!isGetTestCycleArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for get_test_cycle",
                args,
              );
            const singleTestCycle = await this.testCycleService.getTestCycle(
              args.testCycleIdOrKey,
            );
            result = {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(singleTestCycle, null, 2),
                },
              ],
            };
            break;
          case "list_test_cycles":
            if (!isListTestCyclesArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for list_test_cycles",
                args,
              );
            const testCycles = await this.testCycleService.listTestCycles(args);
            result = {
              content: [
                { type: "text", text: JSON.stringify(testCycles, null, 2) },
              ],
            };
            break;
          case "create_test_cycle":
            if (!isCreateTestCycleArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for create_test_cycle",
                args,
              );
            const createdTestCycle =
              await this.testCycleService.createTestCycle(
                args as TestCycleInput,
              );
            result = {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(createdTestCycle, null, 2),
                },
              ],
            };
            break;
          case "update_test_cycle":
            if (!isUpdateTestCycleArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for update_test_cycle",
                args,
              );
            const { testCycleIdOrKey: tcyUpdateKey, ...tcyUpdateData } = args;
            const updatedTestCycle =
              await this.testCycleService.updateTestCycle(
                tcyUpdateKey,
                tcyUpdateData as any,
              );
            result = {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(updatedTestCycle, null, 2),
                },
              ],
            };
            break;

          case "get_test_execution":
            if (!isGetTestExecutionArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for get_test_execution",
                args,
              );
            const singleTestExecution =
              await this.testExecutionService.getTestExecution(
                args.testExecutionIdOrKey,
              );
            result = {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(singleTestExecution, null, 2),
                },
              ],
            };
            break;
          case "list_test_executions":
            if (!isListTestExecutionsArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for list_test_executions",
                args,
              );
            const testExecutions =
              await this.testExecutionService.listTestExecutions(args);
            result = {
              content: [
                { type: "text", text: JSON.stringify(testExecutions, null, 2) },
              ],
            };
            break;
          case "create_test_execution":
            if (!isCreateTestExecutionArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for create_test_execution",
                args,
              );
            const createdTestExecution =
              await this.testExecutionService.createTestExecution(
                args as TestExecutionInput,
              );
            result = {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(createdTestExecution, null, 2),
                },
              ],
            };
            break;
          case "update_test_execution":
            if (!isUpdateTestExecutionArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for update_test_execution",
                args,
              );
            const {
              testExecutionIdOrKey: execUpdateKey,
              ...testExecUpdateData
            } = args;
            const cleanTestExecUpdateInput = Object.fromEntries(
              Object.entries(testExecUpdateData).filter(
                ([_, v]) => v !== undefined,
              ),
            );
            const updatedTestExecution =
              await this.testExecutionService.updateTestExecution(
                execUpdateKey,
                cleanTestExecUpdateInput as Partial<TestExecutionUpdate>,
              );
            result = {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(updatedTestExecution, null, 2),
                },
              ],
            };
            break;
          case "get_test_execution_test_steps":
            if (!isGetTestExecutionTestStepsArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for get_test_execution_test_steps",
                args,
              );
            const execSteps =
              await this.testExecutionService.getTestExecutionTestSteps(
                args.testExecutionIdOrKey,
              );
            result = {
              content: [
                { type: "text", text: JSON.stringify(execSteps, null, 2) },
              ],
            };
            break;
          case "update_test_execution_test_steps":
            if (!isUpdateTestExecutionTestStepsArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for update_test_execution_test_steps",
                args,
              );
            await this.testExecutionService.updateTestExecutionTestSteps(
              args.testExecutionIdOrKey,
              args.testSteps as TestStepsUpdate,
            );
            result = {
              content: [
                {
                  type: "text",
                  text: "Test execution steps updated successfully.",
                },
              ],
            };
            break;

          case "get_project":
            if (!isGetProjectArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for get_project",
                args,
              );
            const singleProject = await this.projectService.getProject(
              args.projectIdOrKey,
            );
            result = {
              content: [
                { type: "text", text: JSON.stringify(singleProject, null, 2) },
              ],
            };
            break;
          case "list_projects":
            if (!isListProjectsArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for list_projects",
                args,
              );
            const projectListResult =
              await this.projectService.listProjects(args);

            if (projectListResult && Array.isArray(projectListResult.values)) {
              result = {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(projectListResult, null, 2),
                  },
                ],
              };
            } else {
              throw new McpError(
                ErrorCode.InternalError,
                "Received unexpected structure from projectService.listProjects",
                { receivedData: projectListResult },
              );
            }
            break;

          case "get_folder":
            if (!isGetFolderArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for get_folder",
                args,
              );
            const singleFolder = await this.folderService.getFolder(
              args.folderId,
            );
            result = {
              content: [
                { type: "text", text: JSON.stringify(singleFolder, null, 2) },
              ],
            };
            break;
          case "list_folders":
            if (!isListFoldersArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for list_folders",
                args,
              );
            const folders = await this.folderService.listFolders(args);
            result = {
              content: [
                { type: "text", text: JSON.stringify(folders, null, 2) },
              ],
            };
            break;
          case "create_folder":
            if (!isCreateFolderArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for create_folder",
                args,
              );
            const createdFolder = await this.folderService.createFolder(
              args as FolderInput,
            );
            result = {
              content: [
                { type: "text", text: JSON.stringify(createdFolder, null, 2) },
              ],
            };
            break;

          case "list_statuses":
            if (!isListStatusesArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for list_statuses",
                args,
              );
            const statuses = await this.statusService.listStatuses(args);
            result = {
              content: [
                { type: "text", text: JSON.stringify(statuses, null, 2) },
              ],
            };
            break;

          case "list_priorities":
            if (!isListPrioritiesArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for list_priorities",
                args,
              );
            const priorities = await this.priorityService.listPriorities(args);
            result = {
              content: [
                { type: "text", text: JSON.stringify(priorities, null, 2) },
              ],
            };
            break;

          case "list_environments":
            if (!isListEnvironmentsArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for list_environments",
                args,
              );
            const environments =
              await this.environmentService.listEnvironments(args);
            result = {
              content: [
                { type: "text", text: JSON.stringify(environments, null, 2) },
              ],
            };
            break;

          case "delete_link":
            if (!isDeleteLinkArgs(args))
              throw new McpError(
                ErrorCode.InvalidParams,
                "Invalid arguments for delete_link",
                args,
              );
            await this.linkService.deleteLink(args.linkId);
            result = {
              content: [{ type: "text", text: "Link deleted successfully." }],
            };
            break;
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Tool '${toolName}' not found`,
            );
        }

        return result;
      } catch (error: any) {
        console.error(
          `Error executing tool '${toolName}' with args:`,
          args,
          "Error:",
          error,
        );
        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          error.message || `Failed to execute tool '${toolName}'`,
          { originalError: String(error) },
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error("Zephyr Scale MCP server running on stdio");
  }
}

(async () => {
  try {
    const server = new ZephyrServer();
    await server.run();
  } catch (error) {
    console.error("Failed to start Zephyr MCP Server:", error);
    process.exit(1);
  }
})();
