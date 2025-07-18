import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocalizationProvider } from "@/hooks/useLocalization";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import DynamicPage from "@/pages/[slug]";
import AffiliateDashboard from "@/pages/admin/affiliate-dashboard";
import UserInsights from "@/pages/admin/user-insights";
import { ExperimentsDashboard } from "@/pages/ExperimentsDashboard";
import LeadsDashboard from "@/pages/LeadsDashboard";
import CrossDeviceAnalyticsDashboard from "@/pages/admin/CrossDeviceAnalyticsDashboard";
import LocalizationDashboard from "@/components/LocalizationDashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin/affiliate-dashboard" component={AffiliateDashboard} />
      <Route path="/admin/user-insights" component={UserInsights} />
      <Route path="/admin/experiments-dashboard" component={() => <ExperimentsDashboard />} />
      <Route path="/admin/leads-dashboard" component={LeadsDashboard} />
      <Route path="/admin/cross-device-analytics" component={CrossDeviceAnalyticsDashboard} />
      <Route path="/admin/localization" component={LocalizationDashboard} />
      <Route path="/page/:slug" component={DynamicPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;
