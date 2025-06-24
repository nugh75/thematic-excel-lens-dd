
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Analysis from "./pages/Analysis";
import Configuration from "./pages/Configuration";
import InstructionsPage from "./pages/InstructionsPage";
import NotFound from "./pages/NotFound";
import { StatusBar } from "./components/StatusBar";
import { ToastNotification } from "./components/ToastNotification";
import { OfflineStatus } from "./components/OfflineStatus";
import { useOnlineSync } from "./hooks/useOnlineSync";

const queryClient = new QueryClient();

const AppContent = () => {
  // Initialize online sync hook
  useOnlineSync();

  return (
    <div className="min-h-screen bg-gray-50">
      <StatusBar />
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <OfflineStatus />
        </div>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/configuration" element={<Configuration />} />
          <Route path="/instructions" element={<InstructionsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ToastNotification />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
