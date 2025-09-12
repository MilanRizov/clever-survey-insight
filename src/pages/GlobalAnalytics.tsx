import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, FileText, TrendingUp, Heart, Frown, Meh } from 'lucide-react';

interface Survey {
  id: string;
  title: string;
  user_id: string;
  questions: any;
}

interface SurveyResponse {
  id: string;
  survey_id: string;
  response_data: any;
  submitted_at: string;
}

interface TextResponse {
  text: string;
  responseId: string;
  surveyTitle: string;
  submittedAt: string;
}

interface TopicAnalysis {
  topic: string;
  count: number;
  responses: {
    text: string;
    responseId: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
}

const GlobalAnalytics = () => {
  const { user, loading, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [textResponses, setTextResponses] = useState<TextResponse[]>([]);
  const [topicAnalysis, setTopicAnalysis] = useState<TopicAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!loading && (!user || userRole !== 'system_admin')) {
      navigate('/');
    }
  }, [user, loading, userRole, navigate]);

  useEffect(() => {
    if (user && userRole === 'system_admin') {
      fetchAllData();
    }
  }, [user, userRole]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);

      // Fetch all surveys
      const { data: surveysData, error: surveysError } = await supabase
        .from('surveys')
        .select('id, title, user_id, questions');

      if (surveysError) throw surveysError;

      // Fetch all responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('survey_responses')
        .select('id, survey_id, response_data, submitted_at');

      if (responsesError) throw responsesError;

      setSurveys(surveysData || []);
      setResponses(responsesData || []);

      // Extract open text responses
      extractTextResponses(surveysData || [], responsesData || []);

    } catch (error) {
      console.error('Error fetching global data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load global analytics data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractTextResponses = (surveysData: Survey[], responsesData: SurveyResponse[]) => {
    const textResponses: TextResponse[] = [];

    responsesData.forEach(response => {
      const survey = surveysData.find(s => s.id === response.survey_id);
      if (!survey) return;

      const questions = survey.questions || [];
      const responseData = response.response_data || {};

      questions.forEach((question: any, questionIndex: number) => {
        if (question.type === 'open-text') {
          const answer = responseData[`question_${questionIndex}`];
          if (answer && typeof answer === 'string' && answer.trim()) {
            textResponses.push({
              text: answer.trim(),
              responseId: response.id,
              surveyTitle: survey.title,
              submittedAt: response.submitted_at
            });
          }
        }
      });
    });

    setTextResponses(textResponses);
  };

  const analyzeOpenTextResponses = async () => {
    if (textResponses.length === 0) {
      toast({
        title: 'No Data',
        description: 'No open text responses found to analyze',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-open-text', {
        body: {
          textResponses: textResponses.map(tr => ({
            text: tr.text,
            responseId: tr.responseId
          }))
        }
      });

      if (error) throw error;

      setTopicAnalysis(data.topics || []);
      toast({
        title: 'Analysis Complete',
        description: `Analyzed ${textResponses.length} text responses and identified ${data.topics?.length || 0} topics`,
      });
    } catch (error) {
      console.error('Error analyzing text responses:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze text responses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Heart className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getSentimentStats = () => {
    if (topicAnalysis.length === 0) return { positive: 0, neutral: 0, negative: 0 };

    const allResponses = topicAnalysis.flatMap(topic => topic.responses);
    const positive = allResponses.filter(r => r.sentiment === 'positive').length;
    const negative = allResponses.filter(r => r.sentiment === 'negative').length;
    const neutral = allResponses.filter(r => r.sentiment === 'neutral').length;

    return { positive, negative, neutral };
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading global analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'system_admin') {
    return null;
  }

  const sentimentStats = getSentimentStats();
  const totalTextResponses = textResponses.length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Global Analytics</h2>
        <p className="text-muted-foreground">
          Analyze themes and sentiment across all surveys and responses in the system.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{surveys.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Text Responses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTextResponses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topics Identified</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topicAnalysis.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="topics">Topics & Themes</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Text Response Analysis</CardTitle>
              <CardDescription>
                Analyze all open text responses across all surveys for common themes and sentiment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalTextResponses === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Text Responses Found</h3>
                  <p className="text-muted-foreground">
                    No open text responses are available for analysis yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Found {totalTextResponses} text responses across {surveys.length} surveys.
                  </p>
                  <Button 
                    onClick={analyzeOpenTextResponses}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing Responses...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analyze All Text Responses
                      </>
                    )}
                  </Button>
                  
                  {topicAnalysis.length > 0 && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Analysis Complete</h4>
                      <p className="text-sm text-muted-foreground">
                        Identified {topicAnalysis.length} main topics with sentiment analysis.
                        Switch to the Topics & Themes or Sentiment Analysis tabs to view detailed results.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          {topicAnalysis.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Analysis Available</h3>
                  <p className="text-muted-foreground">
                    Run the analysis from the Overview tab to see topic themes.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {topicAnalysis.map((topic, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{topic.topic}</CardTitle>
                      <Badge variant="secondary">{topic.count} responses</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topic.responses.slice(0, 3).map((response, responseIndex) => (
                        <div key={responseIndex} className="border-l-2 border-muted pl-4">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {getSentimentIcon(response.sentiment)}
                              <span className={`text-xs px-2 py-1 rounded-full border ${getSentimentColor(response.sentiment)}`}>
                                {response.sentiment}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground italic">
                            "{response.text}"
                          </p>
                        </div>
                      ))}
                      {topic.responses.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          ...and {topic.responses.length - 3} more responses
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          {topicAnalysis.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Sentiment Data Available</h3>
                  <p className="text-muted-foreground">
                    Run the analysis from the Overview tab to see sentiment analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Positive</CardTitle>
                  <Heart className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{sentimentStats.positive}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalTextResponses > 0 ? Math.round((sentimentStats.positive / totalTextResponses) * 100) : 0}% of responses
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Neutral</CardTitle>
                  <Meh className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{sentimentStats.neutral}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalTextResponses > 0 ? Math.round((sentimentStats.neutral / totalTextResponses) * 100) : 0}% of responses
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Negative</CardTitle>
                  <Frown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{sentimentStats.negative}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalTextResponses > 0 ? Math.round((sentimentStats.negative / totalTextResponses) * 100) : 0}% of responses
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalAnalytics;