import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SurveyBuilder, Question } from '@/components/survey/SurveyBuilder';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const EditSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<any>(null);
  const [loadingSurvey, setLoadingSurvey] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchSurvey();
    }
  }, [id, user]);

  const fetchSurvey = async () => {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setSurvey({
        ...data,
        questions: Array.isArray(data.questions) ? data.questions : []
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load survey',
        variant: 'destructive',
      });
      navigate('/surveys');
    } finally {
      setLoadingSurvey(false);
    }
  };

  if (loading || loadingSurvey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Survey not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/surveys')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Surveys
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Survey</h1>
            <p className="text-muted-foreground">Make changes to your survey</p>
          </div>
        </div>

        <div className="h-[calc(100vh-200px)]">
          <SurveyBuilder initialSurvey={survey} />
        </div>
      </div>
    </div>
  );
};

export default EditSurvey;