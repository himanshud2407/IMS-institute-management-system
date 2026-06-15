'use client';

import React from 'react';
import { Menu, User, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/auth-store';
import { Badge } from './Badge';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuthStore();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getRoleBadgeVariant = (role: string | undefined) => {
    switch (role) {
      case 'ADMIN':
        return 'primary';
      case 'TEACHER':
        return 'warning';
      case 'STUDENT':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <header className="sticky top-0 z-10 w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 flex items-center justify-between">
      {/* Left side: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Portal Workspace
          </h2>
        </div>
      </div>

      {/* Right side: User info & notifications */}
      <div className="flex items-center gap-4">
        {/* Simple Notification Bell Indicator */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* User profile dropdown anchor */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-sm font-semibold text-slate-800 tracking-tight">
                {user.full_name}
              </span>
              <div className="mt-0.5">
                <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                  {user.role}
                </Badge>
              </div>
            </div>

            {/* Avatar Display */}
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-primary-600 border border-slate-200 select-none">
              {user.full_name ? getInitials(user.full_name) : <User className="w-4 h-4 text-slate-400" />}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
