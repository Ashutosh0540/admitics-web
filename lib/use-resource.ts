"use client";
import { useCallback, useEffect, useState } from "react";
import { errorMessage, isAbort } from "@/lib/api/errors";

export function useResource<T>(loader: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const refresh = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    setRevision((v) => v + 1);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void loader(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
          setError("");
        }
      })
      .catch((reason) => {
        if (!isAbort(reason) && !controller.signal.aborted)
          setError(errorMessage(reason));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [loader, revision]);
  return { data, loading, error, refresh, setData };
}
