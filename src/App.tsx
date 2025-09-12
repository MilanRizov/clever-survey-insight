import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MySurveys from "./pages/MySurveys";
import Templates from "./pages/Templates";
import Reports from "./pages/Reports";
import SurveyPreview from "./pages/SurveyPreview";
import EditSurvey from "./pages/EditSurvey";
import CreateSurvey from "./pages/CreateSurvey";
import PublicSurvey from "./pages/PublicSurvey";
import SurveyReport from "./pages/SurveyReport";
import RegisteredUsers from "./pages/RegisteredUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<AppLayout><Index /></AppLayout>} />
            <Route path="/surveys" element={<AppLayout><MySurveys /></AppLayout>} />
            <Route path="/surveys/create" element={<AppLayout><CreateSurvey /></AppLayout>} />
            <Route path="/templates" element={<AppLayout><Templates /></AppLayout>} />
            <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
            <Route path="/surveys/:id/preview" element={<AppLayout><SurveyPreview /></AppLayout>} />
            <Route path="/surveys/:id/edit" element={<AppLayout><EditSurvey /></AppLayout>} />
            <Route path="/reports/:id" element={<AppLayout><SurveyReport /></AppLayout>} />
            <Route path="/settings/users" element={<AppLayout><RegisteredUsers /></AppLayout>} />
            <Route path="/survey/:id" element={<PublicSurvey />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;