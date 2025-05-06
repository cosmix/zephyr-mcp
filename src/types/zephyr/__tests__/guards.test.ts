import { describe, expect, it } from "vitest";
import * as guards from "../guards"; // Import all guards

describe("Type Guards", () => {
  // --- Test Case Guards ---
  describe("isGetTestCaseArgs", () => {
    it("should return true for valid args", () => {
      expect(guards.isGetTestCaseArgs({ testCaseKey: "PROJ-T1" })).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(guards.isGetTestCaseArgs({})).toBe(false);
    });
    it("should return false for wrong type", () => {
      expect(guards.isGetTestCaseArgs({ testCaseKey: 123 })).toBe(false);
    });
    it("should return false for null/undefined", () => {
      expect(guards.isGetTestCaseArgs(null)).toBe(false);
      expect(guards.isGetTestCaseArgs(undefined)).toBe(false);
    });
  });

  describe("isListTestCasesArgs", () => {
    it("should return true for valid args (empty object)", () => {
      expect(guards.isListTestCasesArgs({})).toBe(true);
    });
    it("should return true for valid args with optional props", () => {
      expect(guards.isListTestCasesArgs({ projectKey: "PROJ" })).toBe(true);
    });
    it("should return false for non-object", () => {
      expect(guards.isListTestCasesArgs("string")).toBe(false);
      expect(guards.isListTestCasesArgs(null)).toBe(false);
    });
  });

  describe("isCreateTestCaseArgs", () => {
    it("should return true for valid args", () => {
      expect(
        guards.isCreateTestCaseArgs({ name: "Test", projectKey: "PROJ" }),
      ).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(guards.isCreateTestCaseArgs({ name: "Test" })).toBe(false);
    });
    it("should return false for wrong type", () => {
      expect(
        guards.isCreateTestCaseArgs({ name: 123, projectKey: "PROJ" }),
      ).toBe(false);
    });
  });

  describe("isUpdateTestCaseArgs", () => {
    it("should return true for valid args", () => {
      expect(guards.isUpdateTestCaseArgs({ testCaseKey: "PROJ-T1" })).toBe(
        true,
      );
    });
    it("should return true for valid args with optional props", () => {
      expect(
        guards.isUpdateTestCaseArgs({ testCaseKey: "PROJ-T1", name: "New" }),
      ).toBe(true);
    });
    it("should return false for missing required property", () => {
      expect(guards.isUpdateTestCaseArgs({ name: "New" })).toBe(false);
    });
    it("should return false for wrong type", () => {
      expect(guards.isUpdateTestCaseArgs({ testCaseKey: 123 })).toBe(false);
    });
  });

  describe("isGetTestCaseLinksArgs", () => {
    it("should return true for valid args", () => {
      expect(guards.isGetTestCaseLinksArgs({ testCaseKey: "PROJ-T1" })).toBe(
        true,
      );
    });
    it("should return false for missing property", () => {
      expect(guards.isGetTestCaseLinksArgs({})).toBe(false);
    });
  });

  describe("isCreateTestCaseIssueLinkArgs", () => {
    it("should return true for valid args", () => {
      expect(
        guards.isCreateTestCaseIssueLinkArgs({
          testCaseKey: "PROJ-T1",
          issueKey: "ISSUE-1",
        }),
      ).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(
        guards.isCreateTestCaseIssueLinkArgs({ testCaseKey: "PROJ-T1" }),
      ).toBe(false);
    });
  });

  describe("isCreateTestCaseWebLinkArgs", () => {
    it("should return true for valid args", () => {
      expect(
        guards.isCreateTestCaseWebLinkArgs({
          testCaseKey: "PROJ-T1",
          url: "http://example.com",
        }),
      ).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(
        guards.isCreateTestCaseWebLinkArgs({ testCaseKey: "PROJ-T1" }),
      ).toBe(false);
    });
  });

  describe("isGetTestCaseTestScriptArgs", () => {
    it("should return true for valid args", () => {
      expect(
        guards.isGetTestCaseTestScriptArgs({ testCaseKey: "PROJ-T1" }),
      ).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(guards.isGetTestCaseTestScriptArgs({})).toBe(false);
    });
  });

  describe("isCreateTestCaseTestScriptArgs", () => {
    it("should return true for valid args", () => {
      expect(
        guards.isCreateTestCaseTestScriptArgs({
          testCaseKey: "PROJ-T1",
          type: "BDD",
          steps: [],
        }),
      ).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(
        guards.isCreateTestCaseTestScriptArgs({
          testCaseKey: "PROJ-T1",
          type: "BDD",
        }),
      ).toBe(false);
    });
    it("should return false for wrong type (steps)", () => {
      expect(
        guards.isCreateTestCaseTestScriptArgs({
          testCaseKey: "PROJ-T1",
          type: "BDD",
          steps: "not an array",
        }),
      ).toBe(false);
    });
  });

  describe("isGetTestCaseTestStepsArgs", () => {
    it("should return true for valid args", () => {
      expect(
        guards.isGetTestCaseTestStepsArgs({ testCaseKey: "PROJ-T1" }),
      ).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(guards.isGetTestCaseTestStepsArgs({})).toBe(false);
    });
  });

  describe("isCreateTestCaseTestStepsArgs", () => {
    it("should return true for valid args", () => {
      expect(
        guards.isCreateTestCaseTestStepsArgs({
          testCaseKey: "PROJ-T1",
          steps: [],
        }),
      ).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(
        guards.isCreateTestCaseTestStepsArgs({ testCaseKey: "PROJ-T1" }),
      ).toBe(false);
    });
    it("should return false for wrong type (steps)", () => {
      expect(
        guards.isCreateTestCaseTestStepsArgs({
          testCaseKey: "PROJ-T1",
          steps: "not an array",
        }),
      ).toBe(false);
    });
  });

  // --- Test Cycle Guards ---
  describe("isGetTestCycleArgs", () => {
    it("should return true for valid args", () => {
      expect(guards.isGetTestCycleArgs({ testCycleIdOrKey: "PROJ-C1" })).toBe(
        true,
      );
    });
    it("should return false for missing property", () => {
      expect(guards.isGetTestCycleArgs({})).toBe(false);
    });
  });

  describe("isListTestCyclesArgs", () => {
    it("should return true for valid args (empty object)", () => {
      expect(guards.isListTestCyclesArgs({})).toBe(true);
    });
    it("should return true for valid args with optional props", () => {
      expect(guards.isListTestCyclesArgs({ projectKey: "PROJ" })).toBe(true);
    });
    it("should return false for non-object", () => {
      expect(guards.isListTestCyclesArgs(123)).toBe(false);
    });
  });

  describe("isCreateTestCycleArgs", () => {
    it("should return true for valid args", () => {
      expect(
        guards.isCreateTestCycleArgs({ name: "Cycle", projectKey: "PROJ" }),
      ).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(guards.isCreateTestCycleArgs({ name: "Cycle" })).toBe(false);
    });
  });

  describe("isUpdateTestCycleArgs", () => {
    it("should return true for valid args", () => {
      expect(
        guards.isUpdateTestCycleArgs({ testCycleIdOrKey: "PROJ-C1" }),
      ).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(guards.isUpdateTestCycleArgs({})).toBe(false);
    });
  });

  // --- Test Execution Guards ---
  describe("isGetTestExecutionArgs", () => {
    it("should return true for valid args", () => {
      expect(
        guards.isGetTestExecutionArgs({ testExecutionIdOrKey: "PROJ-E1" }),
      ).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(guards.isGetTestExecutionArgs({})).toBe(false);
    });
  });

  describe("isListTestExecutionsArgs", () => {
    it("should return true for valid args (empty object)", () => {
      expect(guards.isListTestExecutionsArgs({})).toBe(true);
    });
    it("should return true for valid args with optional props", () => {
      expect(guards.isListTestExecutionsArgs({ projectKey: "PROJ" })).toBe(
        true,
      );
    });
    it("should return false for non-object", () => {
      expect(guards.isListTestExecutionsArgs(null)).toBe(false);
    });
  });

  describe("isCreateTestExecutionArgs", () => {
    it("should return true for valid args", () => {
      expect(
        guards.isCreateTestExecutionArgs({
          projectKey: "PROJ",
          testCaseKey: "PROJ-T1",
        }),
      ).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(guards.isCreateTestExecutionArgs({ projectKey: "PROJ" })).toBe(
        false,
      );
    });
  });

  describe("isUpdateTestExecutionArgs", () => {
    it("should return true for valid args", () => {
      expect(
        guards.isUpdateTestExecutionArgs({ testExecutionIdOrKey: "PROJ-E1" }),
      ).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(guards.isUpdateTestExecutionArgs({})).toBe(false);
    });
  });

  describe("isGetTestExecutionTestStepsArgs", () => {
    it("should return true for valid args", () => {
      expect(
        guards.isGetTestExecutionTestStepsArgs({
          testExecutionIdOrKey: "PROJ-E1",
        }),
      ).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(guards.isGetTestExecutionTestStepsArgs({})).toBe(false);
    });
  });

  describe("isUpdateTestExecutionTestStepsArgs", () => {
    it("should return true for valid args", () => {
      expect(
        guards.isUpdateTestExecutionTestStepsArgs({
          testExecutionIdOrKey: "PROJ-E1",
          testSteps: [],
        }),
      ).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(
        guards.isUpdateTestExecutionTestStepsArgs({
          testExecutionIdOrKey: "PROJ-E1",
        }),
      ).toBe(false);
    });
    it("should return false for wrong type (testSteps)", () => {
      expect(
        guards.isUpdateTestExecutionTestStepsArgs({
          testExecutionIdOrKey: "PROJ-E1",
          testSteps: {},
        }),
      ).toBe(false);
    });
  });

  // --- Project Guards ---
  describe("isGetProjectArgs", () => {
    it("should return true for valid args", () => {
      expect(guards.isGetProjectArgs({ projectIdOrKey: "PROJ" })).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(guards.isGetProjectArgs({})).toBe(false);
    });
  });

  describe("isListProjectsArgs", () => {
    it("should return true for valid args (empty object)", () => {
      expect(guards.isListProjectsArgs({})).toBe(true);
    });
    it("should return true for valid args with optional props", () => {
      expect(guards.isListProjectsArgs({ maxResults: 10 })).toBe(true);
    });
    it("should return false for non-object", () => {
      expect(guards.isListProjectsArgs([])).toBe(false);
    });
  });

  // --- Folder Guards ---
  describe("isGetFolderArgs", () => {
    it("should return true for valid args", () => {
      expect(guards.isGetFolderArgs({ folderId: 123 })).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(guards.isGetFolderArgs({})).toBe(false);
    });
    it("should return false for wrong type", () => {
      expect(guards.isGetFolderArgs({ folderId: "123" })).toBe(false);
    });
  });

  describe("isListFoldersArgs", () => {
    it("should return true for valid args (empty object)", () => {
      expect(guards.isListFoldersArgs({})).toBe(true);
    });
    it("should return true for valid args with optional props", () => {
      expect(guards.isListFoldersArgs({ projectKey: "PROJ" })).toBe(true);
    });
    it("should return false for non-object", () => {
      expect(guards.isListFoldersArgs(false)).toBe(false);
    });
  });

  describe("isCreateFolderArgs", () => {
    it("should return true for valid args", () => {
      expect(
        guards.isCreateFolderArgs({ name: "Folder", projectKey: "PROJ" }),
      ).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(guards.isCreateFolderArgs({ name: "Folder" })).toBe(false);
    });
  });

  // --- Status Guards ---
  describe("isListStatusesArgs", () => {
    it("should return true for valid args (empty object)", () => {
      expect(guards.isListStatusesArgs({})).toBe(true);
    });
    it("should return true for valid args with optional props", () => {
      expect(guards.isListStatusesArgs({ projectKey: "PROJ" })).toBe(true);
    });
    it("should return false for non-object", () => {
      expect(guards.isListStatusesArgs(undefined)).toBe(false);
    });
  });

  // --- Priority Guards ---
  describe("isListPrioritiesArgs", () => {
    it("should return true for valid args (empty object)", () => {
      expect(guards.isListPrioritiesArgs({})).toBe(true);
    });
    it("should return true for valid args with optional props", () => {
      expect(guards.isListPrioritiesArgs({ projectKey: "PROJ" })).toBe(true);
    });
    it("should return false for non-object", () => {
      expect(guards.isListPrioritiesArgs(1)).toBe(false);
    });
  });

  // --- Environment Guards ---
  describe("isListEnvironmentsArgs", () => {
    it("should return true for valid args (empty object)", () => {
      expect(guards.isListEnvironmentsArgs({})).toBe(true);
    });
    it("should return true for valid args with optional props", () => {
      expect(guards.isListEnvironmentsArgs({ projectKey: "PROJ" })).toBe(true);
    });
    it("should return false for non-object", () => {
      expect(guards.isListEnvironmentsArgs("test")).toBe(false);
    });
  });

  // --- Link Guards ---
  describe("isDeleteLinkArgs", () => {
    it("should return true for valid args", () => {
      expect(guards.isDeleteLinkArgs({ linkId: 456 })).toBe(true);
    });
    it("should return false for missing property", () => {
      expect(guards.isDeleteLinkArgs({})).toBe(false);
    });
    it("should return false for wrong type", () => {
      expect(guards.isDeleteLinkArgs({ linkId: "456" })).toBe(false);
    });
  });
});
