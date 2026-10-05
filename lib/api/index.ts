import { config } from "@/lib/config";
import type { ApiAdapter } from "./contracts";
import { mockApi } from "./mock";
import { realApi } from "./real";

export const api: ApiAdapter = config.apiMode === "real" ? realApi : mockApi;
