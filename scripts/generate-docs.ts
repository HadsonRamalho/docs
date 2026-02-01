import { env } from "@/lib/env";
import { generateFiles } from "fumadocs-openapi";
import { createOpenAPI } from "fumadocs-openapi/server";
import { openapi } from "@/lib/openapi";

async function run() {
  env.loadEnv();
  const mode = env.get("NEXT_PUBLIC_MODE");

  const services = env.getOpenAPIServices();

  for (const service of services) {
    console.log(`\nProcessando: ${service.name}`);

    const openapi = createOpenAPI({
      input: [service.source],
    });

    await generateFiles({
      input: openapi,
      output: service.outputDir,
      includeDescription: true,
    });

    console.log(
      `Documentação gerada em: ${service.outputDir}, no modo ${mode}`,
    );
  }
}

if (openapi) {
  run().catch(console.error);
} else {
  console.error(
    "Erro ao gerar docs de endpoints. O modo configurado é: ",
    env.get("NEXT_PUBLIC_MODE"),
  );
}
