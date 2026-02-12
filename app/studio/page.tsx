"use client";

import dynamic from "next/dynamic";
import { createPostgresAdapter } from "@prisma/studio-core/data/postgres-core";
import { createStudioBFFClient } from "@prisma/studio-core/data/bff";
import { useMemo, Suspense } from "react";
import StudioWrapper from "@/components/global/StudioWrapper";

// Dynamically import Studio with no SSR to avoid hydration issues
const Studio = dynamic(
  () => import("@prisma/studio-core/ui").then((mod) => mod.Studio),
  {
    ssr: false,
  },
);

// Loading component
const StudioLoading = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading Studio...</p>
    </div>
  </div>
);

// Client-only Studio component
const ClientOnlyStudio = () => {
  const adapter = useMemo(() => {
    // Create the HTTP client that communicates with our API endpoint
    const executor = createStudioBFFClient({
      url: "/api/studio",
    });

    // Create the PostgreSQL adapter using the executor
    return createPostgresAdapter({ executor });
  }, []);

  return <Studio adapter={adapter} />;
};

export default function App() {
  return (
    <StudioWrapper>
      <Suspense fallback={<StudioLoading />}>
        <ClientOnlyStudio />
      </Suspense>
    </StudioWrapper>
  );
}
