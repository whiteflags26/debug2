"use client";

import RouteGuard from "@/components/RouteGuard";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard>
      {children}
    </RouteGuard>
  );
}