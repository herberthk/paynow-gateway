"use client";
import "@prisma/studio-core/ui/index.css";
import type { ReactNode } from "react";

interface StudioWrapperProps {
  children: ReactNode;
}

export default function StudioWrapper({ children }: StudioWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Database Studio
            </h1>
            <div className="text-sm text-gray-500">
              Powered by Prisma Studio
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto">
        <div className="h-[calc(100vh-80px)]">{children}</div>
      </main>
    </div>
  );
}
