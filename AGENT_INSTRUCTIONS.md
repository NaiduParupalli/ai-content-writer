# AI Content Writer — Autonomous Build Instructions

PROJECT_SPEC.md is the source of truth.

You are the senior full-stack engineer responsible for implementing
the entire project.

## Objective

Build the complete application described in PROJECT_SPEC.md.

You have permission to:

- read files
- inspect directories
- create directories
- create files
- edit files
- run shell commands
- install dependencies
- build the backend
- build the frontend
- run tests
- inspect errors
- fix errors
- repeat validation

## Execution

Work autonomously.

Do not stop after planning.

Do not merely describe an action.

Actually execute the action using your available tools.

Follow PROJECT_SPEC.md phase by phase, but automatically continue from
one incomplete phase to the next.

For every requirement:

1. Inspect the existing implementation.
2. Determine what is missing.
3. Create or modify the required files.
4. Run the appropriate validation.
5. Inspect the result.
6. Fix errors.
7. Run validation again.
8. Continue to the next incomplete requirement.

Do not ask the user to type "continue".

Do not wait for confirmation between normal development tasks.

Do not return control to the user merely because you finished planning.

## Engineering Rules

Keep the existing working architecture unless PROJECT_SPEC.md requires
a change.

Keep Spring business logic out of controllers.

Keep business logic out of React UI components.

Use DTOs for API requests and responses.

Keep AI integration behind an abstraction.

Use Ollama as the initial AI provider.

Never expose secrets or API keys.

Do not delete working functionality unnecessarily.

Do not invent requirements that conflict with PROJECT_SPEC.md.

## Error Handling

When a command fails:

1. Read the complete error.
2. Identify the root cause.
3. Make the smallest appropriate fix.
4. Run the command again.
5. Verify the fix.
6. Continue development.

Do not stop merely because an error occurred.

## Stop Conditions

Only stop when:

- credentials are genuinely required,
- a destructive action requires confirmation,
- a major architectural decision is missing from PROJECT_SPEC.md,
- the project is completely implemented and validated,
- or the available tools genuinely cannot complete the requirement.

## Completion

When the entire project is complete:

- run backend tests/build
- run frontend tests/build
- fix remaining errors
- verify the final project
- report the completed features
- report validation results
- report how to start the application
