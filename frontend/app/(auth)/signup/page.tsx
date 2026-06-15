'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

import { registerSchema, RegisterFormData } from '../../../schemas/auth';
import { authService } from '../../../services/auth';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      role: 'STUDENT',
      password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.register({
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        password: data.password,
        confirm_password: data.confirm_password,
      });

      if (response.success) {
        const { user } = response.data;
        toast.success(`Account created successfully! Welcome, ${user.full_name}.`);

        // Redirect based on role
        if (user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (user.role === 'TEACHER') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      } else {
        toast.error(response.message || 'Registration failed.');
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { errors?: { email?: string[] }; message?: string } };
        message?: string;
      };
      const errorMsg =
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please check your inputs.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="glass" className="w-full">
      <CardHeader className="text-center pb-2 border-b-0 bg-transparent">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Create Account
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Join the Institute Management System platform
        </p>
      </CardHeader>

      <CardBody className="pt-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="full_name"
            type="text"
            label="Full Name"
            placeholder="John Doe"
            error={errors.full_name?.message}
            leftIcon={<User className="w-4 h-4" />}
            className="bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-primary-500"
            disabled={isLoading}
            {...register('full_name')}
          />

          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="name@example.com"
            error={errors.email?.message}
            leftIcon={<Mail className="w-4 h-4" />}
            className="bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-primary-500"
            disabled={isLoading}
            {...register('email')}
          />

          {/* Role selection dropdown */}
          <div className="w-full flex flex-col gap-1.5 animate-fade-in">
            <label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Role
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 select-none pointer-events-none">
                <Shield className="w-4 h-4" />
              </span>
              <select
                id="role"
                className={clsx(
                  'w-full pl-10 pr-4 py-2.5 bg-slate-900/50 text-white border rounded-lg text-sm shadow-sm transition-all duration-200 outline-hidden border-white/10 focus:border-primary-500 focus:ring-4 focus:ring-primary-900/40 cursor-pointer appearance-none'
                )}
                disabled={isLoading}
                {...register('role')}
              >
                <option value="STUDENT" className="bg-slate-900 text-white">Student</option>
                <option value="TEACHER" className="bg-slate-900 text-white">Teacher</option>
                <option value="ADMIN" className="bg-slate-900 text-white">Administrator</option>
              </select>
              {/* Custom arrow icon for select dropdown */}
              <div className="absolute right-3.5 pointer-events-none text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {errors.role && (
              <p className="text-xs text-red-500 font-medium mt-0.5">{errors.role.message}</p>
            )}
          </div>

          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            helperText="Min. 8 characters, at least 1 uppercase, 1 lowercase, 1 number."
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            className="bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-primary-500"
            disabled={isLoading}
            {...register('password')}
          />

          <Input
            id="confirm_password"
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            error={errors.confirm_password?.message}
            leftIcon={<Lock className="w-4 h-4" />}
            className="bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-primary-500"
            disabled={isLoading}
            {...register('confirm_password')}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
            size="lg"
          >
            Create Account
          </Button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary-400 hover:text-primary-300 font-bold"
          >
            Sign In Instead
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
