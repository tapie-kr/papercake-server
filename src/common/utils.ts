import "dotenv/config";

function parseENVList(input: string): string[] {
  return input.split(",").map((id) => id.trim());
}

const ALLOW_PROJECT_ID = parseENVList(
  process.env["ALLOW_PROJECT_ID"] as string,
);

function isValidProjectId(projectId: string): boolean {
  return ALLOW_PROJECT_ID.includes(projectId);
}

export { parseENVList, isValidProjectId };
