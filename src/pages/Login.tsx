import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/lib/api';
import { toast } from 'sonner';

interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToSignUp?: () => void;
}

export function Login({ onLoginSuccess, onSwitchToSignUp }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(email, password);
      
      if (response.success && response.data) {
        toast.success(`Welcome ${response.data.user.name}!`);
        onLoginSuccess();
      } else {
        toast.error(response.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Restaurant Booking System</CardTitle>
          <CardDescription>
            Sign in to book a table or manage reservations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Any password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              Don't have an account?{' '}
              <button onClick={onSwitchToSignUp} className="text-primary underline">Create one</button>
            </p>
          </div>
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold">Demo Credentials:</p>
            <p>Customer: customer@test.com (any password)</p>
            <p>Admin: admin@test.com (any password)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
