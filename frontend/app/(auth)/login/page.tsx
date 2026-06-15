'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

import { loginSchema, LoginFormData } from '../../../schemas/auth';
import { authService } from '../../../services/auth';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });

      if (response.success) {
        const { user } = response.data;
        toast.success(`Welcome back, ${user.full_name}!`);

        // Redirect based on role
        if (user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (user.role === 'TEACHER') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      } else {
        toast.error(response.message || 'Authentication failed.');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Invalid email or password. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="glass" className="w-full">
      <CardHeader className="text-center pb-2 border-b-0 bg-transparent">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Sign In
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Access your Institute Management System workspace
        </p>
      </CardHeader>

      <CardBody className="pt-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="name@example.com"
            error={errors.email?.message}
            leftIcon={<Mail className="w-4 h-4" />}
            className="bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-primary-900/40"
            disabled={isLoading}
            {...register('email')}
          />

          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
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
            className="bg-slate-900/50 border-white/10 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-primary-900/40"
            disabled={isLoading}
            {...register('password')}
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                className="mr-1.5 rounded-sm bg-slate-900 border-white/10 text-primary-600 focus:ring-0 cursor-pointer"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-primary-400 hover:text-primary-300 font-semibold"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
            size="lg"
          >
            Sign In
          </Button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-primary-400 hover:text-primary-300 font-bold"
          >
            Create an Account
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
