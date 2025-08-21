import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, FileText, Settings, HelpCircle, Calendar, Plus } from 'lucide-react';

interface Survey {
  id: string;
  title: string;
  questions: any;
  created_at: string;
  updated_at: string;
}

const menuItems = [
  { title: 'Overview', icon: BarChart, url: '/overview' },
  { title: 'Surveys', icon: FileText, url: '/surveys' },
  { title: 'Reports', icon: BarChart, url: '/reports' },
  { title: 'Settings', icon: Settings, url: '/settings' },
  { title: 'Support', icon: HelpCircle, url: '/support' },
];

const MySurveys = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loadingSurveys, setLoadingSurveys] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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
        toast({
          title: 'Error',
          description: 'Failed to fetch surveys',
          variant: 'destructive',
        });
        return;
      }

      setSurveys(data || []);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to fetch surveys',
        variant: 'destructive',
      });
    } finally {
      setLoadingSurveys(false);
    }
  };

  const handleCreateSurvey = () => {
    navigate('/');
  };

  if (loading || !user) {
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="w-64">
          <SidebarContent>
            <div className="p-4 border-b border-sidebar-border">
              <h2 className="text-lg font-semibold text-sidebar-foreground">IntelligentSurvey</h2>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.url === '/surveys'}
                        className="w-full"
                      >
                        <button
                          onClick={() => {
                            if (item.url === '/surveys') return;
                            toast({
                              title: 'Coming Soon',
                              description: `${item.title} page is under development`,
                            });
                          }}
                          className="flex items-center gap-3 w-full text-left"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.title}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold text-foreground">My Surveys</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome back!</span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">My Surveys</h2>
                  <p className="text-muted-foreground">Manage and analyze your surveys</p>
                </div>
                <Button onClick={handleCreateSurvey} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Survey
                </Button>
              </div>

              {loadingSurveys ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : surveys.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent className="pt-6">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No surveys yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first survey to get started
                    </p>
                    <Button onClick={handleCreateSurvey}>Create Your First Survey</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {surveys.map((survey) => (
                    <Card key={survey.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{survey.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(survey.created_at).toLocaleDateString()}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {Array.isArray(survey.questions) ? survey.questions.length : 0} question{Array.isArray(survey.questions) && survey.questions.length !== 1 ? 's' : ''}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MySurveys;