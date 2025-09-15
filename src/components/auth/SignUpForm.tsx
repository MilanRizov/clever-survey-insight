import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface SignUpFormProps {
  onToggleMode: () => void;
}

export const SignUpForm = ({ onToggleMode }: SignUpFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password, username);
    
    if (!error) {
      // Show success message in toast
      onToggleMode(); // Switch back to login form
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>Sign up to start creating surveys</CardDescription>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg text-left">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This is a working prototype. Please enter any email and password to create your account — you'll be signed in automatically. After signing up, you can create a survey and generate a shareable link. Once responses are collected, a report will be created automatically, including an AI-powered analysis of open-ended questions. If you need super admin rights, request them via the form below.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Choose a username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Button variant="link" onClick={onToggleMode} className="p-0">
            Sign in here
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};