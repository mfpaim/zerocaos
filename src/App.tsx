import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { RequestsProvider } from "@/hooks/useRequests";
import { UserProvider } from "@/hooks/useUser";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Groups from "./pages/Groups";
import Statistics from "./pages/Statistics";
import Archived from "./pages/Archived";
import TalkToData from "./pages/TalkToData";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <RequestsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex-1 lg:ml-0 pt-16 lg:pt-0 overflow-x-hidden">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/calendario" element={<Calendar />} />
                  <Route path="/grupos" element={<Groups />} />
                  <Route path="/estatisticas" element={<Statistics />} />
                  <Route path="/chat" element={<TalkToData />} />
                  <Route path="/arquivados" element={<Archived />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </RequestsProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
