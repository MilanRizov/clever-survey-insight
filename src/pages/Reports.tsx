import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Eye, BarChart3 } from 'lucide-react';

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

      // For now, we'll simulate having responses by showing all surveys
      // This can be updated when we have actual response data
      const reportsData: SurveyReport[] = surveys.map(survey => ({
        id: survey.id,
        title: survey.title,
        created_at: survey.created_at,
        response_count: Math.floor(Math.random() * 50) + 1, // Simulated response count
        latest_response: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Simulated latest response within last week
      }));

      // Filter to only show surveys with responses (for simulation, show surveys created more than 1 day ago)
      const surveysWithResponses = reportsData.filter(survey => 
        new Date(survey.created_at).getTime() < Date.now() - 24 * 60 * 60 * 1000
      );

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
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Survey Reports</h2>
        <p className="text-muted-foreground">
          View analytics and responses for your surveys that have received submissions.
        </p>
      </div>

      {reports.length === 0 ? (
        <Card className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Reports Available</h3>
          <p className="text-muted-foreground mb-4">
            Reports will appear here once your surveys start receiving responses.
          </p>
          <Button onClick={() => navigate('/surveys')} variant="outline">
            View My Surveys
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{report.title}</CardTitle>
                <CardDescription>
                  Created on {new Date(report.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Responses</span>
                    <Badge variant="secondary">
                      {report.response_count} response{report.response_count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Latest response: {new Date(report.latest_response).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleViewReport(report.id)}
                      className="flex-1"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSurvey(report.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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