/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Heart, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  QrCode,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  BookOpen,
  Church,
  TrendingUp,
  Award,
  Bell
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { 
  memberService, 
  classService, 
  attendanceService, 
  welfareService 
} from './services/churchService';
import { Member, ChurchClass, AttendanceRecord, WelfareRecord, MemberCategory, Gender, MaritalStatus } from './types';
import { QRCodeSVG } from 'qrcode.react';

// --- Components ---

const MemberForm = ({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male' as Gender,
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    homeAddress: '',
    occupation: '',
    maritalStatus: 'Single' as MaritalStatus,
    baptismStatus: false,
    confirmationStatus: false,
    dateJoined: new Date().toISOString().split('T')[0],
    category: 'Full Member' as MemberCategory,
    groups: [] as string[],
    classes: [] as string[],
    emergencyContact: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await memberService.addMember(formData);
      onSuccess();
    } catch (error) {
      console.error("Failed to add member:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-stone-800">Add New Member</h3>
          <button onClick={onCancel} className="p-2 hover:bg-stone-100 rounded-full"><X /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600">Full Name *</label>
            <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-2 border rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600">Gender *</label>
            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})} className="w-full p-2 border rounded-xl">
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600">Date of Birth</label>
            <input type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full p-2 border rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600">Phone Number</label>
            <input value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full p-2 border rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600">Category *</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as MemberCategory})} className="w-full p-2 border rounded-xl">
              <option>Full Member</option>
              <option>Communicant</option>
              <option>Catechumen</option>
              <option>Adherant</option>
              <option>Junior Member</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600">Marital Status</label>
            <select value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value as MaritalStatus})} className="w-full p-2 border rounded-xl">
              <option>Single</option>
              <option>Married</option>
              <option>Widowed</option>
              <option>Divorced</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600">Home Address</label>
            <input value={formData.homeAddress} onChange={e => setFormData({...formData, homeAddress: e.target.value})} className="w-full p-2 border rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600">Emergency Contact</label>
            <input value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} className="w-full p-2 border rounded-xl" />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={formData.baptismStatus} onChange={e => setFormData({...formData, baptismStatus: e.target.checked})} className="w-4 h-4" />
              <span className="text-sm font-bold text-stone-600">Baptized</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={formData.confirmationStatus} onChange={e => setFormData({...formData, confirmationStatus: e.target.checked})} className="w-4 h-4" />
              <span className="text-sm font-bold text-stone-600">Confirmed</span>
            </label>
          </div>

          <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onCancel} className="px-6 py-2 text-stone-500 font-bold">Cancel</button>
            <button type="submit" disabled={loading} className="px-8 py-2 bg-red-800 text-white font-bold rounded-xl hover:bg-red-900 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Member'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const MemberIDCard = ({ member, onClose }: { member: Member, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full"
      >
        <div className="bg-red-800 p-6 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          <Church className="w-10 h-10 mx-auto mb-2" />
          <h3 className="text-lg font-bold">Krofu Methodist Church</h3>
          <p className="text-[10px] uppercase tracking-widest text-red-100">Official Membership Card</p>
        </div>
        
        <div className="p-6 flex flex-col items-center">
          <div className="w-32 h-32 bg-stone-100 rounded-xl mb-4 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
            {member.photoUrl ? (
              <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
            ) : (
              <Users className="w-16 h-16 text-stone-300" />
            )}
          </div>
          
          <h4 className="text-xl font-bold text-stone-800 text-center">{member.fullName}</h4>
          <p className="text-red-700 font-bold mb-4">{member.memberId}</p>
          
          <div className="w-full grid grid-cols-2 gap-4 text-xs mb-6">
            <div className="text-stone-500">
              <p className="font-bold uppercase text-[9px]">Class</p>
              <p className="text-stone-800 font-semibold">{member.classes[0] || 'N/A'}</p>
            </div>
            <div className="text-stone-500">
              <p className="font-bold uppercase text-[9px]">Phone</p>
              <p className="text-stone-800 font-semibold">{member.phoneNumber || 'N/A'}</p>
            </div>
          </div>
          
          <div className="p-2 bg-white border rounded-lg">
            <QRCodeSVG value={member.memberId} size={80} />
          </div>
          <p className="mt-2 text-[8px] text-stone-400 uppercase font-bold">Scan to verify membership</p>
        </div>
        
        <div className="p-4 bg-stone-50 flex justify-between">
          <button onClick={onClose} className="text-stone-500 font-bold text-sm">Close</button>
          <button onClick={() => window.print()} className="flex items-center space-x-2 text-red-700 font-bold text-sm">
            <Printer className="w-4 h-4" />
            <span>Print Card</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <motion.div 
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="w-48 h-48 mb-8 flex items-center justify-center p-6 bg-white rounded-full shadow-2xl border-4 border-red-800 overflow-hidden"
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Methodist_Cross_and_Flame.svg/512px-Methodist_Cross_and_Flame.svg.png" 
            alt="Methodist Church Logo" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <h1 className="text-3xl font-bold text-red-900 text-center px-4">
          Krofu Methodist Church Management System
        </h1>
        <p className="mt-2 text-red-700 italic font-medium">
          "Serving God Through Organized Ministry"
        </p>
        <div className="mt-12 flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-3 h-3 bg-red-600 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists, if not create one
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const newUser: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          role: user.email === 'addisonrobin41@gmail.com' ? 'Admin' : 'Member',
        };
        await setDoc(userRef, newUser);
      }
      onLogin();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-red-800 p-8 text-center text-white">
          <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center p-2 shadow-lg">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Methodist_Cross_and_Flame.svg/512px-Methodist_Cross_and_Flame.svg.png" 
              alt="Methodist Church Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-red-100 mt-2">Sign in to manage Krofu Methodist Church</p>
        </div>
        <div className="p-8">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-stone-200 py-3 px-4 rounded-xl font-semibold text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>
          <p className="mt-6 text-center text-stone-400 text-sm">
            Authorized personnel only. Access is monitored.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfile(userSnap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'members') {
      setShowAddMemberForm(false);
    }
  };

  const handleQuickAddMember = () => {
    setShowAddMemberForm(true);
    setActiveTab('members');
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-red-900 text-white flex-shrink-0">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-md">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Methodist_Cross_and_Flame.svg/512px-Methodist_Cross_and_Flame.svg.png" 
              alt="Methodist Church Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-bold text-lg leading-tight">KMC System</span>
        </div>
        
        <nav className="mt-6 px-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => handleTabChange('dashboard')} 
          />
          <NavItem 
            icon={<Users />} 
            label="Members" 
            active={activeTab === 'members'} 
            onClick={() => handleTabChange('members')} 
          />
          <NavItem 
            icon={<BookOpen />} 
            label="Classes" 
            active={activeTab === 'classes'} 
            onClick={() => handleTabChange('classes')} 
          />
          <NavItem 
            icon={<Calendar />} 
            label="Attendance" 
            active={activeTab === 'attendance'} 
            onClick={() => handleTabChange('attendance')} 
          />
          <NavItem 
            icon={<Heart />} 
            label="Welfare" 
            active={activeTab === 'welfare'} 
            onClick={() => handleTabChange('welfare')} 
          />
          <NavItem 
            icon={<Award />} 
            label="Reports" 
            active={activeTab === 'reports'} 
            onClick={() => handleTabChange('reports')} 
          />
        </nav>

        <div className="mt-auto p-4 border-t border-red-800/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center font-bold">
              {user.displayName?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.displayName}</p>
              <p className="text-xs text-red-300 truncate">{profile?.role}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-red-800 transition-colors text-red-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-stone-800 capitalize">{activeTab}</h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-stone-500 hover:bg-stone-200 rounded-full transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
            </button>
            <div className="hidden md:block">
              <p className="text-sm text-stone-500">{new Date().toDateString()}</p>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <DashboardView setActiveTab={handleTabChange} onQuickAddMember={handleQuickAddMember} />}
            {activeTab === 'members' && <MembersView profile={profile} initialShowForm={showAddMemberForm} onFormClose={() => setShowAddMemberForm(false)} />}
            {activeTab === 'classes' && <ClassesView />}
            {activeTab === 'attendance' && <AttendanceView />}
            {activeTab === 'welfare' && <WelfareView />}
            {activeTab === 'reports' && <ReportsView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
        active 
          ? "bg-white text-red-900 shadow-lg font-semibold" 
          : "text-red-100 hover:bg-red-800/50"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      <span>{label}</span>
    </button>
  );
}

// --- Views ---

function DashboardView({ setActiveTab, onQuickAddMember }: { setActiveTab: (tab: string) => void, onQuickAddMember: () => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [welfare, setWelfare] = useState<WelfareRecord[]>([]);

  useEffect(() => {
    const unsubMembers = memberService.subscribeToMembers(setMembers);
    const unsubWelfare = welfareService.subscribeToWelfare(setWelfare);
    return () => {
      unsubMembers();
      unsubWelfare();
    };
  }, []);

  const stats = [
    { label: 'Total Members', value: members.length.toString(), icon: <Users />, color: 'bg-blue-500' },
    { label: 'Communicants', value: members.filter(m => m.category === 'Communicant').length.toString(), icon: <ShieldCheck />, color: 'bg-emerald-500' },
    { label: 'Junior Members', value: members.filter(m => m.category === 'Junior Member').length.toString(), icon: <TrendingUp />, color: 'bg-orange-500' },
    { label: 'Welfare Fund', value: `GH₵ ${welfare.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}`, icon: <Heart />, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center space-x-4">
            <div className={cn("p-3 rounded-xl text-white", stat.color)}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-stone-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-stone-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <h3 className="text-lg font-bold text-stone-800 mb-4">Recent Registrations</h3>
          <div className="space-y-4">
            {members.slice(0, 5).map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500">
                    {member.fullName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">{member.fullName}</p>
                    <p className="text-xs text-stone-500">{member.memberId} • Joined {new Date(member.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300" />
              </div>
            ))}
            {members.length === 0 && <p className="text-center text-stone-400 py-4">No members registered yet.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <h3 className="text-lg font-bold text-stone-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <QuickAction icon={<UserPlus />} label="Add Member" color="text-blue-600" bg="bg-blue-50" onClick={onQuickAddMember} />
            <QuickAction icon={<Calendar />} label="Mark Attendance" color="text-emerald-600" bg="bg-emerald-50" onClick={() => setActiveTab('attendance')} />
            <QuickAction icon={<Heart />} label="Record Welfare" color="text-red-600" bg="bg-red-50" onClick={() => setActiveTab('welfare')} />
            <QuickAction icon={<QrCode />} label="Reports" color="text-purple-600" bg="bg-purple-50" onClick={() => setActiveTab('reports')} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, color, bg, onClick }: { icon: React.ReactNode, label: string, color: string, bg: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn("flex flex-col items-center justify-center p-6 rounded-2xl transition-transform hover:scale-105", bg)}
    >
      <div className={cn("mb-2", color)}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8" })}
      </div>
      <span className={cn("text-sm font-bold", color)}>{label}</span>
    </button>
  );
}

function MembersView({ profile, initialShowForm, onFormClose }: { profile: UserProfile | null, initialShowForm?: boolean, onFormClose?: () => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(initialShowForm || false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialShowForm) setShowForm(true);
  }, [initialShowForm]);

  useEffect(() => {
    return memberService.subscribeToMembers(setMembers);
  }, []);

  const filteredMembers = members.filter(m => 
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.memberId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCloseForm = () => {
    setShowForm(false);
    onFormClose?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3">
          {profile?.role === 'Admin' && (
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-800 text-white rounded-xl hover:bg-red-900 transition-colors shadow-lg shadow-red-900/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Member</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-stone-600">Member</th>
              <th className="px-6 py-4 text-sm font-bold text-stone-600">ID</th>
              <th className="px-6 py-4 text-sm font-bold text-stone-600">Category</th>
              <th className="px-6 py-4 text-sm font-bold text-stone-600">Phone</th>
              <th className="px-6 py-4 text-sm font-bold text-stone-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                      {member.fullName[0]}
                    </div>
                    <span className="font-semibold text-stone-800">{member.fullName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-stone-500">{member.memberId}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">{member.category}</span>
                </td>
                <td className="px-6 py-4 text-sm text-stone-500">{member.phoneNumber}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedMember(member)}
                      className="p-1 text-stone-400 hover:text-red-700 transition-colors"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <MemberForm onCancel={handleCloseForm} onSuccess={handleCloseForm} />}
      {selectedMember && <MemberIDCard member={selectedMember} onClose={() => setSelectedMember(null)} />}
    </div>
  );
}

function ClassesView() {
  const [classes, setClasses] = useState<ChurchClass[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const unsubClasses = classService.subscribeToClasses(setClasses);
    const unsubMembers = memberService.subscribeToMembers(setMembers);
    return () => {
      unsubClasses();
      unsubMembers();
    };
  }, []);

  const defaultClasses = [
    { name: 'Wesley Class', type: 'Traditional' },
    { name: 'Freeman Class', type: 'Traditional' },
    { name: 'Hammond Class', type: 'Traditional' },
    { name: 'Dunwell Class', type: 'Traditional' },
    { name: 'Youth Fellowship', type: 'Ministry/Fellowship' },
    { name: 'Choir', type: 'Ministry/Fellowship' },
  ];

  const displayClasses = classes.length > 0 ? classes : defaultClasses as ChurchClass[];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayClasses.map((cls, i) => {
        const classMembers = members.filter(m => m.classes.includes(cls.name));
        return (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:border-red-200 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-50 text-red-700 rounded-xl group-hover:bg-red-700 group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{cls.type}</span>
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-1">{cls.name}</h3>
            <p className="text-sm text-stone-500 mb-6">{cls.description || 'Spiritual growth and fellowship group for members.'}</p>
            <div className="flex items-center justify-between pt-4 border-t border-stone-50">
              <div className="flex -space-x-2">
                {classMembers.slice(0, 3).map((m, j) => (
                  <div key={j} className="w-8 h-8 rounded-full border-2 border-white bg-stone-200 flex items-center justify-center text-[10px] font-bold">
                    {m.fullName[0]}
                  </div>
                ))}
                {classMembers.length > 3 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-400">
                    +{classMembers.length - 3}
                  </div>
                )}
                {classMembers.length === 0 && <span className="text-[10px] text-stone-400 font-bold">No members</span>}
              </div>
              <button className="text-red-700 font-bold text-sm hover:underline">Manage</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AttendanceView() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [serviceType, setServiceType] = useState('Sunday Service');
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent'>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return memberService.subscribeToMembers(setMembers);
  }, []);

  const filteredMembers = selectedClass === 'All Classes' 
    ? members 
    : members.filter(m => m.classes.includes(selectedClass));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const records = filteredMembers.map(m => ({
        date: new Date().toISOString().split('T')[0],
        memberId: m.memberId,
        status: attendance[m.memberId] || 'Absent',
        serviceType: serviceType as any,
        recordedBy: auth.currentUser?.uid || 'System'
      }));
      await attendanceService.recordAttendance(records);
      alert('Attendance recorded successfully!');
    } catch (error) {
      console.error("Failed to record attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="p-6 border-b border-stone-100 bg-stone-50/50">
        <h3 className="text-lg font-bold text-stone-800">Record Attendance</h3>
        <p className="text-sm text-stone-500">{serviceType} - {new Date().toLocaleDateString()}</p>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600">Service Type</label>
            <select 
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option>Sunday Service</option>
              <option>Prayer Meeting</option>
              <option>Bible Study</option>
              <option>Class Meeting</option>
              <option>Special Service</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-600">Class Filter</label>
            <select 
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option>All Classes</option>
              {['Wesley Class', 'Freeman Class', 'Hammond Class', 'Youth Fellowship', 'Choir'].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          <div className="flex items-center justify-between py-2 border-b border-stone-100 sticky top-0 bg-white z-10">
            <span className="font-bold text-stone-700">Member List ({filteredMembers.length})</span>
            <div className="flex space-x-4">
              <span className="text-xs font-bold text-stone-400">Present</span>
              <span className="text-xs font-bold text-stone-400">Absent</span>
            </div>
          </div>
          {filteredMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">
                  {member.fullName[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800">{member.fullName}</p>
                  <p className="text-[10px] text-stone-400">{member.memberId}</p>
                </div>
              </div>
              <div className="flex space-x-8">
                <input 
                  type="radio" 
                  name={`att-${member.id}`} 
                  className="w-5 h-5 accent-emerald-600" 
                  onChange={() => setAttendance({...attendance, [member.memberId]: 'Present'})}
                />
                <input 
                  type="radio" 
                  name={`att-${member.id}`} 
                  className="w-5 h-5 accent-red-600" 
                  defaultChecked
                  onChange={() => setAttendance({...attendance, [member.memberId]: 'Absent'})}
                />
              </div>
            </div>
          ))}
          {filteredMembers.length === 0 && <p className="text-center text-stone-400 py-8">No members found for this class.</p>}
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading || filteredMembers.length === 0}
          className="w-full py-4 bg-red-800 text-white font-bold rounded-xl hover:bg-red-900 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Attendance'}
        </button>
      </div>
    </div>
  );
}

function WelfareView() {
  const [records, setRecords] = useState<WelfareRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    memberId: '',
    type: 'Medical Assistance',
    description: '',
    amount: 0,
    status: 'Pending' as any,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const unsubWelfare = welfareService.subscribeToWelfare(setRecords);
    const unsubMembers = memberService.subscribeToMembers(setMembers);
    return () => {
      unsubWelfare();
      unsubMembers();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await welfareService.addWelfare(formData);
      setShowForm(false);
      setFormData({
        memberId: '',
        type: 'Medical Assistance',
        description: '',
        amount: 0,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Failed to add welfare:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-stone-800">Welfare Management</h3>
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100 transition-colors"
          >
            New Case
          </button>
        </div>

        {showForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            onSubmit={handleSubmit}
            className="mb-8 p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500">Member</label>
                <select 
                  required
                  value={formData.memberId}
                  onChange={e => setFormData({...formData, memberId: e.target.value})}
                  className="w-full p-2 border rounded-xl"
                >
                  <option value="">Select Member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.memberId}>{m.fullName} ({m.memberId})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500">Welfare Type</label>
                <input 
                  required
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full p-2 border rounded-xl"
                  placeholder="e.g. Medical, Bereavement"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500">Amount (GH₵)</label>
                <input 
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                  className="w-full p-2 border rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500">Date</label>
                <input 
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full p-2 border rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-500">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border rounded-xl h-20"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-stone-500 font-bold">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-red-800 text-white font-bold rounded-xl hover:bg-red-900 disabled:opacity-50">
                {loading ? 'Saving...' : 'Record Case'}
              </button>
            </div>
          </motion.form>
        )}

        <div className="space-y-4">
          {records.map((record) => {
            const member = members.find(m => m.memberId === record.memberId);
            return (
              <div key={record.id} className="p-4 border border-stone-100 rounded-2xl hover:bg-stone-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-stone-800">{record.type} - {member?.fullName || 'Unknown'}</h4>
                    <p className="text-xs text-stone-500">{record.memberId} • {new Date(record.date).toLocaleDateString()}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                    record.status === 'Completed' ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                  )}>
                    {record.status}
                  </span>
                </div>
                <p className="text-sm text-stone-600 mb-4">{record.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-stone-800">GH₵ {record.amount?.toLocaleString()}</span>
                  <button className="text-red-700 font-bold hover:underline">View Details</button>
                </div>
              </div>
            );
          })}
          {records.length === 0 && <p className="text-center text-stone-400 py-8">No welfare records found.</p>}
        </div>
      </div>
    </div>
  );
}

function ReportsView() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    return memberService.subscribeToMembers(setMembers);
  }, []);

  const exportToCSV = () => {
    const headers = ['Member ID', 'Full Name', 'Gender', 'Category', 'Phone', 'Email', 'Address'];
    const rows = members.map(m => [
      m.memberId,
      m.fullName,
      m.gender,
      m.category,
      m.phoneNumber,
      m.email || '',
      m.homeAddress
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `KMC_Membership_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reports = [
    { title: 'Membership Report', description: 'Full list of members with categories and status.', icon: <Users />, onExport: exportToCSV },
    { title: 'Attendance Summary', description: 'Monthly attendance statistics and trends.', icon: <Calendar /> },
    { title: 'Welfare Disbursement', description: 'Summary of welfare support provided.', icon: <Heart /> },
    { title: 'Class Membership', description: 'Member distribution across spiritual classes.', icon: <BookOpen /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reports.map((report, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-start space-x-4 hover:shadow-md transition-all cursor-pointer">
          <div className="p-3 bg-stone-50 text-stone-400 rounded-xl">
            {report.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-stone-800 mb-1">{report.title}</h3>
            <p className="text-sm text-stone-500 mb-4">{report.description}</p>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-1 text-xs font-bold text-red-700 hover:underline">
                <Download className="w-3 h-3" />
                <span>PDF</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); report.onExport?.(); }}
                className="flex items-center space-x-1 text-xs font-bold text-red-700 hover:underline"
              >
                <Download className="w-3 h-3" />
                <span>Excel/CSV</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
