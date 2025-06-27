# Zephyr Scale MCP Server

This project implements a Model Context Protocol (MCP) server for interacting with the Zephyr Scale Cloud API. It allows Cline (or other compatible MCP clients) to manage Zephyr Scale resources like test cases, test cycles, and test executions.

## Prerequisites

- [Bun](https://bun.sh/) (v1.2.10 or later recommended)

## Setup

1. **Clone the repository (if applicable):**

    ```bash
    git clone <repository-url>
    cd zephyr-mcp
    ```

2. **Install dependencies:**

    ```bash
    bun install
    ```

3. **Configure Environment Variables:**
    - Copy the example environment file:

      ```bash
      cp .env.example .env
      ```

    - Edit the `.env` file and add your Zephyr Scale API Key and Base URL:

      ```
      ZEPHYR_API_KEY=YOUR_ZEPHYR_SCALE_API_KEY
      ZEPHYR_BASE_URL=YOUR_ZEPHYR_SCALE_BASE_URL # e.g., https://api.zephyrscale.smartbear.com/v2
      ```

    - **Generating a Zephyr Scale API Key:**
      - Log in to your Jira instance.
      - Navigate to your user menu (top right corner) and select "Zephyr Scale API Access Tokens".
      - Click "Create Access Token".
      - Copy the generated Access Token (PAT) immediately – you won't be able to see it again. This token is your `ZEPHYR_API_KEY`.
    - **`ZEPHYR_BASE_URL`:** The base URL for the Zephyr Scale Cloud API corresponding to your instance's region. This is crucial for the server to connect to the correct endpoint.
      - **Acceptable Values (based on official documentation):**
        - Default/US Region: `https://api.zephyrscale.smartbear.com/v2`
        - EU Region: `https://eu.api.zephyrscale.smartbear.com/v2`
      - Ensure you use the correct URL for your region in the `.env` file.

## Running the Server

To start the MCP server:

```bash
bun run src/index.ts
```

The server will start and listen for incoming MCP requests. Ensure the `ZEPHYR_API_KEY` is correctly set in your environment or `.env` file.

## Available Tools

This server provides a comprehensive set of tools to interact with Zephyr Scale. All tools are grouped by their functionality below:

### Test Case Tools

- **`get_test_case`**: Get a specific test case by its key.
  - Required parameters:
    - `testCaseKey` (string): The key of the test case (e.g., PROJ-T123)
  - Returns both test case info and test steps in a single response.

- **`list_test_cases`**: List test cases with optional filtering by project, folder, or Jira issue.
  - Optional parameters:
    - `projectKey` (string): Key of the project (e.g., PROJ)
    - `folderId` (number): Numeric ID of the folder
    - `jiraIssueKey` (string): Key of the linked Jira issue (e.g., PROJ-456)
    - Pagination parameters (e.g., `maxResults`, `startAt`) are supported

- **`create_test_case`**: Create a new test case.
  - Required parameters:
    - `name` (string): Name of the test case
    - `projectKey` (string): Key of the project
  - Optional parameters:
    - `folderId` (number): Folder to place the test case in
    - `statusId` (number): Status of the test case
    - `priorityId` (number): Priority of the test case
    - `ownerId` (number): Owner of the test case
    - `jiraIssueKey` (string): Jira issue to link
    - `links` (array): Array of links to associate
    - `parameters` (object): Test case parameters
    - `testScript` (object): Test script information
    - `testSteps` (object): Test steps information

- **`update_test_case`**: Update an existing test case.
  - Required parameters:
    - `testCaseKey` (string): The key of the test case to update
  - Optional parameters:
    - `name` (string): New name for the test case
    - `folderId` (number): New folder ID
    - `statusId` (number): New status ID
    - `priorityId` (number): New priority ID
    - `ownerId` (number): New owner ID
    - `jiraIssueKey` (string): New Jira issue key to link
    - `links` (array): New links to associate
    - `parameters` (object): Updated parameters
    - `testScript` (object): Updated test script
    - `testSteps` (object): Updated test steps

- **`get_test_case_links`**: Get links associated with a test case.
  - Required parameters:
    - `testCaseKey` (string): The key of the test case

- **`create_test_case_issue_link`**: Create an issue link for a test case.
  - Required parameters:
    - `testCaseKey` (string): The key of the test case
    - `issueKey` (string): The key of the issue to link

- **`create_test_case_web_link`**: Create a web link for a test case.
  - Required parameters:
    - `testCaseKey` (string): The key of the test case
    - `url` (string): The URL to link
  - Optional parameters:
    - `description` (string): Description of the link

- **`get_test_case_test_script`**: Get the test script for a test case.
  - Required parameters:
    - `testCaseKey` (string): The key of the test case

- **`create_test_case_test_script`**: Create or update the test script for a test case.
  - Required parameters:
    - `testCaseKey` (string): The key of the test case
    - `type` (string): The type of test script (one of: "STEP_BY_STEP", "BDD", "PLAIN")
  - Optional parameters:
    - `text` (string): The content of the test script
    - `steps` (array): Array of test steps

- **`get_test_case_test_steps`**: Get the test steps for a test case.
  - Required parameters:
    - `testCaseKey` (string): The key of the test case

- **`create_test_case_test_steps`**: Create or update test steps for a test case.
  - Required parameters:
    - `testCaseKey` (string): The key of the test case
    - `steps` (array): Array of test step objects with the following structure:

      ```json
      [
        {
          "description": "Step description (e.g., 'Login to application')",
          "expectedResult": "Expected outcome (e.g., 'User should be logged in successfully')",
          "testData": "Optional test data (e.g., 'username: admin, password: admin123')"
        }
      ]
      ```

  - Optional parameters:
    - `mode` (string): Mode for creating test steps - "OVERWRITE" (default) or "APPEND"

- **`update_test_case_test_steps`**: Update test steps for a test case with specified mode.
  - Required parameters:
    - `testCaseKey` (string): The key of the test case
    - `steps` (array): Array of test step objects (same structure as create_test_case_test_steps)
  - Optional parameters:
    - `mode` (string): Mode for updating test steps - "OVERWRITE" (default) or "APPEND"
      - "OVERWRITE": Replaces all existing test steps with the new ones
      - "APPEND": Adds the new test steps to the end of the existing list

### Test Cycle Tools

- **`get_test_cycle`**: Get a specific test cycle by its ID or key.
  - Required parameters:
    - `testCycleIdOrKey` (string): The ID or key of the test cycle

- **`list_test_cycles`**: List test cycles with optional filtering.
  - Optional parameters:
    - `projectKey` (string): Key of the project
    - `folderId` (number): ID of the folder
    - `jiraIssueKey` (string): Key of a linked Jira issue
    - Pagination parameters (e.g., `maxResults`, `startAt`) are supported

- **`create_test_cycle`**: Create a new test cycle.
  - Required parameters:
    - `name` (string): Name of the test cycle
    - `projectKey` (string): Key of the project
  - Optional parameters:
    - `folderId` (number): Folder to place the test cycle in
    - `statusId` (number): Status of the test cycle
    - `ownerId` (number): Owner of the test cycle
    - `startDate` (string): Start date in ISO format
    - `endDate` (string): End date in ISO format
    - `jiraIssueKey` (string): Jira issue to link
    - `links` (array): Array of links to associate

- **`update_test_cycle`**: Update an existing test cycle.
  - Required parameters:
    - `testCycleIdOrKey` (string): The ID or key of the test cycle to update
  - Optional parameters:
    - `name` (string): New name for the test cycle
    - `folderId` (number): New folder ID
    - `statusId` (number): New status ID
    - `ownerId` (number): New owner ID
    - `startDate` (string): Updated start date
    - `endDate` (string): Updated end date
    - `jiraIssueKey` (string): New Jira issue key
    - `links` (array): Updated links

### Test Execution Tools

- **`get_test_execution`**: Get a specific test execution by its ID or key.
  - Required parameters:
    - `testExecutionIdOrKey` (string): The ID or key of the test execution

- **`list_test_executions`**: List test executions with optional filtering.
  - Optional parameters:
    - `projectKey` (string): Key of the project
    - `testCaseKey` (string): Key of the test case
    - `testCycleKey` (string): Key of the test cycle
    - `statusId` (number): Filter by status ID
    - `environmentId` (number): Filter by environment ID
    - `ownerId` (number): Filter by owner ID
    - `jiraIssueKey` (string): Filter by linked Jira issue
    - Pagination parameters (e.g., `maxResults`, `startAt`) are supported

- **`create_test_execution`**: Create a new test execution.
  - Required parameters:
    - `projectKey` (string): Key of the project
    - `testCaseKey` (string): Key of the test case
  - Optional parameters:
    - `testCycleKey` (string): Key of the test cycle
    - `statusId` (number): Status of the execution
    - `environmentId` (number): Environment ID
    - `ownerId` (number): Owner of the execution
    - `executedDate` (string): Date of execution in ISO format
    - `jiraIssueKey` (string): Jira issue to link
    - `links` (array): Array of links to associate
    - `testSteps` (object): Test steps information

- **`update_test_execution`**: Update an existing test execution.
  - Required parameters:
    - `testExecutionIdOrKey` (string): The ID or key of the test execution to update
  - Optional parameters:
    - `statusId` (number): New status ID
    - `environmentId` (number): New environment ID
    - `ownerId` (number): New owner ID
    - `executedDate` (string): Updated execution date
    - `jiraIssueKey` (string): New Jira issue key
    - `links` (array): Updated links
    - `testSteps` (object): Updated test steps

- **`get_test_execution_test_steps`**: Get the test steps for a test execution.
  - Required parameters:
    - `testExecutionIdOrKey` (string): The ID or key of the test execution

- **`update_test_execution_test_steps`**: Update test steps for a test execution.
  - Required parameters:
    - `testExecutionIdOrKey` (string): The ID or key of the test execution
    - `testSteps` (object): Updated test step information

### Project Tools

- **`get_project`**: Get a specific project by its ID or key.
  - Required parameters:
    - `projectIdOrKey` (string): The ID or key of the project

- **`list_projects`**: List all accessible projects.
  - No required parameters
  - Pagination parameters (e.g., `maxResults`, `startAt`) are supported

### Folder Tools

- **`get_folder`**: Get a specific folder by its ID.
  - Required parameters:
    - `folderId` (number): The ID of the folder

- **`list_folders`**: List folders with optional filtering.
  - Optional parameters:
    - `projectKey` (string): Key of the project
    - `type` (string): Type of the folder (one of: "TEST_CASE", "TEST_CYCLE")
    - Pagination parameters (e.g., `maxResults`, `startAt`) are supported

- **`create_folder`**: Create a new folder.
  - Required parameters:
    - `name` (string): Name of the folder
    - `type` (string): Type of the folder (one of: "TEST_CASE", "TEST_CYCLE")
    - `projectKey` (string): Key of the project
  - Optional parameters:
    - `description` (string): Description of the folder
    - `parentFolderId` (number): ID of the parent folder

### Status, Priority, and Environment Tools

- **`list_statuses`**: List available statuses with optional filtering.
  - Optional parameters:
    - `type` (string): Type of status (one of: "TEST_CASE", "TEST_CYCLE", "TEST_EXECUTION")
    - `projectKey` (string): Key of the project
    - Pagination parameters (e.g., `maxResults`, `startAt`) are supported

- **`list_priorities`**: List all available priorities.
  - No required parameters
  - Pagination parameters (e.g., `maxResults`, `startAt`) are supported

- **`list_environments`**: List all available environments.
  - No required parameters
  - Pagination parameters (e.g., `maxResults`, `startAt`) are supported

### Link Tools

- **`delete_link`**: Delete a link by its ID.
  - Required parameters:
    - `linkId` (number): The ID of the link to delete

## Example Usage

Here are a few examples of how to use these tools:

```
// Get a list of all projects
{
  "tool_name": "list_projects",
  "arguments": {}
}

// Get a list of test cases with pagination
{
  "tool_name": "list_test_cases",
  "arguments": {
    "projectKey": "YOUR-PROJECT-KEY",
    "maxResults": 10,
    "startAt": 0
  }
}

// Get a specific test case
{
  "tool_name": "get_test_case",
  "arguments": {
    "testCaseKey": "YOUR-PROJECT-KEY-T123"
  }
}

// Create a new test case
{
  "tool_name": "create_test_case",
  "arguments": {
    "name": "Login Authentication Test",
    "projectKey": "YOUR-PROJECT-KEY",
    "priorityId": 1,
    "statusId": 2
  }
}

// Create a new test cycle
{
  "tool_name": "create_test_cycle",
  "arguments": {
    "projectKey": "YOUR-PROJECT-KEY",
    "name": "Sprint 12 Regression",
    "startDate": "2025-05-01T00:00:00Z",
    "endDate": "2025-05-15T00:00:00Z"
  }
}

// Create a test execution
{
  "tool_name": "create_test_execution",
  "arguments": {
    "projectKey": "YOUR-PROJECT-KEY",
    "testCaseKey": "YOUR-PROJECT-KEY-T123",
    "testCycleKey": "YOUR-PROJECT-KEY-R1",
    "statusId": 1
  }
}

// Create test steps for a test case
{
  "tool_name": "create_test_case_test_steps",
  "arguments": {
    "testCaseKey": "YOUR-PROJECT-KEY-T123",
    "steps": [
      {
        "description": "Navigate to login page",
        "expectedResult": "Login page should be displayed",
        "testData": "URL: https://app.example.com/login"
      },
      {
        "description": "Enter valid credentials",
        "expectedResult": "User should be logged in successfully",
        "testData": "username: testuser, password: testpass123"
      }
    ],
    "mode": "OVERWRITE"
  }
}

// Update test steps (append new steps)
{
  "tool_name": "update_test_case_test_steps",
  "arguments": {
    "testCaseKey": "YOUR-PROJECT-KEY-T123",
    "steps": [
      {
        "description": "Verify dashboard widgets",
        "expectedResult": "All dashboard widgets should be displayed correctly"
      }
    ],
    "mode": "APPEND"
  }
}
```

## LICENCE

This project is licensed under the MIT License - see the [LICENCE](LICENCE) file for details.
