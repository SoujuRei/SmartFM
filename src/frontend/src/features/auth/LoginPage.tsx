import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME_ROUTE, type UserRole } from '../../constants/enums';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const schema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const res = await authApi.login(data);
      const { access_token, user } = res.data;
      login(access_token, user as Parameters<typeof login>[1]);
      navigate(ROLE_HOME_ROUTE[user.role as UserRole], { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg ?? 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#2563eb] rounded-md mb-4">
            <span
              className="material-symbols-outlined text-white text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_shipping
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold text-[#131b2e] tracking-tight">Freight Ledger</h1>
          <p className="text-sm text-[#505f76] mt-2">Sign in to your logistics workspace</p>
        </div>

        {/* Card */}
        <div className="bg-[#ffffff] rounded-md border border-[#c3c6d7] shadow-[0_1px_0_rgba(32,27,22,0.08)] p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
              error={errors.password?.message}
            />

            {serverError && (
              <div className="flex items-center gap-2 text-sm text-[#93000a] bg-[#ffdad6] rounded-md px-3 py-2">
                <span className="material-symbols-outlined text-base">error</span>
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              disabled={!isValid}
            >
              Sign in
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-[#c3c6d7]">
            <p className="text-xs text-center text-[#737686] mb-3 font-semibold uppercase tracking-wide">
              Demo Accounts (password: password)
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-[#505f76]">
              <div className="bg-[#f2f3ff] rounded-md p-2">
                <p className="font-semibold text-[#131b2e]">Customer</p>
                <p>customer@demo.com</p>
              </div>
              <div className="bg-[#f2f3ff] rounded-md p-2">
                <p className="font-semibold text-[#131b2e]">Staff</p>
                <p>staff@demo.com</p>
              </div>
              <div className="bg-[#f2f3ff] rounded-md p-2">
                <p className="font-semibold text-[#131b2e]">Driver</p>
                <p>driver@demo.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
