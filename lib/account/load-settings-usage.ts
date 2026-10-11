import type { Usage } from "@/types";

export function loadSettingsUsage(
  enabled: boolean,
  signal: AbortSignal,
  getUsage: (signal: AbortSignal) => Promise<Usage>,
): Promise<Usage | null> {
  return enabled ? getUsage(signal) : Promise.resolve(null);
}
