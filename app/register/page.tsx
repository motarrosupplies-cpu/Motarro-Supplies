'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { customerService } from '@/lib/services/customerService';
import {
  getPasswordValidationMessage,
  isPasswordValid,
  PASSWORD_REQUIREMENTS,
} from '@/lib/password-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'South Africa'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const passwordError = getPasswordValidationMessage(formData.password);
      if (passwordError) {
        toast({
          title: "Password too weak",
          description: passwordError,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Check if email already exists in customers table
      const existingCustomer = await customerService.getCustomerByEmail(formData.email);
      if (existingCustomer) {
        toast({
          title: "Email already registered",
          description: "An account with this email already exists. Please log in or use a different email.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      console.log('Supabase signUp result:', authData, authError);
      if (authError) {
        toast({
          title: "Auth Error",
          description: authError.message || "Failed to create authentication account.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create customer record via server API (uses service role; works even before email verification)
      const customerRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
        }),
      });
      if (!customerRes.ok) {
        const errBody = await customerRes.json().catch(() => ({}));
        toast({
          title: "Customer Error",
          description: errBody.error || "Failed to create customer record. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Check your email",
        description: "Your account was created. Please open the verification email from MOTARRO Supplies and click the confirmation link before signing in.",
      });

      // Redirect to login with verification reminder
      router.push('/login?registered=1');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <h1 className="sr-only">Create an account</h1>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            Register to start shopping and track your orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {PASSWORD_REQUIREMENTS.map((requirement) => {
                    const met = requirement.test(formData.password);
                    return (
                      <li
                        key={requirement.id}
                        className={met ? 'text-green-600' : undefined}
                      >
                        {met ? '✓' : '○'} {requirement.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword ? (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Province</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">Postal Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  disabled
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                loading ||
                !isPasswordValid(formData.password) ||
                formData.password !== formData.confirmPassword
              }
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </>
  );
} 