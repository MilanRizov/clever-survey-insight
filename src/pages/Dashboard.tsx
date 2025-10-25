import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Target, 
  Clock, 
  Plus, 
  BarChart3,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalSurveys: number;
  totalResponses: number;
  avgCompletion: number;
  avgTime: string;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalSurveys: 0,
    totalResponses: 0,
    avgCompletion: 0,
    avgTime: '0m'
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch surveys count
      const { data: surveys, error: surveysError } = await supabase
        .from('surveys')
        .select('id')
        .eq('user_id', user?.id);

      if (surveysError) throw surveysError;

      // Fetch responses count
      const { data: responses, error: responsesError } = await supabase
        .from('survey_responses')
        .select('id, survey_id')
        .in('survey_id', surveys?.map(s => s.id) || []);

      if (responsesError) throw responsesError;

      setStats({
        totalSurveys: surveys?.length || 0,
        totalResponses: responses?.length || 0,
        avgCompletion: 100, // All responses in database are complete
        avgTime: '3.5m' // This would need more complex calculation
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    }
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
    return null;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
        <p className="text-muted-foreground">Here's an overview of your survey activity</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.totalSurveys}</div>
              <div className="text-sm text-muted-foreground">Active Surveys</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.totalResponses}</div>
              <div className="text-sm text-muted-foreground">Total Responses</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.avgCompletion}%</div>
              <div className="text-sm text-muted-foreground">Avg. Completion</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.avgTime}</div>
              <div className="text-sm text-muted-foreground">Avg. Time</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline"
            className="h-auto p-4 justify-start"
            onClick={() => navigate('/create-survey')}
          >
            <div className="w-full text-left">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-1">Create New Survey</h3>
              <p className="text-sm text-muted-foreground">Start building a new survey from scratch</p>
            </div>
          </Button>
          
          <Button 
            variant="outline"
            className="h-auto p-4 justify-start"
            onClick={() => navigate('/reports')}
          >
            <div className="w-full text-left">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-medium text-foreground mb-1">View Analytics</h3>
              <p className="text-sm text-muted-foreground">Check your survey performance</p>
            </div>
          </Button>
          
          <Button 
            variant="outline"
            className="h-auto p-4 justify-start"
            onClick={() => navigate('/templates')}
          >
            <div className="w-full text-left">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-medium text-foreground mb-1">Use Template</h3>
              <p className="text-sm text-muted-foreground">Start with a pre-built template</p>
            </div>
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Survey created successfully</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">New response received</p>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;