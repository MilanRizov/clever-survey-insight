import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">IntelligentSurvey</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome back!
            </span>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Welcome to IntelligentSurvey</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Create powerful surveys with AI-powered analysis and automated reporting.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 border border-border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">Single Choice</h3>
              <p className="text-muted-foreground">Perfect for multiple choice questions with one correct answer.</p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">Multiple Choice</h3>
              <p className="text-muted-foreground">Allow respondents to select multiple options from a list.</p>
            </div>
            <div className="p-6 border border-border rounded-lg bg-card">
              <h3 className="text-lg font-semibold mb-2">Open Text</h3>
              <p className="text-muted-foreground">Gather detailed responses with AI-powered analysis.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
