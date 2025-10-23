import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FloatingAIButton } from '@/components/survey/FloatingAIButton';
import { Question } from '@/components/survey/SurveyBuilder';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from '@/components/ui/sidebar';
import {
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  LayoutDashboard,
  Grid3X3,
  TrendingUp,
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { title: 'Overview', url: '/', icon: LayoutDashboard, roles: ['system_admin', 'survey_generator'] },
  { title: 'Surveys', url: '/surveys', icon: FileText, roles: ['system_admin', 'survey_generator'] },
  { title: 'Templates', url: '/templates', icon: Grid3X3, roles: ['system_admin', 'survey_generator'] },
  { title: 'Reports', url: '/reports', icon: BarChart3, roles: ['system_admin', 'survey_generator'] },
  { title: 'Global Analytics', url: '/analytics/global', icon: TrendingUp, roles: ['system_admin'] },
  { title: 'Registered Users', url: '/settings/users', icon: Settings, roles: ['system_admin'] },
  { title: 'Support', url: '/support', icon: HelpCircle, roles: ['system_admin'] },
];

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { signOut, userRole, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    !userRole || item.roles.includes(userRole)
  );

  const handleNavigation = (item: typeof menuItems[0]) => {
    if (item.url === '/' || item.url === '/surveys' || item.url === '/reports' || item.url === '/templates' || item.url === '/settings/users' || item.url === '/analytics/global') {
      navigate(item.url);
    } else {
      toast({
        title: 'Coming Soon',
        description: `${item.title} page is under development`,
      });
    }
  };

  const handleAIGenerated = (title: string, questions: Question[]) => {
    // Navigate to create-survey page with AI-generated data
    navigate('/create-survey', {
      state: {
        template: {
          id: '',
          title,
          questions
        },
        aiGenerated: true
      }
    });
  };

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
                  {filteredMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        className="w-full"
                      >
                        <button
                          onClick={() => handleNavigation(item)}
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
          <header className="border-b border-border bg-card">
            <div className="px-6 py-4 flex justify-between items-center">
              <h1 className="text-xl font-semibold text-foreground">
                {filteredMenuItems.find(item => item.url === location.pathname)?.title || 'IntelligentSurvey'}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {user?.email || user?.user_metadata?.username || 'Welcome back!'}
                </span>
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
      <FloatingAIButton onSurveyGenerated={handleAIGenerated} />
    </SidebarProvider>
  );
};