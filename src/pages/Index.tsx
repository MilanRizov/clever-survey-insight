import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SurveyBuilder, Question } from '@/components/survey/SurveyBuilder';
import { FloatingAIButton } from '@/components/survey/FloatingAIButton';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [aiGeneratedSurvey, setAiGeneratedSurvey] = useState<{ title: string; questions: Question[] } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleAIGenerated = (title: string, questions: Question[]) => {
    setAiGeneratedSurvey({ title, questions });
  };

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
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Survey Builder</h2>
          <p className="text-muted-foreground">
            Create powerful surveys with drag-and-drop question types and AI-powered analysis.
          </p>
        </div>
      </div>
      
      <div className="h-[calc(100vh-12rem)]">
        <SurveyBuilder 
          key={aiGeneratedSurvey ? `ai-${Date.now()}` : 'default'}
          initialSurvey={aiGeneratedSurvey ? { 
            id: '', 
            title: aiGeneratedSurvey.title, 
            questions: aiGeneratedSurvey.questions 
          } : undefined}
        />
      </div>

      <FloatingAIButton onSurveyGenerated={handleAIGenerated} />
    </div>
  );
};

export default Index;
