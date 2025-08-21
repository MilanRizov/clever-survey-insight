import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Star } from 'lucide-react';
import type { Question } from '@/components/survey/SurveyBuilder';

interface Survey {
  id: string;
  title: string;
  questions: Question[];
  created_at: string;
  updated_at: string;
}

const SurveyPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<Survey | null>(null);
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
        questions: Array.isArray(data.questions) ? (data.questions as unknown as Question[]) : []
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

  const renderQuestion = (question: Question, index: number) => {
    switch (question.type) {
      case 'single-choice':
        return (
          <RadioGroup key={question.id} className="space-y-2">
            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <Checkbox id={`${question.id}-${optionIndex}`} />
                <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'open-text':
        return (
          <Textarea
            placeholder="Type your answer here..."
            className="min-h-[100px]"
          />
        );

      case 'rating':
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant="outline"
                size="sm"
                className="w-10 h-10 p-0"
              >
                <Star className="h-4 w-4" />
              </Button>
            ))}
          </div>
        );

      case 'date':
        return (
          <Input type="date" className="w-auto" />
        );

      default:
        return null;
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
            <h1 className="text-2xl font-bold text-foreground">Survey Preview</h1>
            <p className="text-muted-foreground">Preview how your survey will look to respondents</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">{survey.title}</CardTitle>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {survey.questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">
                    {index + 1}. {question.title}
                    {question.required && <span className="text-destructive ml-1">*</span>}
                  </h3>
                  {question.description && (
                    <p className="text-muted-foreground text-sm">{question.description}</p>
                  )}
                </div>
                {renderQuestion(question, index)}
              </CardContent>
            </Card>
          ))}
        </div>

        {survey.questions.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button size="lg" className="px-8">
              Submit Survey
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyPreview;