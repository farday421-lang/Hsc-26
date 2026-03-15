import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Loader2 } from 'lucide-react';
import { Login } from './components/Login';
import { DynamicIsland } from './components/DynamicIsland';
import { Dashboard } from './components/Dashboard';
import { AddClassModal } from './components/AddClassModal';
import { FuturisticButton } from './components/FuturisticButton';
import { FloatingMusicPlayer } from './components/FloatingMusicPlayer';
import { UserData, ClassItem, Subject, ProgressState } from './types';
import { supabase } from './lib/supabase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'search' | 'bookmarks'>('dashboard');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on start
  useEffect(() => {
    const savedUser = localStorage.getItem('hsc_2026_current_user');
    if (savedUser) {
      setCurrentUser(savedUser);
      loadUserData(savedUser);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUserData = async (username: string) => {
    setIsLoading(true);
    try {
      // Fetch user
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist, create one
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{ username, total_study_hours: 0, last_active_date: new Date().toISOString() }])
          .select()
          .single();
        
        if (createError) throw createError;
        user = newUser;
      } else if (userError) {
        throw userError;
      }

      // Fetch classes
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('username', username)
        .order('date_added', { ascending: false });

      if (classesError) throw classesError;

      // Map snake_case to camelCase
      const formattedClasses: ClassItem[] = (classes || []).map(c => ({
        id: c.id,
        title: c.title,
        subject: c.subject as Subject,
        youtubeUrl: c.youtube_url,
        pdfUrl: c.pdf_url,
        dateAdded: c.date_added,
        progress: c.progress as ProgressState,
        isBookmarked: c.is_bookmarked,
        lastWatchedAt: c.last_watched_at,
        lastPosition: c.last_position
      }));

      setUserData({
        username: user.username,
        totalStudyHours: user.total_study_hours || 0,
        lastActiveDate: user.last_active_date,
        classes: formattedClasses
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to local storage if Supabase fails
      const allData = JSON.parse(localStorage.getItem('hsc_2026_study_hub_data') || '{}');
      if (allData[username]) setUserData(allData[username]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (error || !data) {
        alert("Account not found. Please create an account first.");
        return false;
      }

      setCurrentUser(username);
      localStorage.setItem('hsc_2026_current_user', username);
      await loadUserData(username);
      return true;
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred during login.");
      return false;
    }
  };

  const handleCreateAccount = async (username: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        alert("Username already exists. Please login instead.");
        return false;
      }

      // Create new user
      const { error } = await supabase
        .from('users')
        .insert([{ username, total_study_hours: 0, last_active_date: new Date().toISOString() }]);

      if (error) {
        console.error("Error creating account:", error);
        alert("Failed to create account. Please try again.");
        return false;
      }

      setCurrentUser(username);
      localStorage.setItem('hsc_2026_current_user', username);
      await loadUserData(username);
      return true;
    } catch (err) {
      console.error("Create account error:", err);
      alert("An error occurred while creating the account.");
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserData(null);
    localStorage.removeItem('hsc_2026_current_user');
  };

  const handleAddClass = async (data: { title: string; subject: Subject; youtubeUrl: string; pdfUrl?: string }) => {
    if (!userData || !currentUser) return;

    const newClass: ClassItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      dateAdded: new Date().toISOString(),
      progress: 'Not Started',
      isBookmarked: false,
    };

    // Optimistic UI update
    setUserData({
      ...userData,
      classes: [newClass, ...userData.classes],
    });

    setIsSaving(true);
    try {
      await supabase.from('classes').insert([{
        id: newClass.id,
        username: currentUser,
        title: newClass.title,
        subject: newClass.subject,
        youtube_url: newClass.youtubeUrl,
        pdf_url: newClass.pdfUrl,
        date_added: newClass.dateAdded,
        progress: newClass.progress,
        is_bookmarked: newClass.isBookmarked
      }]);
    } catch (error) {
      console.error('Error adding class:', error);
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  const handleUpdateClass = async (id: string, updates: Partial<ClassItem>) => {
    if (!userData || !currentUser) return;

    // Optimistic UI update
    const updatedClasses = userData.classes.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    setUserData({ ...userData, classes: updatedClasses });

    setIsSaving(true);
    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.subject !== undefined) dbUpdates.subject = updates.subject;
      if (updates.youtubeUrl !== undefined) dbUpdates.youtube_url = updates.youtubeUrl;
      if (updates.pdfUrl !== undefined) dbUpdates.pdf_url = updates.pdfUrl;
      if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
      if (updates.isBookmarked !== undefined) dbUpdates.is_bookmarked = updates.isBookmarked;
      if (updates.lastWatchedAt !== undefined) dbUpdates.last_watched_at = updates.lastWatchedAt;
      if (updates.lastPosition !== undefined) dbUpdates.last_position = updates.lastPosition;

      await supabase.from('classes').update(dbUpdates).eq('id', id);
    } catch (error) {
      console.error('Error updating class:', error);
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!userData || !currentUser) return;

    // Optimistic UI update
    const updatedClasses = userData.classes.filter(c => c.id !== id);
    setUserData({ ...userData, classes: updatedClasses });

    setIsSaving(true);
    try {
      await supabase.from('classes').delete().eq('id', id);
    } catch (error) {
      console.error('Error deleting class:', error);
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  const stats = useMemo(() => {
    if (!userData) return { totalStudyHours: 0, classesCompletedToday: 0, totalClasses: 0, completedPercentage: 0 };
    
    const total = userData.classes.length;
    const completed = userData.classes.filter(c => c.progress === 'Completed').length;
    const today = new Date().toDateString();
    const completedToday = userData.classes.filter(c => 
      c.progress === 'Completed' && new Date(c.dateAdded).toDateString() === today
    ).length;

    return {
      totalStudyHours: userData.totalStudyHours,
      classesCompletedToday: completedToday,
      totalClasses: total,
      completedPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [userData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-neon-blue animate-spin mb-4" />
        <p className="text-neon-blue font-mono uppercase tracking-widest text-sm animate-pulse">Connecting to Supabase...</p>
      </div>
    );
  }

  if (!currentUser || !userData) {
    return <Login onLogin={handleLogin} onCreateAccount={handleCreateAccount} />;
  }

  return (
    <div className="min-h-screen bg-brand-black selection:bg-neon-blue/30">
      <DynamicIsland 
        stats={stats} 
        onNavigate={(view) => setCurrentView(view)} 
      />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-40">
        <header className="mb-12 flex items-end justify-between">
          <div className="flex items-center gap-6">
            <div className="space-y-2">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-bold tracking-tight"
              >
                Hello, <span className="text-neon-blue">{userData.username}</span>
              </motion.h1>
              <p className="text-white/40 font-medium">Ready to conquer your HSC 2026 goals?</p>
            </div>
            
            <AnimatePresence>
              {isSaving && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -10 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neon-blue/10 rounded-full border border-neon-blue/20 mb-1"
                >
                  <Cloud className="w-3.5 h-3.5 text-neon-blue animate-pulse" />
                  <span className="text-[10px] font-bold text-neon-blue uppercase tracking-widest">Syncing to Cloud</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <FuturisticButton 
            variant="ghost"
            onClick={handleLogout}
            className="px-2 py-1"
          >
            Logout Session
          </FuturisticButton>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'dashboard' && (
              <Dashboard 
                userData={userData}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
                onAddClass={() => setIsAddModalOpen(true)}
              />
            )}
            {currentView === 'search' && (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-white/40">Search coming soon</h2>
                <p className="text-white/20">Use the dashboard search for now!</p>
              </div>
            )}
            {currentView === 'bookmarks' && (
              <Dashboard 
                userData={{
                  ...userData,
                  classes: userData.classes.filter(c => c.isBookmarked)
                }}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
                onAddClass={() => setIsAddModalOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <AddClassModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddClass}
      />

      <FloatingMusicPlayer />

      {/* Footer Branding */}
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em]">HSC 2026 • Futuristic Learning Hub</p>
      </footer>
    </div>
  );
}
