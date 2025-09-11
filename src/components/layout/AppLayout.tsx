import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { title: 'Overview', url: '/', icon: LayoutDashboard },
  { title: 'Surveys', url: '/surveys', icon: FileText },
  { title: 'Templates', url: '/templates', icon: Grid3X3 },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Registered Users', url: '/settings/users', icon: Settings },
  { title: 'Support', url: '/support', icon: HelpCircle },
];

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleNavigation = (item: typeof menuItems[0]) => {
    if (item.url === '/' || item.url === '/surveys' || item.url === '/reports' || item.url === '/templates' || item.url === '/settings/users') {
      navigate(item.url);
    } else {
      toast({
        title: 'Coming Soon',
        description: `${item.title} page is under development`,
      });
    }
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
                  {menuItems.map((item) => (
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
                {menuItems.find(item => item.url === location.pathname)?.title || 'IntelligentSurvey'}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Welcome back!
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
    </SidebarProvider>
  );
};