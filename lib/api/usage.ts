import { api } from "./index";
export const usageApi = { get: api.getUsage.bind(api) };
