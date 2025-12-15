import { useState, useEffect, useRef } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Ratings from "./pages/Ratings";
import ChatAI from "./pages/ChatAI";
import NotFound from "./pages/NotFound";
import LoadingScreen from "./components/LoadingScreen";
import NotificationBar from "./components/NotificationBar";
import TouchAnimation from "./components/TouchAnimation";
import AudioPlayer, { AudioPlayerRef } from "./components/AudioPlayer";

const queryClient = new QueryClient();

const App = () => {
  const [showLoading, setShowLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [session, setSession] = useState<any>(null);
  const audioRef = useRef<AudioPlayerRef>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setShowNotification(true);
    audioRef.current?.play();
  };

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <TouchAnimation />
        <AudioPlayer ref={audioRef} src="https://files.catbox.moe/4i3vwy.mpeg" autoPlay />
        {showNotification && <NotificationBar onClose={() => setShowNotification(false)} />}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
            <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" replace />} />
            <Route path="/ratings" element={session ? <Ratings /> : <Navigate to="/login" replace />} />
            <Route path="/chat" element={session ? <ChatAI /> : <Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
