'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  getAuthCallbackUrl,
  getAuthErrorMessage,
  isEmailNotConfirmedError,
} from '@/lib/auth-utils';
import { isAdminEmail } from '@/lib/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'email') {
      setNeedsEmailConfirmation(false);
    }
  };

  const handleResendConfirmation = async () => {
    const email = formData.email.trim();
    if (!email) {
      toast({
        title: "Email required",
        description: "Enter your email address first, then resend the confirmation link.",
        variant: "destructive",
      });
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: getAuthCallbackUrl(),
        },
      });
      if (error) throw error;

      toast({
        title: "Confirmation email sent",
        description: "Check your inbox and spam folder for the verification link.",
      });
    } catch (error: unknown) {
      toast({
        title: "Could not resend email",
        description: error instanceof Error ? error.message : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNeedsEmailConfirmation(false);

    try {
      const email = formData.email.trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      if (error) throw error;
      if (!data.session) {
        throw new Error('Sign in did not return a session. Please verify your email and try again.');
      }

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });

      if (isAdminEmail(email)) {
        router.push("/admin");
      } else {
        router.push("/customer");
      }
    } catch (error: unknown) {
      const authError = error instanceof Error ? error : new Error('Failed to login');
      if (isEmailNotConfirmedError(authError)) {
        setNeedsEmailConfirmation(true);
      }

      toast({
        title: isEmailNotConfirmedError(authError) ? "Email not verified" : "Error",
        description: getAuthErrorMessage(authError),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <h1 className="sr-only">Login</h1>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {justRegistered ? (
            <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-foreground">
              Account created. We sent a verification email — click the link in that message before signing in.
            </div>
          ) : null}

          {needsEmailConfirmation ? (
            <div className="mb-6 space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              <p>Your email is not verified yet. Open the confirmation link we sent you, then sign in again.</p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendConfirmation}
                disabled={resending || !formData.email.trim()}
              >
                {resending ? 'Sending…' : 'Resend confirmation email'}
              </Button>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-center text-sm">
              <Link href="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </p>

            <div className="text-center text-sm">
              <p>
                Don't have an account?{' '}
                <Link href="/register" className="text-primary hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
