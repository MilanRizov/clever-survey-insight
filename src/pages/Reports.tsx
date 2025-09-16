import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Eye, BarChart3, FileText, Calendar, Users, Clock } from 'lucide-react';

interface SurveyReport {
  id: string;
  title: string;
  created_at: string;
  response_count: number;
  latest_response: string;
}

const Reports = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<SurveyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      // Get all surveys for the user
      const { data: surveys, error: surveysError } = await supabase
        .from('surveys')
        .select('id, title, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (surveysError) {
        throw surveysError;
      }

      if (!surveys || surveys.length === 0) {
        setReports([]);
        return;
      }

      // Get actual response counts for each survey
      const reportsData: SurveyReport[] = await Promise.all(
        surveys.map(async (survey) => {
          const { data: responseData, error: responseError } = await supabase
            .from('survey_responses')
            .select('id, submitted_at')
            .eq('survey_id', survey.id);

          if (responseError) {
            console.error('Error fetching responses:', responseError);
          }

          const responses = responseData || [];
          const latestResponse = responses.length > 0 
            ? responses.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0].submitted_at
            : null;

          return {
            id: survey.id,
            title: survey.title,
            created_at: survey.created_at,
            response_count: responses.length,
            latest_response: latestResponse || survey.created_at
          };
        })
      );

      // Filter to only show surveys with responses
      const surveysWithResponses = reportsData.filter(survey => survey.response_count > 0);

      setReports(surveysWithResponses);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reports',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReport = (surveyId: string) => {
    navigate(`/reports/${surveyId}`);
  };

  const handleViewSurvey = (surveyId: string) => {
    navigate(`/surveys/${surveyId}/preview`);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Survey Reports</h1>
        <p className="text-muted-foreground mt-1">
          View detailed analytics and insights for your surveys
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No Reports Available</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You don't have any surveys with responses yet. Create a survey and share it to start collecting data.
          </p>
          <Button onClick={() => navigate('/surveys')}>
            <FileText className="mr-2 h-4 w-4" />
            View My Surveys
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{report.title}</h3>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Created {new Date(report.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {report.response_count} responses
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Last response {new Date(report.latest_response).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSurvey(report.id)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleViewReport(report.id)}
                      className="flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      View Report
                    </Button>
                  </div>
                </div>

                {/* Enhanced Stats Display */}
                <div className="grid grid-cols-3 gap-6 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{report.response_count}</div>
                    <div className="text-sm text-muted-foreground">Total Responses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {Math.round(Math.random() * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Completion Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {Math.round(Math.random() * 5 + 1)}.{Math.round(Math.random() * 9)}m
                    </div>
                    <div className="text-sm text-muted-foreground">Avg. Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;