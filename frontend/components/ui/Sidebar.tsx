'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  CreditCard,
  Bell,
  BarChart3,
  BookMarked,
  User,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth-store';
import { authService } from '../../services/auth';
import clsx from 'clsx';

interface SidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (isOpen: boolean) => void;
}

export const Sidebar = ({ isMobileOpen = false, setIsMobileOpen }: SidebarProps) => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const role = user?.role || 'STUDENT';

  const handleLogout = async () => {
    await authService.logout();
  };

  // Define sidebar menu items grouped by role
  const menuItems = {
    ADMIN: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Students', href: '/admin/students', icon: Users },
      { label: 'Teachers', href: '/admin/teachers', icon: GraduationCap },
      { label: 'Courses', href: '/admin/courses', icon: BookOpen },
      { label: 'Subjects', href: '/admin/subjects', icon: BookMarked },
      { label: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
      { label: 'Assignments', href: '/admin/assignments', icon: BookMarked },
      { label: 'Exams', href: '/admin/exams', icon: FileSpreadsheet },
      { label: 'Results', href: '/admin/results', icon: Award },
      { label: 'Fees', href: '/admin/fees', icon: CreditCard },
      { label: 'Notifications', href: '/admin/notifications', icon: Bell },
      { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    ],
    TEACHER: [
      { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
      { label: 'Attendance', href: '/teacher/attendance', icon: CalendarCheck },
      { label: 'Assignments', href: '/teacher/assignments', icon: BookMarked },
      { label: 'Results', href: '/teacher/results', icon: Award },
      { label: 'Notifications', href: '/teacher/notifications', icon: Bell },
    ],
    STUDENT: [
      { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Attendance', href: '/student/attendance', icon: CalendarCheck },
      { label: 'Assignments', href: '/student/assignments', icon: BookMarked },
      { label: 'Results', href: '/student/results', icon: Award },
      { label: 'Fees', href: '/student/fees', icon: CreditCard },
      { label: 'Notifications', href: '/student/notifications', icon: Bell },
      { label: 'Profile', href: '/student/profile', icon: User },
    ],
  };

  const currentMenu = menuItems[role as keyof typeof menuItems] || menuItems.STUDENT;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800">
      {/* Brand Logo Header */}
      <div className="flex items-center gap-2 px-6 py-6 border-b border-slate-800/60">
        <div className="w-9 h-9 rounded-lg bg-linear-to-tr from-primary-500 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-primary-500/20">
          I
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white tracking-wider uppercase">IMS Portal</span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
            {role} Workspace
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {currentMenu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen?.(false)}
              className={clsx(
                'flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer',
                {
                  'bg-primary-600 text-white shadow-md shadow-primary-600/10': isActive,
                  'text-slate-400 hover:bg-slate-800/50 hover:text-white': !isActive,
                }
              )}
            >
              <Icon
                className={clsx('w-5 h-5 shrink-0 transition-transform duration-200', {
                  'text-white': isActive,
                  'text-slate-400 group-hover:text-white group-hover:scale-105': !isActive,
                })}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer User logout info */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-all duration-200 group cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 h-screen fixed inset-y-0 left-0 z-20 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Toggleable) */}
      <div
        className={clsx(
          'lg:hidden fixed inset-0 z-30 transition-opacity duration-300 pointer-events-none',
          {
            'opacity-100 pointer-events-auto': isMobileOpen,
            'opacity-0': !isMobileOpen,
          }
        )}
      >
        {/* Mobile Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setIsMobileOpen?.(false)}
        />
        
        {/* Mobile Sidebar Content Wrapper */}
        <aside
          className={clsx(
            'absolute inset-y-0 left-0 w-64 shadow-2xl transition-transform duration-300 ease-in-out',
            {
              'translate-x-0': isMobileOpen,
              '-translate-x-full': !isMobileOpen,
            }
          )}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
};
