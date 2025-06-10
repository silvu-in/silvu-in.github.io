
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from 'next/navigation';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Local loading for form submission
  const { user, loading: authLoading, signInWithEmail, signUpWithEmail } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect if user is already logged in and not in the process of auth loading
    if (!authLoading && user) {
      const redirectPath = searchParams.get('redirect') || '/'; // Default to homepage
      router.push(redirectPath);
    }
  }, [user, authLoading, router, searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (mode === 'signup' && password !== confirmPassword) {
      setError("Passwords don't match.");
      setIsLoading(false);
      return;
    }

    const destination = searchParams.get('redirect') ? 'your previous page' : 'the homepage';

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        toast({ 
          title: "Login successful", 
          description: `Redirecting to ${destination}...`
        });
      } else { // signup mode
        await signUpWithEmail(email, password);
        toast({ 
          title: "Signup successful!", 
          description: `Redirecting to ${destination}...` 
        });
      }
      // Explicitly do not navigate here; let useEffect handle it based on auth state.
    } catch (err: any) {
      let displayMessage = err.message || (mode === 'login' ? 'Failed to login.' : 'Failed to sign up.');
       if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        displayMessage = 'Invalid email or password. Please try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        displayMessage = 'This email is already registered. Please login or use a different email.';
      } else if (err.code === 'auth/too-many-requests') {
        displayMessage = 'Too many attempts. Please try again later.';
      }
      setError(displayMessage);
      toast({ title: "Authentication Error", description: displayMessage, variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!authLoading && user && !user.emailVerified && mode === 'login' && !isLoading && user.providerData?.some(p => p.providerId === 'password')) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            A verification link has been sent to your email address ({user.email}). Please check your inbox (and spam folder) to complete the signup process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you haven&apos;t received the email, you can try logging in again to potentially resend it, or contact support.
          </p>
        </CardContent>
         <CardFooter className="flex justify-center">
            <Button variant="link" onClick={() => router.push('/login')}>Back to Login</Button>
        </CardFooter>
      </Card>
    );
  }


  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === 'login' ? 'Login to Silvu' : 'Create a Silvu Account'}</CardTitle>
        <CardDescription>
          {mode === 'login' ? "Enter your credentials to access your account." : "Join Silvu to start shopping."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
              autoComplete={mode === 'login' ? "current-password" : "new-password"}
            />
          </div>
          {mode === 'signup' && (
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1"
                autoComplete="new-password"
              />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
            {isLoading ? (mode === 'login' ? 'Logging in...' : 'Signing up...') : (mode === 'login' ? 'Login' : 'Sign Up')}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <a href={mode === 'login' ? "/signup" : "/login"} className="font-medium text-primary hover:underline">
            {mode === 'login' ? 'Sign up' : 'Login'}
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
