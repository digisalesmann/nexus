import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { cn } from '../../lib/utils';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={cn(
      'min-h-screen flex transition-colors duration-300',
      // ── Light: warm off-white, not blinding white ──
      'bg-[#F5F3EF] text-stone-900',
      // ── Dark: near-black with slight warmth ──
      'dark:bg-[#0C0C0D] dark:text-white'
    )}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 min-h-screen">
        {/* Navbar: pinned, matches sidebar width exactly */}
        <div className="fixed top-0 right-0 left-0 lg:left-[240px] z-40">
          <Navbar />
        </div>

        {/* Main content area */}
        <main className={cn(
          'flex-1 min-w-0 transition-all duration-300',
          'pt-[88px] px-6 pb-32',
          'lg:ml-[240px] lg:pt-[88px] lg:px-10 lg:pb-16'
        )}>
          {/* Content container — max width for readability */}
          <div className="w-full max-w-[1200px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};