import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2 } from 'lucide-react';

interface Question {
  id: string;
  type: 'single-choice' | 'multiple-choice' | 'open-text';
  title: string;
  description?: string;
  options?: string[];
  required: boolean;
}

interface Survey {
  id: string;
  title: string;
  questions: Question[];
}

const PublicSurvey = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>({});

  useEffect(() => {
    if (id) {
      fetchSurvey();
    }
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching survey:', error);
        toast({
          title: "Survey not found",
          description: "This survey does not exist or has been removed.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setSurvey({
        ...data,
        questions: Array.isArray(data.questions) ? (data.questions as unknown as Question[]) : []
      });
    } catch (err) {
      console.error('Error fetching survey:', err);
      toast({
        title: "Error loading survey",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMultipleChoiceChange = (questionId: string, option: string, checked: boolean) => {
    setResponses(prev => {
      const currentValues = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentValues, option]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentValues.filter((val: string) => val !== option)
        };
      }
    });
  };

  const validateResponses = () => {
    if (!survey) return false;

    for (const question of survey.questions) {
      if (question.required && !responses[question.id]) {
        toast({
          title: "Required field missing",
          description: `Please answer: ${question.title}`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const submitSurvey = async () => {
    if (!validateResponses()) return;

    setSubmitting(true);
    try {
      // Simulate response submission (survey_responses table not yet in types)
      // TODO: Replace with actual supabase insertion once table is in types
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Survey response submitted:', {
        survey_id: id,
        responses: responses,
      });

      setSubmitted(true);
      toast({
        title: "Thank you!",
        description: "Your response has been submitted successfully.",
      });
    } catch (err) {
      console.error('Error submitting survey:', err);
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Survey Not Found</h2>
          <p className="text-muted-foreground">This survey does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle>Thank You!</CardTitle>
            <CardDescription>
              Your response has been submitted successfully.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{survey.title}</CardTitle>
            <CardDescription>
              Please answer all questions to submit your response.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {survey.questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <div>
                  <Label className="text-base font-medium">
                    {index + 1}. {question.title}
                    {question.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {question.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {question.description}
                    </p>
                  )}
                </div>

                {question.type === 'single-choice' && question.options && (
                  <RadioGroup
                    value={responses[question.id] || ''}
                    onValueChange={(value) => handleResponseChange(question.id, value)}
                  >
                    {question.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                        <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.type === 'multiple-choice' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question.id}-${option}`}
                          checked={(responses[question.id] || []).includes(option)}
                          onCheckedChange={(checked) => 
                            handleMultipleChoiceChange(question.id, option, checked as boolean)
                          }
                        />
                        <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'open-text' && (
                  <Textarea
                    placeholder="Your answer..."
                    value={responses[question.id] || ''}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    className="min-h-[100px]"
                  />
                )}
              </div>
            ))}

            <div className="pt-6 border-t">
              <Button 
                onClick={submitSurvey} 
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Response'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicSurvey;