import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import ResearchSupport from "./pages/ResearchSupport.tsx";
import Programs from "./pages/Programs.tsx";
import ProgramDetail from "./pages/ProgramDetail.tsx";
import LibraryAutomation from "./pages/LibraryAutomation.tsx";
import Events from "./pages/Events.tsx";
import EventGallery from "./pages/EventGallery.tsx";
import KnowledgeHub from "./pages/KnowledgeHub.tsx";
import Community from "./pages/Community.tsx";
import Governance from "./pages/Governance.tsx";
import Contact from "./pages/Contact.tsx";
import NotFound from "./pages/NotFound.tsx";
import Membership from "./pages/Membership.tsx";
import Donate from "./pages/Donate.tsx";
import Blog from "./pages/Blog.tsx";
import LISATube from "./pages/LISATube.tsx";
import Volunteer from "./pages/Volunteer.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminMemberDetail from "./pages/admin/AdminMemberDetail.tsx";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/research-support" element={<ResearchSupport />} />
          <Route path="/program" element={<Programs />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/:slug" element={<ProgramDetail />} />
          <Route path="/library-automation" element={<LibraryAutomation />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/gallery/:slug" element={<EventGallery />} />
          <Route path="/events/gallery/:slug/:eventSlug" element={<EventGallery />} />
          <Route path="/knowledge" element={<KnowledgeHub />} />
          <Route path="/community" element={<Community />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/lisatube" element={<LISATube />} />

          {/* Admin routes (not linked from nav) */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/members/:id" element={<AdminMemberDetail />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
