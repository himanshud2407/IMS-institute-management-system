'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, User, Mail, Shield, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '../../../../store/auth-store';
import { authService } from '../../../../services/auth';
import { changePasswordSchema, ChangePasswordFormData } from '../../../../schemas/auth';
import { Card, CardBody, CardHeader } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';

export default function StudentProfile() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_new_password: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
        confirm_new_password: data.confirm_new_password,
      });

      if (response.success) {
        toast.success('Password changed successfully.');
        reset();
      } else {
        toast.error(response.message || 'Failed to change password.');
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const errorMsg =
        err.response?.data?.errors?.old_password?.[0] ||
        err.response?.data?.message ||
        err.message ||
        'Password change failed. Verify your old password.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account information and security settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center font-bold text-2xl text-primary-700 mx-auto border border-primary-200 shadow-xs select-none">
                {user?.full_name ? user.full_name.split(' ').map((n) => n[0]).slice(0,2).join('').toUpperCase() : <User className="w-8 h-8" />}
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-4 tracking-tight">{user?.full_name}</h3>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mt-0.5">{user?.role}</span>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Mail className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Email Address</span>
                  <span className="truncate block mt-0.5">{user?.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Shield className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Access Role</span>
                  <span className="block mt-0.5 capitalize">{user?.role ? user.role.toLowerCase() : 'Student'}</span>
                </div>
              </div>

              {user?.created_at && (
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <Calendar className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Member Since</span>
                    <span className="block mt-0.5">{formatDate(user.created_at)}</span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Change Password Card */}
        <div className="md:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Change Password</h3>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  id="old_password"
                  type={showOldPassword ? 'text' : 'password'}
                  label="Current Password"
                  placeholder="••••••••"
                  error={errors.old_password?.message}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  disabled={isLoading}
                  {...register('old_password')}
                />

                <Input
                  id="new_password"
                  type={showNewPassword ? 'text' : 'password'}
                  label="New Password"
                  placeholder="••••••••"
                  error={errors.new_password?.message}
                  helperText="Min. 8 characters, at least 1 uppercase, 1 lowercase, 1 number."
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  disabled={isLoading}
                  {...register('new_password')}
                />

                <Input
                  id="confirm_new_password"
                  type="password"
                  label="Confirm New Password"
                  placeholder="••••••••"
                  error={errors.confirm_new_password?.message}
                  leftIcon={<Lock className="w-4 h-4" />}
                  disabled={isLoading}
                  {...register('confirm_new_password')}
                />

                <div className="pt-2 flex justify-end">
                  <Button type="submit" isLoading={isLoading}>
                    Update Password
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
