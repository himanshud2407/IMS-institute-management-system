'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/ui/Sidebar';
import { Header } from '../../components/ui/Header';
import { useAuthStore } from '../../store/auth-store';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initialize, isLoading } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Top Header */}
        <Header onMenuClick={() => setIsMobileOpen(!isMobileOpen)} />

        {/* Dynamic page contents */}
        <main className="flex-1 p-6 md:p-8 animate-fade-in max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
