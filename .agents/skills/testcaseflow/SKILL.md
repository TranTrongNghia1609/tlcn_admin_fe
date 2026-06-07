---
name: ai-testcase-generation
description: Helps with a specific task. Use when you need to do X or Y.
---
# AI Test Case Generation Flow

This document describes the complete workflow for generating test cases using AI. It is designed to help generate a suitable User Interface (UI) that guides the user through three main phases: **1. Planning**, **2. Code Generation**, and **3. Execution**.

---

## High-Level Overview

The process of generating test cases is broken down into three asynchronous phases. Because AI generation and code execution take time, the UI should expect to poll for status updates or use WebSockets to listen for state changes (`pending` -> `done` | `failed`).

1. **Plan Phase:** The user provides a problem statement and constraints. The AI generates a "Test Case Plan", which is a breakdown of how many test cases belong to different categories (normal, edge, boundary, stress).
2. **Code Generation Phase:** Based on the approved plan, the AI writes Python scripts (Input Generator and Output Generator) that will programmatically create the test case files. The user can review the code and provide feedback to regenerate it if needed.
3. **Execution Phase:** The finalized Python scripts are sent to a compiler service to be executed. The compiler runs the scripts, generates the actual `.in` and `.out` files, zips them, and returns an S3 URL.

---

## Step-by-Step Flow & UI Mapping

### Phase 1: Test Case Planning
**Goal:** Define the problem and get a breakdown of test case categories.

**User Actions in UI:**
- User fills out a form with:
  - `Statement` (Required): The algorithm/problem description.
  - `Input Constraint`: Details about input formats and limits.
  - `Output Constraint`: Details about expected output formats.
  - `Number of Test Cases`: Desired total number of test cases (default: 5, max: 50).
- User clicks **"Generate Plan"**.

**API Integration:**
- **Create Plan:** `POST /api/test-case/plan`
  - **Payload:** `{ statement, inputConstraint, outputConstraint, numberOfTestCases }`
  - **Response:** Returns a `workflowId` and `status: "pending"`.
- **Poll for Status:** `GET /api/test-case/plan/:workflowId`
  - The UI should poll this endpoint until `status` becomes `"done"`.
  - Once done, the UI will receive the `versions` array. The latest version contains `categories` (e.g., normal, edge, boundary, stress) and their respective counts.

**UI State / Display:**
- Display a loading spinner or progress bar while `status === 'pending'`.
- When `done`, display the generated test case categories in a list or chart.
- **Optional Action (Regenerate):** If the user wants to tweak the constraints or statement, they can edit the form and click **"Regenerate Plan"**.
  - **API:** `PUT /api/test-case/plan/:workflowId`

---

### Phase 2: AI Code Generation
**Goal:** Generate the Python scripts that will programmatically build the test cases based on the plan.

**User Actions in UI:**
- Once the plan is marked as `done` and the user is satisfied with the categories, the user clicks **"Generate Code"**.

**API Integration:**
- **Start Code Generation:** `POST /api/test-case/code-generate/:workflowId`
  - **Response:** `status: "pending"`.
- **Poll for Status:** `GET /api/test-case/code-generate/:workflowId`
  - The UI polls until `status` becomes `"done"`.
  - Once done, the response contains `versions`. The latest version will have `inputCode` and `outputCode` (the generated Python scripts).

**UI State / Display:**
- The UI should display two code editor blocks (read-only or with syntax highlighting) showing the `inputCode` and `outputCode`.
- **Feedback Loop (Regenerate with Feedback):** If the generated code looks incorrect, the user can type feedback into a text area and click **"Regenerate Code"**.
  - **API:** `PUT /api/test-case/code-generate/:workflowId`
  - **Payload:** `{ feedback: "Please fix the random integer generation to be within bounds." }`
  - This creates a new version of the code and sets the status back to `pending`.
- The UI should allow users to view previous `versions` of the generated code.

---

### Phase 3: Execution & Output
**Goal:** Run the generated Python scripts to produce the actual test cases (zip file).

**User Actions in UI:**
- When the user is satisfied with the generated Python code, they click **"Execute Code"**.

**API Integration:**
- **Execute Code:** `POST /api/test-case/execute/:workflowId`
  - **Payload:** `{ version: 2 }` (Optional, defaults to the latest version).
  - **Response:** `status: "pending"`.
- **Poll for Result:** *The execution result might be updated via WebSockets or by checking the code generation endpoint again for a `testCaseUrl` (depending on implementation).* Wait for the execution state to finish.

**UI State / Display:**
- Show a terminal-like loader or "Executing..." state.
- Once completed successfully, provide a **"Download Test Cases"** button which links to the resulting S3 URL (`testCaseUrl`).

---

## Data Models Summary

To help structure the UI components, here are the key data structures returned by the APIs:

### 1. Test Case Plan Model
```json
{
  "_id": "60d5ecb8b3b3a3001f3e1234",
  "statement": "Find the sum of an array",
  "inputConstraint": "1 <= N <= 10^5",
  "outputConstraint": "Print the sum",
  "numberOfTestCases": 10,
  "status": "done",
  "versions": [
    {
      "versionNumber": 1,
      "categories": [
        { "category": "normal", "count": 6, "description": "Typical random arrays" },
        { "category": "edge", "count": 2, "description": "Arrays with 1 element" },
        { "category": "stress", "count": 2, "description": "Max size arrays" }
      ]
    }
  ]
}
```

### 2. Test Case Code Model
```json
{
  "_id": "60d5ecb8b3b3a3001f3e5678",
  "planId": "60d5ecb8b3b3a3001f3e1234",
  "status": "done",
  "language": "python",
  "versions": [
    {
      "versionNumber": 1,
      "inputCode": "import random\\nprint(random.randint(1, 10))",
      "outputCode": "import sys\\nprint(sum(map(int, sys.stdin.read().split())))",
      "feedback": null,
      "testCaseUrl": "https://s3.amazonaws.com/bucket/testcases.zip"
    }
  ]
}
```

## Additional Screens / Pages
- **Dashboard / List View:** A page to list all past test case generation workflows.
  - **APIs:** `GET /api/test-case/plan` and `GET /api/test-case/code-generate`
  - **UI:** A table or grid of cards showing the statement preview, date created, and current status (`pending`, `done`, `failed`). Clicking an item opens the detailed 3-phase view described above.
