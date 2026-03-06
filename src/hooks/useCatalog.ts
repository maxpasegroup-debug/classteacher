"use client";

import { useEffect, useState } from "react";
import { CatalogResponse } from "@/lib/contracts";

export function useCatalog() {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      try {
        const response = await fetch("/api/catalog");
        const data = (await response.json()) as CatalogResponse;
        if (active) setCatalog(data);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCatalog();
    return () => {
      active = false;
    };
  }, []);

  return { catalog, loading };
}
