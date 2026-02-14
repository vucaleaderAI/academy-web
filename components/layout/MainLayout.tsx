import React from 'react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  leftSidebar: React.ReactNode;
  rightSidebar?: React.ReactNode; // Made optional
  children: React.ReactNode;
  className?: string; // Allow custom grid classes
}

export default function MainLayout({ leftSidebar, rightSidebar, children, className }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="mx-auto max-w-[1920px] h-screen p-6">
        {/* Default grid is 2-6-2 if rightSidebar exists, else 2-8 */}
        <div className={cn(
          "grid gap-6 h-full",
          className ? className : (rightSidebar ? "grid-cols-10" : "grid-cols-10")
          // Currently hardcoded to 10 cols, let's keep it but allow overriding
        )}>
          {/* Left Sidebar (Usually 2 cols) */}
          <aside className="col-span-2 h-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {leftSidebar}
          </aside>

          {/* Main Content */}
          <main className={cn(
            "h-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative",
            rightSidebar ? "col-span-6" : "col-span-8"
          )}>
            {children}
          </main>

          {/* Right Sidebar (Optional) */}
          {rightSidebar && (
            <aside className="col-span-2 h-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {rightSidebar}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
