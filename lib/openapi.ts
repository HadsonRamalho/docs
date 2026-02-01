import { createOpenAPI } from "fumadocs-openapi/server";
import { env } from "./env";

function getServersFromEnv() {
  env.loadEnv();
  return env.getServices();
}

function getModeFromEnv() {
  env.loadEnv();
  const mode = env.get("NEXT_PUBLIC_MODE");
  if (!mode) {
    throw new Error("NEXT_PUBLIC_MODE is required");
  }
  return mode;
}

const servers = getServersFromEnv();

export const openapi =
  getModeFromEnv() === "NO_ENDPOINTS"
    ? null
    : createOpenAPI({ input: servers });
