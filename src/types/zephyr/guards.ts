import type {
  GetTestCaseArgs,
  ListTestCasesArgs,
  CreateTestCaseArgs,
  UpdateTestCaseArgs,
  GetTestCaseLinksArgs,
  CreateTestCaseIssueLinkArgs,
  CreateTestCaseWebLinkArgs,
  GetTestCaseTestScriptArgs,
  CreateTestCaseTestScriptArgs,
  GetTestCaseTestStepsArgs,
  CreateTestCaseTestStepsArgs,
  UpdateTestCaseTestStepsArgs,
} from "./test-case";
import type {
  GetTestCycleArgs,
  ListTestCyclesArgs,
  CreateTestCycleArgs,
  UpdateTestCycleArgs,
} from "./test-cycle";
import type {
  GetTestExecutionArgs,
  ListTestExecutionsArgs,
  CreateTestExecutionArgs,
  UpdateTestExecutionArgs,
  GetTestExecutionTestStepsArgs,
  UpdateTestExecutionTestStepsArgs,
} from "./test-execution";
import type { GetProjectArgs, ListProjectsArgs } from "./project";
import type {
  GetFolderArgs,
  ListFoldersArgs,
  CreateFolderArgs,
} from "./folder";
import type { ListStatusesArgs } from "./status";
import type { ListPrioritiesArgs } from "./priority";
import type { ListEnvironmentsArgs } from "./environment";
import type { DeleteLinkArgs } from "./link";

// Helper function to check if a value is a string
function isString(value: any): value is string {
  return typeof value === "string";
}

// Helper function to check if a value is a number
function isNumber(value: any): value is number {
  return typeof value === "number";
}

// Helper function to check if a value is a boolean
function isBoolean(value: any): value is boolean {
  return typeof value === "boolean";
}

// Helper function to check if a value is an object
function isObject(value: any): value is object {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Helper function to check if a value is an array
function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

// Helper function to check if an object has all required properties with correct types
function hasRequiredProperties(
  obj: unknown,
  properties: { [k: string]: (value: unknown) => boolean },
): boolean {
  if (!isObject(obj)) {
    return false;
  }

  // Cast to ensure type safety
  const objRecord = obj as Record<string, unknown>;

  for (const key of Object.keys(properties)) {
    if (!(key in objRecord)) {
      return false;
    }

    const validator = properties[key];
    if (typeof validator !== "function") {
      return false;
    }

    if (!validator(objRecord[key])) {
      return false;
    }
  }

  return true;
}

// Test Case Guards
export function isGetTestCaseArgs(args: any): args is GetTestCaseArgs {
  return hasRequiredProperties(args, {
    testCaseKey: isString,
  });
}

export function isListTestCasesArgs(args: any): args is ListTestCasesArgs {
  return isObject(args); // ListTestCasesArgs has optional properties
}

export function isCreateTestCaseArgs(args: any): args is CreateTestCaseArgs {
  return hasRequiredProperties(args, {
    name: isString,
    projectKey: isString,
  });
}

export function isUpdateTestCaseArgs(args: any): args is UpdateTestCaseArgs {
  if (!hasRequiredProperties(args, { testCaseKey: isString })) {
    return false;
  }

  // Ensure at least one field is being updated (excluding testCaseKey)
  const { testCaseKey, ...updateFields } = args;
  return Object.keys(updateFields).length > 0;
}

export function isGetTestCaseLinksArgs(
  args: any,
): args is GetTestCaseLinksArgs {
  return hasRequiredProperties(args, {
    testCaseKey: isString,
  });
}

export function isCreateTestCaseIssueLinkArgs(
  args: any,
): args is CreateTestCaseIssueLinkArgs {
  return hasRequiredProperties(args, {
    testCaseKey: isString,
    issueKey: isString,
  });
}

export function isCreateTestCaseWebLinkArgs(
  args: any,
): args is CreateTestCaseWebLinkArgs {
  return hasRequiredProperties(args, {
    testCaseKey: isString,
    url: isString,
  });
}

export function isGetTestCaseTestScriptArgs(
  args: any,
): args is GetTestCaseTestScriptArgs {
  return hasRequiredProperties(args, {
    testCaseKey: isString,
  });
}

export function isCreateTestCaseTestScriptArgs(
  args: any,
): args is CreateTestCaseTestScriptArgs {
  return hasRequiredProperties(args, {
    testCaseKey: isString,
    type: isString, // Assuming type is a string based on API spec
    steps: isArray, // Assuming steps is an array based on API spec
  });
}

export function isGetTestCaseTestStepsArgs(
  args: any,
): args is GetTestCaseTestStepsArgs {
  return hasRequiredProperties(args, {
    testCaseKey: isString,
  });
}

export function isCreateTestCaseTestStepsArgs(
  args: any,
): args is CreateTestCaseTestStepsArgs {
  return hasRequiredProperties(args, {
    testCaseKey: isString,
    steps: isArray, // Assuming steps is an array based on API spec
  });
}

export function isUpdateTestCaseTestStepsArgs(
  args: any,
): args is UpdateTestCaseTestStepsArgs {
  return hasRequiredProperties(args, {
    testCaseKey: isString,
    steps: isArray, // Assuming steps is an array based on API spec
  });
}

// Test Cycle Guards
export function isGetTestCycleArgs(args: any): args is GetTestCycleArgs {
  return hasRequiredProperties(args, {
    testCycleIdOrKey: isString,
  });
}

export function isListTestCyclesArgs(args: any): args is ListTestCyclesArgs {
  return isObject(args); // ListTestCyclesArgs has optional properties
}

export function isCreateTestCycleArgs(args: any): args is CreateTestCycleArgs {
  return hasRequiredProperties(args, {
    name: isString,
    projectKey: isString,
  });
}

export function isUpdateTestCycleArgs(args: any): args is UpdateTestCycleArgs {
  return hasRequiredProperties(args, {
    testCycleIdOrKey: isString,
  });
}

// Test Execution Guards
export function isGetTestExecutionArgs(
  args: any,
): args is GetTestExecutionArgs {
  return hasRequiredProperties(args, {
    testExecutionIdOrKey: isString,
  });
}

export function isListTestExecutionsArgs(
  args: any,
): args is ListTestExecutionsArgs {
  return isObject(args); // ListTestExecutionsArgs has optional properties
}

export function isCreateTestExecutionArgs(
  args: any,
): args is CreateTestExecutionArgs {
  return hasRequiredProperties(args, {
    projectKey: isString,
    testCaseKey: isString,
  });
}

export function isUpdateTestExecutionArgs(
  args: any,
): args is UpdateTestExecutionArgs {
  return hasRequiredProperties(args, {
    testExecutionIdOrKey: isString,
  });
}

export function isGetTestExecutionTestStepsArgs(
  args: any,
): args is GetTestExecutionTestStepsArgs {
  return hasRequiredProperties(args, {
    testExecutionIdOrKey: isString,
  });
}

export function isUpdateTestExecutionTestStepsArgs(
  args: any,
): args is UpdateTestExecutionTestStepsArgs {
  return hasRequiredProperties(args, {
    testExecutionIdOrKey: isString,
    testSteps: isArray, // Assuming testSteps is an array based on API spec
  });
}

// Project Guards
export function isGetProjectArgs(args: any): args is GetProjectArgs {
  return hasRequiredProperties(args, {
    projectIdOrKey: isString,
  });
}

export function isListProjectsArgs(args: any): args is ListProjectsArgs {
  return isObject(args); // ListProjectsArgs has optional properties
}

// Folder Guards
export function isGetFolderArgs(args: any): args is GetFolderArgs {
  return hasRequiredProperties(args, {
    folderId: isNumber,
  });
}

export function isListFoldersArgs(args: any): args is ListFoldersArgs {
  return isObject(args); // ListFoldersArgs has optional properties
}

export function isCreateFolderArgs(args: any): args is CreateFolderArgs {
  return hasRequiredProperties(args, {
    name: isString,
    projectKey: isString,
  });
}

// Status Guards
export function isListStatusesArgs(args: any): args is ListStatusesArgs {
  return isObject(args); // ListStatusesArgs has optional properties
}

// Priority Guards
export function isListPrioritiesArgs(args: any): args is ListPrioritiesArgs {
  return isObject(args); // ListPrioritiesArgs has optional properties
}

// Environment Guards
export function isListEnvironmentsArgs(
  args: any,
): args is ListEnvironmentsArgs {
  return isObject(args); // ListEnvironmentsArgs has optional properties
}

// Link Guards
export function isDeleteLinkArgs(args: any): args is DeleteLinkArgs {
  return hasRequiredProperties(args, {
    linkId: isNumber,
  });
}
