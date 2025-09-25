import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/game');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            Expanse Colony
          </CardTitle>
          <CardDescription className="text-lg">
            Build colonies across the solar system, manage resources, and complete missions to expand humanity's reach.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Colonize Planets</h3>
              <p className="text-muted-foreground">Establish colonies on Moon and Mars</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Manage Resources</h3>
              <p className="text-muted-foreground">Food, fuel, metal, and power systems</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Research & Build</h3>
              <p className="text-muted-foreground">Advance technology and construct ships</p>
            </div>
          </div>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Start Your Mission
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
