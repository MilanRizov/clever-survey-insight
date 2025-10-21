import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Copy, Check, Eye, Edit3, Calendar, Globe, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Survey {
  id: string;
  title: string;
  questions: any;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_published: boolean;
}

const MySurveys = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mySurveys, setMySurveys] = useState<Survey[]>([]);
  const [otherSurveys, setOtherSurveys] = useState<Survey[]>([]);
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

      const allSurveys = data || [];
      setMySurveys(allSurveys.filter(survey => survey.user_id === user?.id));
      setOtherSurveys(allSurveys.filter(survey => survey.user_id !== user?.id));
    } catch (err) {
      console.error('Error fetching surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (surveyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('surveys')
        .update({ is_published: !currentStatus })
        .eq('id', surveyId);

      if (error) throw error;

      toast({
        title: !currentStatus ? "Survey published!" : "Survey unpublished",
        description: !currentStatus 
          ? "Your survey is now accessible via the public link" 
          : "Your survey is no longer accessible via the public link",
      });

      fetchSurveys(); // Refresh the list
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update survey status",
        variant: "destructive",
      });
    }
  };

  const copyPublicLink = async (surveyId: string, isPublished: boolean) => {
    const publicLink = `${window.location.origin}/survey/${surveyId}`;
    
    if (!isPublished) {
      toast({
        title: "Survey not published",
        description: "This survey is not published yet. Recipients won't be able to access it.",
        variant: "destructive",
      });
    }
    
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopiedId(surveyId);
      toast({
        title: "Link copied!",
        description: isPublished 
          ? "Public survey link copied to clipboard" 
          : "Link copied, but remember to publish the survey first",
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Surveys</h1>
          <p className="text-muted-foreground mt-1">Manage your surveys and view responses</p>
        </div>
        <Button 
          onClick={() => navigate('/create-survey')}
          className="flex items-center gap-2 font-medium"
        >
          <FileText className="w-5 h-5" />
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
      ) : mySurveys.length === 0 && otherSurveys.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No surveys yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first survey to get started with collecting responses and insights
          </p>
          <Button onClick={() => navigate('/create-survey')}>
            Create Your First Survey
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* My Surveys Section */}
          {mySurveys.length > 0 && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground">My Surveys</h2>
                <p className="text-sm text-muted-foreground">Surveys created by you</p>
              </div>
              <div className="grid gap-6">
                {mySurveys.map((survey) => (
                  <Card key={survey.id} className="hover:shadow-md transition-shadow border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{survey.title}</h3>
                            <Badge variant={survey.is_published ? "default" : "secondary"}>
                              {survey.is_published ? (
                                <><Globe className="w-3 h-3 mr-1" /> Published</>
                              ) : (
                                <><Lock className="w-3 h-3 mr-1" /> Draft</>
                              )}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Created {new Date(survey.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {Array.isArray(survey.questions) ? survey.questions.length : 0} questions
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant={survey.is_published ? "outline" : "default"}
                            size="sm"
                            onClick={() => togglePublish(survey.id, survey.is_published)}
                            className="flex items-center gap-2"
                          >
                            {survey.is_published ? (
                              <><Lock className="w-4 h-4" /> Unpublish</>
                            ) : (
                              <><Globe className="w-4 h-4" /> Publish</>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/surveys/${survey.id}/preview`)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/surveys/${survey.id}/edit`)}
                            className="flex items-center gap-2"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      {/* Survey Stats - Mock data for enhanced UI */}
                      <div className="grid grid-cols-4 gap-6 pt-4 border-t border-border">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground mb-1">0</div>
                          <div className="text-sm text-muted-foreground">Total Responses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">0%</div>
                          <div className="text-sm text-muted-foreground">Completion Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">0m</div>
                          <div className="text-sm text-muted-foreground">Avg. Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 mb-1">-</div>
                          <div className="text-sm text-muted-foreground">Last Response</div>
                        </div>
                      </div>

                      {/* Public Link */}
                      <div className="mt-6 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Public survey link:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyPublicLink(survey.id, survey.is_published)}
                            className="flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            {copiedId === survey.id ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <code className="text-sm text-muted-foreground break-all">
                            {`${window.location.origin}/survey/${survey.id}`}
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Surveys Section */}
          {otherSurveys.length > 0 && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground">All Surveys</h2>
                <p className="text-sm text-muted-foreground">Surveys created by other users</p>
              </div>
              <div className="grid gap-6">
                {otherSurveys.map((survey) => (
                  <Card key={survey.id} className="hover:shadow-md transition-shadow border-muted">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-2">{survey.title}</h3>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Created {new Date(survey.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {Array.isArray(survey.questions) ? survey.questions.length : 0} questions
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/surveys/${survey.id}/preview`)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </div>
                      </div>

                      {/* Survey Stats - Mock data for enhanced UI */}
                      <div className="grid grid-cols-4 gap-6 pt-4 border-t border-border">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground mb-1">0</div>
                          <div className="text-sm text-muted-foreground">Total Responses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">0%</div>
                          <div className="text-sm text-muted-foreground">Completion Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">0m</div>
                          <div className="text-sm text-muted-foreground">Avg. Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 mb-1">-</div>
                          <div className="text-sm text-muted-foreground">Last Response</div>
                        </div>
                      </div>

                      {/* Public Link */}
                      <div className="mt-6 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Public survey link:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyPublicLink(survey.id, true)}
                            className="flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            {copiedId === survey.id ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <code className="text-sm text-muted-foreground break-all">
                            {`${window.location.origin}/survey/${survey.id}`}
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MySurveys;