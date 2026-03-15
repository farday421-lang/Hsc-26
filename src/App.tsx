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
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [showManualConfig, setShowManualConfig] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualKey, setManualKey] = useState('');

  // Check Supabase connection on start
  useEffect(() => {
    const checkConnection = async () => {
      let url = import.meta.env.VITE_SUPABASE_URL;
      let key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Check localStorage for manual override
      const storedUrl = localStorage.getItem('manual_supabase_url');
      const storedKey = localStorage.getItem('manual_supabase_key');
      
      if (storedUrl && storedKey) {
        url = storedUrl;
        key = storedKey;
      }

      if (!url || url.includes('placeholder') || !key || key.includes('placeholder')) {
        setConnectionError("Supabase configuration is missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Settings -> Environment Variables menu.");
        setIsLoading(false);
        return;
      }

      try {
        // Simple ping test
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1);
        if (error) {
          console.error('Supabase connection test failed:', error);
          if (error.message.includes('FetchError') || error.message.includes('Failed to fetch')) {
            setConnectionError(`Could not connect to Supabase. Error: ${error.message}`);
          } else if (error.code === '42P01') {
            // Table doesn't exist, but connection is OK
            console.log('Connection OK, but users table missing.');
          } else {
            console.log('Connection test returned an error:', error.message);
          }
        }
      } catch (err) {
        console.error('Connection test exception:', err);
        setConnectionError("An unexpected error occurred while connecting to Supabase.");
      } finally {
        const savedUser = localStorage.getItem('hsc_2026_current_user');
        if (!savedUser) {
          setIsLoading(false);
        }
      }
    };
    checkConnection();
  }, []);

  const handleSaveManualConfig = () => {
    if (manualUrl && manualKey) {
      localStorage.setItem('manual_supabase_url', manualUrl);
      localStorage.setItem('manual_supabase_key', manualKey);
      window.location.reload();
    }
  };

  const handleClearManualConfig = () => {
    localStorage.removeItem('manual_supabase_url');
    localStorage.removeItem('manual_supabase_key');
    window.location.reload();
  };

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

  // Persist data to localStorage
  useEffect(() => {
    if (userData && currentUser) {
      const allData = JSON.parse(localStorage.getItem('hsc_2026_study_hub_data') || '{}');
      allData[currentUser] = userData;
      localStorage.setItem('hsc_2026_study_hub_data', JSON.stringify(allData));
    }
  }, [userData, currentUser]);

  const loadUserData = async (username: string, isNewUser: boolean = false) => {
    setIsLoading(true);
    try {
      // Fetch user
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError && userError.code === 'PGRST116') {
        if (isNewUser) {
          // User doesn't exist, create one
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{ username, total_study_hours: 0, last_active_date: new Date().toISOString() }])
            .select()
            .single();
          
          if (createError) throw createError;
          user = newUser;
        } else {
          // If user not found and not creating new, clear session
          handleLogout();
          return;
        }
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
      if (allData[username]) {
        setUserData(allData[username]);
      } else {
        // Initialize new user data if nothing exists
        setUserData({
          username,
          totalStudyHours: 0,
          lastActiveDate: new Date().toISOString(),
          classes: []
        });
      }
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

      if (error) {
        if (error.code === 'PGRST116') {
          alert("Account not found. Please create an account first.");
          return false;
        }
        throw error;
      }

      setCurrentUser(username);
      localStorage.setItem('hsc_2026_current_user', username);
      await loadUserData(username);
      return true;
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please check your internet connection or Supabase settings.");
      return false;
    }
  };

  const handleCreateAccount = async (username: string): Promise<boolean> => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        alert("Username already exists. Please login instead.");
        return false;
      }

      const { error } = await supabase
        .from('users')
        .insert([{ username, total_study_hours: 0, last_active_date: new Date().toISOString() }]);

      if (error) throw error;

      setCurrentUser(username);
      localStorage.setItem('hsc_2026_current_user', username);
      await loadUserData(username, true);
      return true;
    } catch (err) {
      console.error("Create account error:", err);
      alert("Failed to create account. Make sure Supabase is connected.");
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
      console.log('Adding class to Supabase:', newClass);
      const { error } = await supabase.from('classes').insert([{
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
      
      if (error) {
        console.error('Supabase insert error:', error);
        alert(`Error: ${error.message}`);
      } else {
        console.log('Class added successfully');
      }
    } catch (error: any) {
      console.error('Error adding class:', error);
      alert(`Failed to add class: ${error.message || 'Unknown error'}`);
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

  if (connectionError) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <Cloud className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Configuration Missing</h2>
        <p className="text-white/60 max-w-md mb-8">
          {connectionError}
        </p>
        <div className="glass-card p-4 text-left text-xs font-mono text-red-400 space-y-2">
          <p>1. Open the Settings menu (gear icon)</p>
          <p>2. Go to Environment Variables</p>
          <p>3. Add VITE_SUPABASE_URL {"&"} VITE_SUPABASE_ANON_KEY</p>
          <p>4. Refresh the page or click below</p>
        </div>

        <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 text-left w-full max-w-md">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Debug Info</p>
          <div className="space-y-1 font-mono text-[10px]">
            <p className="text-white/40">URL Detected: <span className={import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') ? "text-green-400" : "text-red-400"}>
              {import.meta.env.VITE_SUPABASE_URL ? (import.meta.env.VITE_SUPABASE_URL.includes('placeholder') ? "Placeholder" : "Detected") : "Missing"}
            </span></p>
            <p className="text-white/40">Key Detected: <span className={import.meta.env.VITE_SUPABASE_ANON_KEY && !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder') ? "text-green-400" : "text-red-400"}>
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? (import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder') ? "Placeholder" : "Detected") : "Missing"}
            </span></p>
            {localStorage.getItem('manual_supabase_url') && (
              <p className="text-neon-blue mt-2">Manual Override Active</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8 w-full max-w-md">
          <FuturisticButton 
            onClick={() => window.location.reload()}
            variant="outline"
            showAnimatedBorder
          >
            Retry Connection
          </FuturisticButton>

          <button 
            onClick={() => setShowManualConfig(!showManualConfig)}
            className="text-white/40 text-xs hover:text-white/60 transition-colors"
          >
            {showManualConfig ? "Hide Manual Config" : "Try Manual Configuration"}
          </button>

          {showManualConfig && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 space-y-4 mt-2"
            >
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-wider">Supabase URL</label>
                <input 
                  type="text"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-neon-blue/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-wider">Anon Key</label>
                <input 
                  type="text"
                  value={manualKey}
                  onChange={(e) => setManualKey(e.target.value)}
                  placeholder="your-anon-key"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-neon-blue/50"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <FuturisticButton 
                  onClick={handleSaveManualConfig}
                  className="flex-1 py-2 text-xs"
                >
                  Save & Connect
                </FuturisticButton>
                {localStorage.getItem('manual_supabase_url') && (
                  <button 
                    onClick={handleClearManualConfig}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

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
        onLogout={handleLogout}
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
