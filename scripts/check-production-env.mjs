import nextEnv from "@next/env";
import { validateProductionEnvironment } from "./production-env-validation.mjs";

const { loadEnvConfig } = nextEnv;

// Match Next.js production-build env loading, including ignored .env.production*
// files, without exposing any values in this preflight's output.
loadEnvConfig(process.cwd(), false);

const errors = validateProductionEnvironment(process.env);

if (errors.length) {
  console.error("Production environment preflight failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Production environment preflight passed.");
}
