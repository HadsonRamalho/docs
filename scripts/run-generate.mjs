#!/usr/bin/env node
import { generateFiles } from "fumadocs-openapi";
import { createOpenAPI } from "fumadocs-openapi/server";

// Load environment variables (local fallback, Amplify uses env vars directly)
import { config } from "dotenv";
config({ path: ".env.local" }); // Only loads if file exists, doesn't override existing env vars

const mode = process.env.NEXT_PUBLIC_MODE;
console.log(`Modo configurado: ${mode}`);

if (mode === "NO_ENDPOINTS") {
  console.error("Modo NO_ENDPOINTS não suporta geração de documentação");
  process.exit(1);
}

const SUPPORTED_SERVICES = [
  {
    slug: "api",
    envKey: "NEXT_PUBLIC_API",
    jsonEnvKey: "NEXT_PUBLIC_API_JSON_PATH",
  },
];

const services = SUPPORTED_SERVICES.map((service) => {
  const apiURL = process.env[service.envKey];
  const jsonPath = process.env[service.jsonEnvKey];

  if (mode === "API" && !apiURL) {
    throw new Error(`${service.envKey} é obrigatório no modo API`);
  }
  if (mode === "JSON" && !jsonPath) {
    throw new Error(`${service.jsonEnvKey} é obrigatório no modo JSON`);
  }

  const source =
    mode === "API" ? `${apiURL.replace(/\/+$/, "")}/docs/json` : jsonPath;

  return {
    name: service.slug,
    source: source,
    outputDir: `./content/docs/api-reference/${service.slug}/endpoints`,
  };
});

for (const service of services) {
  console.log(`\nProcessando: ${service.name}`);
  console.log(`Source: ${service.source}`);

  const openapi = createOpenAPI({
    input: [service.source],
  });

  await generateFiles({
    input: openapi,
    output: service.outputDir,
    includeDescription: true,
  });

  console.log(`Documentação gerada em: ${service.outputDir}, no modo ${mode}`);
}

console.log("\nGeração de documentação concluída!");
