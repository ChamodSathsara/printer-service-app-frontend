"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { FullPageSpinner } from "@/components/ui/Common";
import { Sidebar } from "@/components/Sidebar";

export default function ManagerLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    } else if (!loading && user?.role !== "manager") {
      router.replace("/technician/home");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "manager") {
    return <FullPageSpinner />;
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 px-4 pb-10 pt-20 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}