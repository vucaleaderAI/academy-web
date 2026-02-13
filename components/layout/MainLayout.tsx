import React from 'react';

interface MainLayoutProps {
  leftSidebar: React.ReactNode;
  rightSidebar: React.ReactNode;
  children: React.ReactNode;
}

export default function MainLayout({ leftSidebar, rightSidebar, children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="mx-auto max-w-[1920px] h-screen p-6">
        <div className="grid grid-cols-10 gap-6 h-full">
          {/* Left Sidebar (20%) */}
          <aside className="col-span-2 h-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {leftSidebar}
          </aside>

          {/* Main Content (60%) */}
          <main className="col-span-6 h-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
            {children}
          </main>

          {/* Right Sidebar (20%) */}
          <aside className="col-span-2 h-full flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {rightSidebar}
          </aside>
        </div>
      </div>
    </div>
  );
};
