import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SurveyBuilder } from '@/components/survey/SurveyBuilder';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CreateSurvey = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  
  // Get template data from navigation state
  const templateData = location.state?.template;

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
            <h1 className="text-2xl font-bold text-foreground">
              {templateData ? `Create Survey from Template` : 'Create New Survey'}
            </h1>
            <p className="text-muted-foreground">
              {templateData ? `Using template: ${templateData.title}` : 'Build your survey from scratch'}
            </p>
          </div>
        </div>

        <div className="h-[calc(100vh-200px)]">
          <SurveyBuilder initialSurvey={templateData} />
        </div>
      </div>
    </div>
  );
};

export default CreateSurvey;