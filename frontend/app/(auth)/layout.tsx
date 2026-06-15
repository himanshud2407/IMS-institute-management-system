import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex bg-linear-to-tr from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary-500/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Main Grid container */}
      <div className="w-full grid lg:grid-cols-12 max-w-7xl mx-auto z-10 p-4 sm:p-6 lg:p-8 items-center">
        {/* Left column (Visual Branding & Taglines) — Hidden on medium screens and below */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center text-white px-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-primary-500 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-primary-500/30">
              I
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wider bg-clip-text bg-linear-to-r from-white via-slate-200 to-primary-200">
              IMS Portal
            </h1>
          </div>
          
          <div className="space-y-4 max-w-lg">
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
              Manage your institute with{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-400 to-indigo-400">
                efficiency and precision.
              </span>
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Experience the next generation of academic planning, automated grading, role-based scheduling, and transparent fee processing. Everything you need, centralized.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 text-slate-300">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-lg backdrop-blur-xs">
              <span className="text-primary-400 font-bold text-lg">99%</span>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Uptime</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-lg backdrop-blur-xs">
              <span className="text-primary-400 font-bold text-lg">RBAC</span>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Security</span>
            </div>
          </div>
        </div>

        {/* Right column (Auth forms embedded in card) */}
        <div className="col-span-12 lg:col-span-6 flex justify-center items-center">
          <div className="w-full max-w-md animate-slide-up">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
