import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { AddClassModal } from './components/AddClassModal';
import { DynamicIsland } from './components/DynamicIsland';
import { FloatingMusicPlayer } from './components/FloatingMusicPlayer';
import { ClassItem, UserData, Subject } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Settings, Bell, Search } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  // Load user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('hsc_2026_current_user');
    if (savedUser) {
      setCurrentUser(savedUser);
      loadUserData(savedUser);
    }
  }, []);

  // Save user data whenever it changes
  useEffect(() => {
    if (userData && currentUser) {
      fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user': currentUser
        },
        body: JSON.stringify(userData)
      }).catch(err => console.error('Failed to save data', err));
    }
  }, [userData, currentUser]);

  const loadUserData = async (username: string) => {
    try {
      const res = await fetch('/api/data', {
        headers: { 'x-user': username }
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to load user data', err);
      handleLogout();
    }
  };

  const handleLogin = async (username: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(username);
        localStorage.setItem('hsc_2026_current_user', username);
        setUserData(data.userData);
        return true;
      } else {
        alert(data.error || "Login failed");
        return false;
      }
    } catch (err) {
      console.error('Login error', err);
      alert("Network error during login");
      return false;
    }
  };

  const handleCreateAccount = async (username: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(username);
        localStorage.setItem('hsc_2026_current_user', username);
        setUserData(data.userData);
        return true;
      } else {
        alert(data.error || "Registration failed");
        return false;
      }
    } catch (err) {
      console.error('Registration error', err);
      alert("Network error during registration");
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserData(null);
    localStorage.removeItem('hsc_2026_current_user');
  };

  const handleAddClass = (data: { title: string; subject: Subject; youtubeUrl: string; pdfUrl?: string }) => {
    if (!userData) return;

    const newClass: ClassItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      dateAdded: new Date().toISOString(),
      progress: 'Not Started',
      isBookmarked: false,
      lastPosition: 0
    };

    setUserData({
      ...userData,
      classes: [newClass, ...userData.classes]
    });
  };

  const handleUpdateClass = (id: string, updates: Partial<ClassItem>) => {
    if (!userData) return;

    setUserData({
      ...userData,
      classes: userData.classes.map(c => 
        c.id === id ? { ...c, ...updates } : c
      )
    });
  };

  const handleDeleteClass = (id: string) => {
    if (!userData) return;
    if (window.confirm('Are you sure you want to delete this class?')) {
      setUserData({
        ...userData,
        classes: userData.classes.filter(c => c.id !== id)
      });
    }
  };

  if (!currentUser || !userData) {
    return <Login onLogin={handleLogin} onCreateAccount={handleCreateAccount} onRecoverPassword={async () => null} />;
  }

  return (
    <div className="min-h-screen bg-brand-black text-white font-sans selection:bg-neon-blue/30 selection:text-neon-blue overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon-blue/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-neon-purple/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <DynamicIsland />
      <FloatingMusicPlayer />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-brand-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-brand-black border border-white/10 p-3 rounded-xl">
                <div className="w-6 h-6 bg-gradient-to-br from-neon-blue to-neon-purple rounded-md shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                HSC '26 Hub
              </h1>
              <p className="text-[10px] font-bold text-neon-blue uppercase tracking-widest">
                Welcome back, {currentUser}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all duration-300 group relative">
              <Bell className="w-5 h-5 text-white/60 group-hover:text-white" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-neon-blue rounded-full shadow-[0_0_10px_rgba(0,242,255,1)]" />
            </button>
            <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all duration-300 group">
              <Settings className="w-5 h-5 text-white/60 group-hover:text-white" />
            </button>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 border border-red-500/20 hover:border-red-500/40"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <Dashboard 
          userData={userData} 
          onUpdateClass={handleUpdateClass} 
          onDeleteClass={handleDeleteClass}
          onAddClass={() => setIsAddModalOpen(true)}
        />
      </main>

      <AddClassModal
        isOpen={isAddModalOpen || !!editingClass}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingClass(null);
        }}
        onAdd={(data) => {
          if (editingClass) {
            handleUpdateClass(editingClass.id, data);
            setEditingClass(null);
          } else {
            handleAddClass(data);
          }
          setIsAddModalOpen(false);
        }}
        editingClass={editingClass || undefined}
      />
    </div>
  );
}

export default App;
