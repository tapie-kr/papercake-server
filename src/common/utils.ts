import "dotenv/config";

function parseENVList(input: string): string[] {
  const valueString = input.split("=")[1]?.trim();
  if (!valueString) return [];

  return valueString.split(",").map((id) => id.trim());
}

const ALLOW_PROJECT_ID = parseENVList(
  process.env["ALLOW_PROJECT_ID"] as string,
);

function isValidProjectId(projectId: string): boolean {
  return ALLOW_PROJECT_ID.includes(projectId);
}

export { parseENVList, isValidProjectId };
