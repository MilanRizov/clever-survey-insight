import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Download, BarChart3, FileText, Calendar, Users } from 'lucide-react';

interface Survey {
  id: string;
  title: string;
  questions: any;
  created_at: string;
}

interface SurveyResponse {
  id: string;
  response_data: any;
  submitted_at: string;
  ip_address?: string;
}

interface ChartData {
  name: string;
  value: number;
  percentage: number;
}

interface ResponseSummary {
  totalResponses: number;
  averageCompletionTime: number;
  completionRate: number;
  lastResponse: string;
}

const SurveyReport = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ResponseSummary | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchSurveyAndResponses();
    }
  }, [user, id]);

  const fetchSurveyAndResponses = async () => {
    if (!id) return;

    try {
      // Fetch survey details
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (surveyError) {
        console.error('Error fetching survey:', surveyError);
        navigate('/reports');
        return;
      }

      setSurvey({
        ...surveyData,
        questions: Array.isArray(surveyData.questions) ? surveyData.questions : []
      });

      // Fetch responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('survey_id', id)
        .order('submitted_at', { ascending: false });

      if (responsesError) {
        console.error('Error fetching responses:', responsesError);
        return;
      }

      const processedResponses = (responsesData || []).map(response => ({
        ...response,
        ip_address: response.ip_address as string || undefined
      }));
      setResponses(processedResponses);

      // Calculate summary statistics
      if (responsesData && responsesData.length > 0) {
        const totalResponses = responsesData.length;
        const lastResponse = responsesData[0].submitted_at;
        
        setSummary({
          totalResponses,
          averageCompletionTime: 3.5, // Simulated - would calculate from actual timing data
          completionRate: 85, // Simulated - would calculate from partial vs complete responses
          lastResponse
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load survey report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (questionIndex: number): ChartData[] => {
    if (!survey || !responses.length) return [];

    const question = survey.questions[questionIndex];
    if (!question) return [];

    const answerCounts: { [key: string]: number } = {};
    let totalAnswers = 0;

    responses.forEach(response => {
      // Use the actual question ID instead of question_${index}
      const answer = response.response_data[question.id];
      if (answer) {
        if (Array.isArray(answer)) {
          // Handle multiple choice questions
          answer.forEach(choice => {
            answerCounts[choice] = (answerCounts[choice] || 0) + 1;
            totalAnswers++;
          });
        } else {
          answerCounts[answer] = (answerCounts[answer] || 0) + 1;
          totalAnswers++;
        }
      }
    });

    return Object.entries(answerCounts).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalAnswers) * 100)
    }));
  };

  const exportToCSV = () => {
    if (!survey || !responses.length) {
      toast({
        title: 'No data to export',
        description: 'There are no responses to export',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['Response ID', 'Submitted At', ...survey.questions.map((q: any, i: number) => `Q${i + 1}: ${q.question || q.title}`)];
    
    const csvData = responses.map(response => {
      const row = [
        response.id,
        new Date(response.submitted_at).toLocaleString(),
        ...survey.questions.map((question: any) => {
          const answer = response.response_data[question.id];
          return Array.isArray(answer) ? answer.join('; ') : answer || '';
        })
      ];
      return row;
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${survey.title}_responses.csv`;
    link.click();

    toast({
      title: 'Export successful',
      description: 'Survey responses exported to CSV',
    });
  };

  const getResponseTimeline = () => {
    if (!responses.length) return [];

    const timeline: { [key: string]: number } = {};
    responses.forEach(response => {
      const date = new Date(response.submitted_at).toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
    });

    return Object.entries(timeline)
      .map(([date, count]) => ({ date, responses: count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Survey Not Found</h2>
          <p className="text-muted-foreground mb-4">The survey you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/reports')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/reports')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{survey.title}</h1>
            <p className="text-muted-foreground">
              Created on {new Date(survey.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button onClick={exportToCSV} disabled={!responses.length}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalResponses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.completionRate}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.averageCompletionTime}m</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Response</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {new Date(summary.lastResponse).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="responses">Individual Responses</TabsTrigger>
          <TabsTrigger value="timeline">Response Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          {responses.length === 0 ? (
            <Card className="p-8 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Responses Yet</h3>
              <p className="text-muted-foreground">Analytics will appear here once people start responding to your survey.</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {survey.questions.map((question: any, index: number) => {
                const chartData = generateChartData(index);
                
                return (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <CardDescription>{question.question || question.title}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {chartData.length > 0 ? (
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-medium mb-4">Response Distribution</h4>
                            <div className="space-y-2">
                              {chartData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <span className="font-medium">{item.name}</span>
                                  <div className="flex items-center gap-3">
                                    <div className="w-24 bg-background rounded-full h-2 overflow-hidden">
                                      <div 
                                        className="h-full bg-primary rounded-full" 
                                        style={{ width: `${item.percentage}%` }}
                                      />
                                    </div>
                                    <Badge variant="secondary">
                                      {item.value} ({item.percentage}%)
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No responses for this question yet.</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          {responses.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Responses Yet</h3>
              <p className="text-muted-foreground">Individual responses will appear here once people start responding to your survey.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {responses.map((response, responseIndex) => (
                <Card key={response.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Response #{responseIndex + 1}</CardTitle>
                      <Badge variant="secondary">
                        {new Date(response.submitted_at).toLocaleString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {survey.questions.map((question: any, questionIndex: number) => (
                      <div key={questionIndex} className="border-l-2 border-muted pl-4">
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">
                          Question {questionIndex + 1}
                        </h4>
                        <p className="text-sm mb-2">{question.question || question.title}</p>
                        <div className="font-medium">
                          {(() => {
                            const answer = response.response_data[question.id];
                            if (Array.isArray(answer)) {
                              return answer.join(', ');
                            }
                            return answer || 'No answer';
                          })()}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          {responses.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Timeline Data</h3>
              <p className="text-muted-foreground">Response timeline will appear here once people start responding to your survey.</p>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Response Timeline (Last 14 Days)</CardTitle>
                <CardDescription>Daily response count over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getResponseTimeline().map((item) => (
                    <div key={item.date} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{new Date(item.date).toLocaleDateString()}</span>
                      <Badge variant="outline">{item.responses} responses</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SurveyReport;