import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Survey {
  id: string;
  title: string;
  questions: any;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const MySurveys = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSurveys();
    }
  }, [user]);

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching surveys:', error);
        return;
      }

      setSurveys(data || []);
    } catch (err) {
      console.error('Error fetching surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyPublicLink = async (surveyId: string) => {
    const publicLink = `${window.location.origin}/survey/${surveyId}`;
    
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopiedId(surveyId);
      toast({
        title: "Link copied!",
        description: "Public survey link copied to clipboard",
      });
      
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
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
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">My Surveys</h2>
          <p className="text-muted-foreground">
            Manage your surveys and view responses.
          </p>
        </div>
        <Button onClick={() => navigate('/')}>
          Create New Survey
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading surveys...</p>
          </div>
        </div>
      ) : surveys.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No surveys yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first survey to get started
          </p>
          <Button onClick={() => navigate('/')}>
            Create Survey
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <Card key={survey.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{survey.title}</CardTitle>
                <CardDescription>
                  Created {new Date(survey.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <FileText className="h-4 w-4" />
                  {Array.isArray(survey.questions) ? survey.questions.length : 0} questions
                </div>
                
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Public survey link:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-background px-2 py-1 rounded border truncate">
                      {`${window.location.origin}/survey/${survey.id}`}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyPublicLink(survey.id)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedId === survey.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/surveys/${survey.id}/preview`)}
                  >
                    View
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => navigate(`/surveys/${survey.id}/edit`)}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySurveys;