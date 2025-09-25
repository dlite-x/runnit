import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const Auth = () => {
  const [gamePassword, setGamePassword] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/game');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handlePasswordVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (gamePassword === 'expanse2025') {
      setPasswordVerified(true);
      toast({
        title: "Access Granted",
        description: "Welcome to Expanse Colony!",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Try to sign in with existing demo user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'demo@expanse.space',
        password: 'demo123456',
      });
      
      // If user doesn't exist, create the demo account
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'demo@expanse.space',
          password: 'demo123456',
          options: {
            emailRedirectTo: `${window.location.origin}/game`,
            data: {
              full_name: 'Demo Commander'
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        toast({
          title: "Demo Account Created",
          description: "Demo account created and signed in successfully!",
        });
      } else if (signInError) {
        throw signInError;
      } else {
        toast({
          title: "Demo Login Successful", 
          description: "Welcome to the Expanse Colony demo!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Demo Login Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/game`
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Check your email",
          description: "We've sent you a verification link.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  // Show password verification first
  if (!passwordVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">🚀 Expanse Colony</CardTitle>
            <CardDescription>
              Enter the access code to continue to the colony management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gamePassword">Access Code</Label>
                <Input
                  id="gamePassword"
                  type="password"
                  value={gamePassword}
                  onChange={(e) => setGamePassword(e.target.value)}
                  placeholder="Enter access code"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Access Colony System
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show authentication options after password verification
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🚀 Expanse Colony</CardTitle>
          <CardDescription>
            {isSignUp ? "Create your account to start colonizing" : "Sign in to continue your mission"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Demo Login Option */}
          <div className="mb-6">
            <Button 
              onClick={handleDemoLogin} 
              className="w-full mb-2" 
              variant="outline"
              disabled={loading}
            >
              {loading ? "Loading..." : "🎮 Try Demo (No Account Needed)"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Quick demo with pre-configured colony data
            </p>
          </div>

          <Separator className="my-4" />
          
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">
              Or create/sign in with your own account
            </p>
          </div>

          {/* Regular Auth Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commander@expanse.space"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;