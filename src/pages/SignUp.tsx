import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { register } from '@/lib/api';
import { toast } from 'sonner';

interface SignUpProps {
  onSignUpSuccess: () => void;
  onSwitchToLogin?: () => void;
}

export function SignUp({ onSignUpSuccess, onSwitchToLogin }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await register(email, password, name, role);
      if (response.success && response.data) {
        toast.success(`Welcome ${response.data.user.name}!`);
        onSignUpSuccess();
      } else {
        toast.error(response.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Sign up to book tables or manage the restaurant</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full p-2 rounded border">
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              Already have an account?{' '}
              <button onClick={onSwitchToLogin} className="text-primary underline">Sign in</button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignUp;
