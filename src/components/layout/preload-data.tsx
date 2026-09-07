"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function PreloadData() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Silently pre-warm and prefetch all primary dashboard data on background thread
    const prefetchApp = async () => {
      try {
        // 1. Master data (Categories & Profile)
        queryClient.prefetchQuery({
          queryKey: ["master-data"],
          queryFn: async () => {
            const res = await fetch("/api/master-data");
            const json = await res.json();
            return json.data;
          },
          staleTime: 1000 * 60 * 30,
        });

        // 2. Dashboard Stats
        queryClient.prefetchQuery({
          queryKey: ["dashboard-stats"],
          queryFn: async () => {
            const res = await fetch("/api/dashboard/stats");
            const json = await res.json();
            return json.data;
          },
          staleTime: 1000 * 60 * 15,
        });

        // 3. Primary Logbook List (default filters)
        queryClient.prefetchQuery({
          queryKey: ["logbooks", "", "ALL", "ALL", "", "", 1, "list"],
          queryFn: async () => {
            const res = await fetch("/api/logbooks?page=1&limit=10");
            const json = await res.json();
            return json.data;
          },
          staleTime: 1000 * 60 * 15,
        });

        // 4. Reports data
        queryClient.prefetchQuery({
          queryKey: ["reports", "", "", "ALL", "ALL"],
          queryFn: async () => {
            const res = await fetch("/api/reports");
            const json = await res.json();
            return json.data;
          },
          staleTime: 1000 * 60 * 15,
        });

        // 5. All logbooks for weekly resume
        queryClient.prefetchQuery({
          queryKey: ["all-logbooks-weekly"],
          queryFn: async () => {
            const res = await fetch("/api/logbooks?limit=1000");
            const json = await res.json();
            return json.data?.items || [];
          },
          staleTime: 1000 * 60 * 15,
        });
      } catch {
        // Silently ignore prefetch network errors
      }
    };

    prefetchApp();
  }, [queryClient]);

  return null;
}
