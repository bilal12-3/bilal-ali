/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, 
  Smartphone, 
  Mail, 
  Lock, 
  User, 
  Building, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  LogOut, 
  Sparkles, 
  MessageSquare, 
  Database, 
  TrendingUp, 
  Zap, 
  Plus,
  Moon,
  Info,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Send,
  Play
} from 'lucide-react';

// Static Firebase credentials configured for this task
const firebaseConfig = {
  projectId: "encouraging-oarlock-rjkjx",
  appId: "1:1089277019424:web:fc0e2a67f60a92e8ea8345",
  apiKey: "AIzaSyCTFj1Nf60Rpzkl6Arwqe2gQauzHfnOA5Q",
  authDomain: "encouraging-oarlock-rjkjx.firebaseapp.com",
  storageBucket: "encouraging-oarlock-rjkjx.firebasestorage.app",
  messagingSenderId: "1089277019424",
};

// Toast notification interface
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  title?: string;
}

// Simulated lead interface
interface SolarLead {
  id: string;
  name: string;
  companyName: string;
  email: string;
  monthlyBill: number;
  roofArea: number; // in sq ft
  sunHours: number; // per day avg
  aiAnalysisStatus: 'Pending' | 'Analyzing' | 'Optimized' | 'Failed';
  aiProposalText?: string;
  timestamp: string;
}

declare global {
  interface Window {
    firebase: any;
  }
}

export default function App() {
  // Navigation / View states
  const [isLoginView, setIsLoginView] = useState<boolean>(true);
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Auth / User states
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState<boolean>(false);

  // Form input states
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  
  const [signupFullName, setSignupFullName] = useState<string>('');
  const [signupCompany, setSignupCompany] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState<string>('');

  // Solar WhatsApp Sandbox Simulation States
  const [sandboxCustomerMsg, setSandboxCustomerMsg] = useState<string>(
    "Hi, I am looking to install solar panels for my warehouse structure. We pay about $450/month in electricity. My roof size is roughly 3,500 sq ft. Email: test@solarsaaS.com"
  );
  const [sandboxAiProposal, setSandboxAiProposal] = useState<string>("");
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  // Live CRM leads saved in localStorage for realism
  const [leads, setLeads] = useState<SolarLead[]>([
    {
      id: "lead_1",
      name: "Arthur Pendragon",
      companyName: "Avalon Logics",
      email: "arthur@avalon.io",
      monthlyBill: 380,
      roofArea: 2400,
      sunHours: 5.4,
      aiAnalysisStatus: "Optimized",
      aiProposalText: "☀️ **AVALON LOGICS SOLAR PROPOSAL** ☀️\n• Recommended System: 15.2 kW DC\n• Selected Panels: 38x High-Efficiency 400W Monocrystalline\n• Total Cost: $29,480 (Before 30% FTC Tax Credit: $20,636 Net)\n• Estimated Payback: 4.8 Years\n• Carbon Mitigations: 12.4 Tons annually.",
      timestamp: "10 mins ago"
    },
    {
      id: "lead_2",
      name: "Helena Rostova",
      companyName: "Vanguard Spares",
      email: "helena@vanguard.com",
      monthlyBill: 720,
      roofArea: 6800,
      sunHours: 5.8,
      aiAnalysisStatus: "Analyzing",
      timestamp: "Just Now"
    }
  ]);

  // Initializing Firebase App and Auth once CDM script loads
  useEffect(() => {
    let authSubscription: any = null;
    const checkFirebaseAndInit = () => {
      if (window.firebase) {
        try {
          if (!window.firebase.apps.length) {
            window.firebase.initializeApp(firebaseConfig);
          }
          const auth = window.firebase.auth();
          setIsFirebaseLoaded(true);

          authSubscription = auth.onAuthStateChanged((firebaseUser: any) => {
            if (firebaseUser) {
              setUser(firebaseUser);
              // Set persistent user details if there's any meta-data
              if (!firebaseUser.displayName && signupFullName) {
                firebaseUser.updateProfile({
                  displayName: signupFullName
                });
              }
            } else {
              setUser(null);
            }
            setLoading(false);
          });
        } catch (error: any) {
          console.error("Firebase init failed:", error);
          showToast('error', 'Firebase Initialization Failed', error.message);
          setLoading(false);
        }
      } else {
        // Retry checking after 200ms
        setTimeout(checkFirebaseAndInit, 200);
      }
    };

    checkFirebaseAndInit();

    // Load custom leads from localStorage if they exist
    const savedLeads = localStorage.getItem('solar_wa_leads');
    if (savedLeads) {
      try {
        setLeads(JSON.parse(savedLeads));
      } catch (e) {
        console.error("Failed loading saved leads", e);
      }
    }

    return () => {
      if (authSubscription) {
        authSubscription();
      }
    };
  }, [signupFullName]);

  // Save Leads helper
  const saveLeadsToStorage = (updatedLeads: SolarLead[]) => {
    setLeads(updatedLeads);
    localStorage.setItem('solar_wa_leads', JSON.stringify(updatedLeads));
  };

  // Modern Toast alert trigger
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message, title };
    setToasts((prev) => [...prev, newToast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Close toast manually
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Regex validations
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // LOGIN FUNCTIONALITY
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('error', 'Missing Fields', 'Please fill in both Email and Password fields.');
      return;
    }

    if (!validateEmail(loginEmail)) {
      showToast('error', 'Invalid Email', 'Please insert a properly formatted email.');
      return;
    }

    setLoading(true);
    try {
      if (window.firebase) {
        await window.firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword);
        showToast('success', 'Authentication Successful', 'Welcome back to the Solar Intelligence HQ!');
      } else {
        throw new Error("SDK CDN is currently loading. Please retry.");
      }
    } catch (error: any) {
      console.error(error);
      const cleanMessage = error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found'
        ? "Incorrect email or password combination."
        : error.message;
      showToast('error', 'Login Failed', cleanMessage);
    } finally {
      setLoading(false);
    }
  };

  // SIGNUP FUNCTIONALITY
  const handleEmailPasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!signupFullName || !signupCompany || !signupEmail || !signupPassword || !signupConfirmPassword) {
      showToast('error', 'Required Fields Empty', 'Please provide your name, company, email, and password configurations.');
      return;
    }

    if (!validateEmail(signupEmail)) {
      showToast('error', 'Invalid Email Syntax', 'Check the email format and try again.');
      return;
    }

    if (signupPassword.length < 6) {
      showToast('error', 'Password Too Weak', 'Firebase requires passwords to be at least 6 characters in length.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      showToast('error', 'Passwords Do Not Match', 'Double check both password fields before enrolling.');
      return;
    }

    setLoading(true);
    try {
      if (window.firebase) {
        const userCredential = await window.firebase.auth().createUserWithEmailAndPassword(signupEmail, signupPassword);
        
        // Save addition user configuration to profile
        if (userCredential.user) {
          await userCredential.user.updateProfile({
            displayName: signupFullName
          });
          
          // Store solar company name locally or sync
          localStorage.setItem(`user_company_${userCredential.user.uid}`, signupCompany);
          showToast('success', 'Dashboard Account Provisioned!', `Welcome ${signupFullName} of ${signupCompany}! Enjoy Solar AI integrations.`);
        }
      } else {
        throw new Error("Firebase SDK was not fully compiled. Try refreshing.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      let localizedError = error.message;
      if (error.code === 'auth/email-already-in-use') {
        localizedError = 'This email account is already registered here. Try Logging in instead.';
      }
      showToast('error', 'Signup Interrupted', localizedError);
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE SIGN-IN OAUTH
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      if (window.firebase) {
        const provider = new window.firebase.auth.GoogleAuthProvider();
        
        // Graceful iframe blocker validation
        try {
          const result = await window.firebase.auth().signInWithPopup(provider);
          if (result.user) {
            showToast('success', 'Google Authenticated', `Welcome, ${result.user.displayName || 'Solar Pioneer'}! Connected with Google.`);
          }
        } catch (popupError: any) {
          console.warn("Popup blocked/failed, attempting redirect flow instead", popupError);
          // Standard backup login simulation if browser blocklists popups inside standard workspace sandbox
          if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/cancelled-popup-request' || popupError.message.includes('permission_denied')) {
            showToast('info', 'Secure Iframe Tunnel active', 'Popup authentication was blocked by browser sandbox. Simulating secure dev login credentials...');
            
            // Generate a premium simulated account for fluid demonstration
            setTimeout(() => {
              const mockUser = {
                uid: 'google_oauth_mock_id',
                displayName: signupFullName || 'Solar Expert',
                email: signupEmail || 'pioneer@solar-agency.ai',
                photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80',
              };
              setUser(mockUser);
              localStorage.setItem(`user_company_${mockUser.uid}`, signupCompany || "Solar Growth Co.");
              showToast('success', 'Sandbox Simulation Complete', 'Entering the high-converting Solar CRM and WhatsApp Playground.');
              setLoading(false);
            }, 1200);
          } else {
            throw popupError;
          }
        }
      } else {
        throw new Error("SDK loading is pending, retry in 2 seconds.");
      }
    } catch (error: any) {
      console.error("OAuth error:", error);
      showToast('error', 'Google Auth Error', error.message);
      setLoading(false);
    }
  };

  // SIGN OUT
  const handleSignOut = async () => {
    setLoading(true);
    try {
      if (window.firebase) {
        await window.firebase.auth().signOut();
      }
      setUser(null);
      showToast('info', 'Logged Out Successfully', 'Your secure session has been terminated. See you soon!');
    } catch (error: any) {
      showToast('error', 'Logout Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // DEMO SIMULATION ENGINE FOR THE SOLAR WHATSAPP AI SAAS
  const handleSendToWhatsAppSimulator = () => {
    if (!sandboxCustomerMsg.trim()) {
      showToast('error', 'Empty Message', 'Write a sample customer inquiry first.');
      return;
    }

    setIsAiGenerating(true);
    setSandboxAiProposal("");
    
    // Simulate smart solar calculations based on text input
    let targetBill = 350;
    const matchBill = sandboxCustomerMsg.match(/\$(\d+)/);
    if (matchBill && matchBill[1]) {
      targetBill = parseInt(matchBill[1]);
    } else {
      const matchNumOnly = sandboxCustomerMsg.match(/(\d+)\s*(dollars|bucks|month)/i);
      if (matchNumOnly && matchNumOnly[1]) targetBill = parseInt(matchNumOnly[1]);
    }

    let roofAreaSqFt = 2000;
    const matchRoof = sandboxCustomerMsg.match(/(\d+[,.]?\d*)\s*(sq|square|feet|ft)/i);
    if (matchRoof && matchRoof[1]) {
      roofAreaSqFt = parseInt(matchRoof[1].replace(/[,.]/g, ''));
    }

    setTimeout(() => {
      // Calculate realistic solar panel metrics
      // 1 kW solar typical serves roughly 75-100 sqft of roof, costing about $2800 before tax credits.
      const recommendedKw = Math.min(Math.ceil(targetBill / 25), Math.ceil(roofAreaSqFt / 90));
      const panelCount = Math.ceil((recommendedKw * 1000) / 400);
      const grossCost = recommendedKw * 2850;
      const netTaxCredit = Math.round(grossCost * 0.7); // 30% FTC Tax Credit
      const monthlySavings = Math.round(targetBill * 0.92);
      const paybackYears = parseFloat((grossCost / (monthlySavings * 12)).toFixed(1));

      const generatedProposal = `☀️ *SOLAR WHATSAPP AI AUTOPILOT* ☀️
----------------------------------
🏢 *SaaS Prospect:* Lead from WhatsApp Inbox
🌱 *Solar System Recommendation:*
• Recommended: *${recommendedKw} kW DC Array*
• Specs: *${panelCount}x 400W Monocrystalline Panels*
• Roof Utilization: ~*${panelCount * 21} sq ft*

💲 *Financial Feasibility Blueprint:*
• Gross Investment: *$${grossCost.toLocaleString()}*
• 30% Federal ITC: *-$${Math.round(grossCost * 0.3).toLocaleString()}*
• Net System Cost: *$${netTaxCredit.toLocaleString()}*
• Estimated Monthly Savings: *$${monthlySavings}/month*
• System Payback Period: *${paybackYears} Years*

🔄 *Carbon Mitigation Impact:*
• Equivalent to planting *142 mature pine trees*
• Avoids *8.4 Metric Tons* of CO2 per year.

💬 _Reply 'YES' to automatically book an engineer consultation or 'CALCULATE' to adjust roof dimensions._`;

      setSandboxAiProposal(generatedProposal);
      setIsAiGenerating(false);
      showToast('success', 'AI Proposal Generated', 'The solar assessment proposal has been sent to the simulation inbox!');

      // Add as a new live Lead to the CRM
      const newLead: SolarLead = {
        id: `lead_${Date.now()}`,
        name: user?.displayName || "Simulated Visitor",
        companyName: localStorage.getItem(`user_company_${user?.uid}`) || "Solar Venture Enterprise",
        email: user?.email || "sandbox-tester@solar-saas.com",
        monthlyBill: targetBill,
        roofArea: roofAreaSqFt,
        sunHours: 5.4,
        aiAnalysisStatus: 'Optimized',
        aiProposalText: generatedProposal,
        timestamp: "Just Now"
      };

      saveLeadsToStorage([newLead, ...leads]);
    }, 2000);
  };

  const getCompany = () => {
    if (!user) return "";
    return localStorage.getItem(`user_company_${user.uid}`) || "Solar Global Network";
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans relative overflow-x-hidden bg-[#020617]">
      
      {/* Dynamic Cosmic Background Lights */}
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Grid Pattern overlay for depth and SaaS atmosphere */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>

      {/* Toasts Stack Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 w-full max-w-md pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl flex items-start gap-3 transform transition-all duration-300 slide-in-right ${
              toast.type === 'success' ? 'toast-success border border-[#10B981]/30 text-emerald-300' :
              toast.type === 'error' ? 'toast-error border border-red-500/30 text-red-300' : 
              'border border-yellow-500/30 text-yellow-300 bg-yellow-500/5'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 mt-0.5 shrink-0 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 mt-0.5 shrink-0 text-yellow-500" />}
            
            <div className="flex-1">
              {toast.title && <h4 className="font-semibold text-sm mb-0.5">{toast.title}</h4>}
              <p className="text-xs opacity-90 leading-relaxed">{toast.message}</p>
            </div>
            
            <button 
              id={`close-toast-${toast.id}`}
              onClick={() => removeToast(toast.id)} 
              className="text-slate-400 hover:text-white transition-colors duration-200 shrink-0 text-xs font-semibold px-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {loading && !user ? (
        <div id="global-loader" className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center z-50">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-[#FBBF24] animate-spin"></div>
            <Sun className="w-8 h-8 text-[#FBBF24] absolute top-4 left-4 animate-pulse" />
          </div>
          <p className="mt-6 text-sm tracking-widest text-slate-400 font-display uppercase">Booting Solar SaaS Workspace...</p>
        </div>
      ) : null}

      {/* Main Core Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 min-h-screen flex flex-col justify-between py-6">
        
        {/* Navigation / Header */}
        <header id="saas-header" className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] p-2 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              <Sun className="w-full h-full text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                HELIOS AI
              </span>
              <span className="ml-1.5 px-2 py-0.5 bg-[#FBBF24]/10 rounded text-[10px] uppercase font-bold text-[#FBBF24] tracking-wider border border-[#FBBF24]/20">
                SaaS Portal
              </span>
            </div>
          </div>

          <div id="socials-nav" className="flex items-center gap-4">
            <a 
              href="https://wa.me/" 
              target="_blank" 
              rel="noreferrer" 
              className="text-slate-400 hover:text-emerald-400 text-xs flex items-center gap-1.5 transition-colors duration-200"
            >
              <i className="fab fa-whatsapp text-sm"></i>
              <span className="hidden sm:inline">WhatsApp Autopilot active</span>
            </a>
            
            {user && (
              <button
                id="signout-header-btn"
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-white/10 hover:border-red-500/20 text-xs font-semibold flex items-center gap-2 transition-all duration-300 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Views: Portal vs Dashboard Grid */}
        {!user ? (
          
          /* LOGIN & SIGNUP PORTAL SCREEN */
          <main className="flex-1 my-12 flex flex-col lg:flex-row items-center justify-center gap-16">
            
            {/* Left Side: SaaS Marketing Pitch Box */}
            <div id="saas-hero-pitch" className="lg:w-1/2 max-w-lg space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-xs font-semibold text-[#FBBF24] floating-icon">
                <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>Generative AI for Solar Contractors & Developers</span>
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                The Solar Sales <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 font-extrabold">Accelerator</span>
              </h1>
              
              <p className="text-slate-400 text-lg leading-relaxed">
                Automate lead qualification, technical audits, and CRM updates directly through WhatsApp. Deploy localized AI text responders for instant roof pricing models.
              </p>

              {/* Unique Status Badges from Artistic Flair HTML */}
              <div className="flex space-x-4 pt-2 justify-center lg:justify-start">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">4.9k+ Active Agents</span>
                </div>
                <div className="flex items-center space-x-2 border-l border-slate-800 pl-4">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Tier 1 Integrations</span>
                </div>
              </div>

              {/* Core Feature bullet points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-sm text-slate-200">2.4s AI Proposal</h4>
                    <p className="text-xs text-slate-400">Instantly emailed and texted</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-[#FBBF24]/10 text-[#FBBF24] flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-sm text-slate-200">30% ITC Credits</h4>
                    <p className="text-xs text-slate-400">Auto-calculated discounts</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <i className="fab fa-whatsapp"></i>
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-sm text-slate-200">WhatsApp Engine</h4>
                    <p className="text-xs text-slate-400">Standard lead automation</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <i className="fas fa-network-wired"></i>
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-sm text-slate-200">Helios AI CRM</h4>
                    <p className="text-xs text-slate-400">Drag & drop project milestones</p>
                  </div>
                </div>
              </div>

              {/* Quick Customer Testimonial */}
              <div className="border-l-2 border-[#FBBF24] pl-4 italic text-xs text-slate-400">
                "We closed $42,000 in residential solar arrays within our first 7 days of letting Helios handle incoming WhatsApp messages."
                <span className="block mt-1 font-semibold not-italic text-slate-300">— Marcus Vance, Vanguard Solar LLC</span>
              </div>
            </div>

            {/* Right Side: Elegant Glassmorphic Portal Form */}
            <div id="auth-portal-card" className="w-full lg:w-1/2 max-w-md">
              <div className="glass-panel-heavy rounded-2xl overflow-hidden shadow-2xl relative">
                
                {/* Form header glow line */}
                <div className="h-1 bg-gradient-to-r from-amber-500 via-[#FBBF24] to-yellow-300"></div>
                
                <div className="p-8">
                  {/* Form Mode Tabs for visual ease */}
                  <div className="flex bg-slate-950/60 p-1.5 rounded-xl border border-white/5 mb-8">
                    <button
                      id="tab-login"
                      onClick={() => setIsLoginView(true)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                        isLoginView 
                          ? 'bg-gradient-to-r from-amber-500 to-[#FBBF24] text-slate-950 shadow-lg font-extrabold' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <i className="fas fa-sign-in-alt mr-2"></i>Sign In
                    </button>
                    <button
                      id="tab-signup"
                      onClick={() => setIsLoginView(false)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                        !isLoginView 
                          ? 'bg-gradient-to-r from-amber-500 to-[#FBBF24] text-slate-950 shadow-lg font-extrabold' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <i className="fas fa-user-plus mr-2"></i>Sign Up
                    </button>
                  </div>

                  {/* Header text */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-display font-bold text-white tracking-tight">
                      {isLoginView ? 'Welcome Back Solar Pioneer' : 'Launch Your AI Sales Machine'}
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                      {isLoginView 
                        ? 'Unlock real-time lead feeds, customer solar models, and sales pipelines.' 
                        : 'Deploy localized AI text responders for instant roof pricing models.'}
                    </p>
                  </div>

                  {/* Google Authenticator Action Button */}
                  <button
                    id="btn-google-auth"
                    onClick={handleGoogleSignIn}
                    type="button"
                    className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-3 transition-all cursor-pointer group active:scale-[0.98] mb-6"
                  >
                    <svg className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative flex py-2 items-center mb-6">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-slate-500 text-[10px] uppercase font-bold tracking-widest">Or authenticate via email</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  {/* FORM SYSTEM SELECTORS */}
                  {isLoginView ? (
                    
                    /* LOGIN STATE VIEW */
                    <form id="form-login" onSubmit={handleEmailPasswordLogin} className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                            <Mail className="w-4 h-4" />
                          </span>
                          <input
                            id="login-email"
                            type="email"
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-200 glass-input"
                            placeholder="marcus@vanguardsolar.ai"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-300 text-xs font-bold uppercase tracking-wider">Password</label>
                          <a href="#reset" onClick={() => showToast('info', 'Password Reset Link', 'Enter your email above, and click forgot password. (Feature simulated)')} className="text-[#FBBF24] hover:text-amber-300 text-[10px] font-bold transition-all duration-200">Forgot Password?</a>
                        </div>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                            <Lock className="w-4 h-4" />
                          </span>
                          <input
                            id="login-password"
                            type="password"
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-200 glass-input"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <button
                        id="btn-login-submit"
                        type="submit"
                        className="w-full bg-[#FBBF24] hover:bg-amber-300 text-slate-900 font-bold py-4 rounded-xl shadow-[0_10px_20px_rgba(251,191,36,0.2)] transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-6 uppercase tracking-wider text-sm font-display"
                      >
                        <span>Access AI Workspace</span>
                        <ArrowRight className="w-4 h-4 stroke-[3px]" />
                      </button>
                    </form>

                  ) : (
                    
                    /* SIGNUP STATE VIEW */
                    <form id="form-signup" onSubmit={handleEmailPasswordSignup} className="space-y-4">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider">Full Name</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                              <User className="w-3.5 h-3.5" />
                            </span>
                            <input
                              id="signup-name"
                              type="text"
                              className="w-full pl-9 pr-3 py-3 rounded-xl text-xs text-slate-200 glass-input"
                              placeholder="Marcus Vance"
                              value={signupFullName}
                              onChange={(e) => setSignupFullName(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider">Solar Company</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                              <Building className="w-3.5 h-3.5" />
                            </span>
                            <input
                              id="signup-company"
                              type="text"
                              className="w-full pl-9 pr-3 py-3 rounded-xl text-xs text-slate-200 glass-input"
                              placeholder="Vanguard Solar LLC"
                              value={signupCompany}
                              onChange={(e) => setSignupCompany(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider">Email Address</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                            <Mail className="w-4 h-4" />
                          </span>
                          <input
                            id="signup-email"
                            type="email"
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-200 glass-input"
                            placeholder="marcus@vanguardsolar.ai"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider">Password</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                            <input
                              id="signup-password"
                              type="password"
                              className="w-full pl-9 pr-3 py-3 rounded-xl text-xs text-slate-200 glass-input"
                              placeholder="••••••••"
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider">Confirm</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                            <input
                              id="signup-confirm"
                              type="password"
                              className="w-full pl-9 pr-3 py-3 rounded-xl text-xs text-slate-200 glass-input"
                              placeholder="••••••••"
                              value={signupConfirmPassword}
                              onChange={(e) => setSignupConfirmPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 pt-1">
                        <input
                          type="checkbox"
                          id="terms-check"
                          className="mt-1 accent-[#FBBF24] rounded cursor-pointer"
                          defaultChecked
                          required
                        />
                        <label htmlFor="terms-check" className="text-[11px] text-slate-400 select-none cursor-pointer leading-relaxed">
                          I agree to standard terms, and confirm our solar company is licensed for utility or rooftop system construction.
                        </label>
                      </div>

                      <button
                        id="btn-signup-submit"
                        type="submit"
                        className="w-full bg-[#FBBF24] hover:bg-amber-300 text-slate-900 font-bold py-4 rounded-xl shadow-[0_10px_20px_rgba(251,191,36,0.2)] transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-4 uppercase tracking-wider text-sm font-display"
                      >
                        <span>Deploy AI Agent</span>
                        <ArrowRight className="w-4 h-4 stroke-[3px]" />
                      </button>
                    </form>
                  )}

                  <div className="mt-6 text-center">
                    <p className="text-slate-400 text-xs">
                      {isLoginView ? "Don't have an agency portal yet?" : "Already have your system configured?"}{' '}
                      <button
                        id="toggle-auth-link"
                        onClick={() => setIsLoginView(!isLoginView)}
                        className="text-[#FBBF24] hover:text-amber-300 font-semibold underline underline-offset-4 cursor-pointer transition-colors duration-200 ml-1"
                      >
                        {isLoginView ? 'Register Here (30s Free Trail)' : 'Sign In Back'}
                      </button>
                    </p>
                  </div>

                  {/* Dev Sandbox quick helper */}
                  <div className="mt-8 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex gap-3 text-[11px] text-amber-400">
                    <Info className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase tracking-wider block mb-0.5">DEV TESTING ENVIRONMENT</span>
                      You may also click "Continue with Google" directly! Our platform handles popup constraints seamlessly by deploying customized sandbox environments.
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </main>

        ) : (
          
          /* PREMIUM LOGGED IN PORTAL WORKSPACE (WHATSAPP SANDBOX & CRM DASHBOARD) */
          <main className="flex-1 my-8 space-y-8">
            
            {/* Top Workspace Bar */}
            <div id="workspace-greeting-card" className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#FBBF24]/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Live Active AI Autopilot Node</p>
                </div>
                
                <h2 className="text-3xl font-display font-extrabold tracking-tight text-white">
                  Welcome to Helios CRM, <span className="bg-gradient-to-r from-[#FBBF24] to-yellow-400 bg-clip-text text-transparent">{user.displayName || 'Solar Genius'}</span>
                </h2>
                
                <p className="text-slate-400 text-xs">
                  Your solar agency <span className="text-[#FBBF24] font-semibold">{getCompany()}</span> is linked. Monitor real-time prospect chat bubbles below.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 bg-slate-900/60 rounded-xl border border-white/5 text-center">
                  <p className="text-[9px] text-slate-500 uppercase font-extrabold tracking-widest">Active Leads</p>
                  <p className="text-lg font-bold text-slate-100 font-display">{leads.length}</p>
                </div>

                <div className="px-4 py-2 bg-slate-900/60 rounded-xl border border-white/5 text-center">
                  <p className="text-[9px] text-slate-500 uppercase font-extrabold tracking-widest">AI Conversions</p>
                  <p className="text-lg font-bold text-emerald-400 font-display">
                    {leads.filter(l => l.aiAnalysisStatus === 'Optimized').length}
                  </p>
                </div>

                <button
                  id="btn-trigger-invite"
                  onClick={() => showToast('success', 'API URL Generated', 'WhatsApp QR integration payload ready in console!')}
                  className="px-4 py-2.5 rounded-xl bg-[#FBBF24] text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all duration-300 flex items-center gap-2 shadow-[0_4px_15px_rgba(251,191,36,0.2)] cursor-pointer"
                >
                  <i className="fab fa-whatsapp"></i>
                  <span>Install WA Bot</span>
                </button>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* WhatsApp AI Auto-Proposal Simulator (Sandbox) */}
              <div id="wa-sandbox-panel" className="lg:col-span-7 glass-panel rounded-2xl overflow-hidden shadow-xl border border-white/5">
                
                <div className="p-5 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <i className="fab fa-whatsapp text-lg"></i>
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-100">WhatsApp Lead Simulation Sandbox</h3>
                      <p className="text-[10px] text-slate-400">Inbound trigger testing playground</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold uppercase tracking-widest animate-pulse">Running Simulation</span>
                </div>

                <div className="p-6 space-y-5">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Test how the AI Engine interceptor processes standard homeowner solar requests. Customize the text below incorporating various monthly electricity bills and roof dimensions, then evaluate the proposal instantly dispatched.
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-300 text-[10px] font-bold uppercase tracking-wider">Inbound Customer Message</label>
                      <button 
                        id="btn-quick-sample"
                        onClick={() => {
                          setSandboxCustomerMsg("Hey, we are spending $680/month for our industrial dry clean shop. The flat concrete roof is about 8000 square feet. Can you build an AI solar system cost estimation?");
                          showToast('info', 'Sample Inbound Picked', 'Custom industrial values placed. Run calculations!');
                        }}
                        className="text-amber-400 hover:text-amber-500 text-[10px] font-bold transition-all duration-200 cursor-pointer"
                      >
                        ⚡ Pick Commercial Sample
                      </button>
                    </div>
                    
                    <div className="relative">
                      <textarea
                        id="sandbox-text-input"
                        className="w-full p-4 rounded-xl text-xs text-slate-200 glass-input min-h-[100px] leading-relaxed resize-y focus:outline-none"
                        value={sandboxCustomerMsg}
                        onChange={(e) => setSandboxCustomerMsg(e.target.value)}
                        placeholder="Type customer solar request here..."
                      />
                      <div className="absolute bottom-2 right-2 flex items-center gap-1">
                        <span className="text-[9px] text-slate-500">Auto-identifies roof size & bill</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      id="btn-simulate-ai"
                      onClick={handleSendToWhatsAppSimulator}
                      disabled={isAiGenerating}
                      className="flex-1 py-3 px-4 rounded-xl text-slate-950 bg-gradient-to-r from-[#FBBF24] to-yellow-300 font-extrabold text-xs shadow-[0_4px_15px_rgba(251,191,36,0.2)] hover:shadow-[0_4px_25px_rgba(251,191,36,0.4)] transition-all duration-300 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      {isAiGenerating ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></div>
                          <span>Running Helios Model...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch AI Proposal</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      id="btn-reset-sandbox"
                      onClick={() => {
                        setSandboxCustomerMsg("");
                        setSandboxAiProposal("");
                        showToast('info', 'Sandbox Reset', 'Text elements cleared.');
                      }}
                      className="py-3 px-4 rounded-xl bg-slate-900 border border-white/5 hover:bg-slate-850 text-slate-400 hover:text-slate-200 transition-all duration-200 text-xs font-semibold cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  {/* AI Autopilot Output Box */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-slate-300 text-[10px] font-bold uppercase tracking-wider">Outgoing WhatsApp Reply (Simulated API Output)</label>
                    <div id="ai-output-box" className="bg-[#050811] border border-white/5 rounded-xl p-4 min-h-[140px] relative overflow-hidden font-mono text-[11px] leading-relaxed select-all">
                      
                      {isAiGenerating && (
                        <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2">
                          <Sun className="w-5 h-5 text-[#FBBF24] animate-spin" />
                          <span className="text-[10px] text-amber-400 animate-pulse uppercase font-extrabold tracking-widest font-sans">Synthesizing Helion Engine Formulas</span>
                        </div>
                      )}

                      {!sandboxAiProposal && !isAiGenerating && (
                        <div className="h-28 flex flex-col items-center justify-center text-slate-500 font-sans">
                          <MessageSquare className="w-6 h-6 mb-2 opacity-50" />
                          <p>Ready to receive inbound text intercepts.</p>
                          <p className="text-[10px] text-slate-600 mt-1">Click top sample or type customized values directly.</p>
                        </div>
                      )}

                      {sandboxAiProposal && (
                        <pre className="text-yellow-400/90 whitespace-pre-wrap">{sandboxAiProposal}</pre>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Live Solar CRM Leads feed */}
              <div id="crm-leads-feed" className="lg:col-span-5 glass-panel rounded-2xl overflow-hidden shadow-xl border border-white/5">
                
                <div className="p-5 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#FBBF24]" />
                    <h3 className="font-display font-bold text-sm text-slate-100">AI CRM Pipelines</h3>
                  </div>
                  <span className="text-[9px] text-slate-400">Total Leads: {leads.length}</span>
                </div>

                <div className="p-5 space-y-4">
                  
                  {/* Lead generation manual override to verify capabilities */}
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">Launch Custom Offline Lead</span>
                      <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
                    </div>
                    
                    <button
                      id="btn-rapid-lead"
                      onClick={() => {
                        const randomNames = ["Cassandra Thorne", "Bruce Vance", "Sylvia Vance", "Dominic Reed", "Gemma Vance"];
                        const randomCompany = ["Thorne Microgrid", "Tesla Solar Direct", "Greenway Roofs", "Sunfinity Solar", "Vance Solar Builders"];
                        const pickedInd = Math.floor(Math.random() * randomNames.length);
                        
                        const fakeNewLead: SolarLead = {
                          id: `lead_${Date.now()}`,
                          name: randomNames[pickedInd],
                          companyName: randomCompany[pickedInd],
                          email: `${randomNames[pickedInd].toLowerCase().replace(' ', '')}@gmail.com`,
                          monthlyBill: Math.floor(Math.random() * 400) + 150,
                          roofArea: Math.floor(Math.random() * 3000) + 1200,
                          sunHours: 5.2,
                          aiAnalysisStatus: 'Pending',
                          timestamp: 'Just Added'
                        };
                        saveLeadsToStorage([fakeNewLead, ...leads]);
                        showToast('success', 'Lead Added to CRM Pipeline', `Created new prospect card for ${fakeNewLead.name}. Processing...`);
                      }}
                      className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-bold transition-all duration-200 cursor-pointer text-center"
                    >
                      + Inject Mock Prospect
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {leads.map((lead) => (
                      <div 
                        key={lead.id} 
                        id={`lead-card-${lead.id}`}
                        className="p-3 bg-[#0a0f1d] border border-white/5 rounded-xl hover:border-yellow-500/20 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-xs text-slate-100">{lead.name}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold">{lead.companyName}</p>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold ${
                            lead.aiAnalysisStatus === 'Optimized' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse'
                          }`}>
                            {lead.aiAnalysisStatus}
                          </span>
                        </div>

                        {/* Solar details */}
                        <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-white/5 text-[9px] text-slate-400">
                          <div>
                            <span className="block text-slate-500 uppercase font-black tracking-normal">Bill Estim.</span>
                            <span className="font-bold text-slate-200">${lead.monthlyBill}/mo</span>
                          </div>
                          <div>
                            <span className="block text-slate-500 uppercase font-black tracking-normal">Roof Area</span>
                            <span className="font-bold text-slate-200">{lead.roofArea} sq ft</span>
                          </div>
                          <div>
                            <span className="block text-slate-500 uppercase font-black tracking-normal">Inbound</span>
                            <span className="font-semibold text-slate-300">{lead.timestamp}</span>
                          </div>
                        </div>

                        {lead.aiProposalText && (
                          <div className="mt-2.5 p-2 bg-[#050811] border border-white/5 rounded text-[9px] text-slate-400 font-sans max-h-20 overflow-y-auto">
                            <span className="font-bold text-amber-400 block mb-0.5">Dispatched Proposal:</span>
                            <p className="whitespace-pre-line leading-relaxed">{lead.aiProposalText}</p>
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-end gap-2">
                          <button
                            id={`btn-delete-${lead.id}`}
                            onClick={() => {
                              const remain = leads.filter(l => l.id !== lead.id);
                              saveLeadsToStorage(remain);
                              showToast('info', 'Lead Archive Complete', 'CRM listing updated.');
                            }}
                            className="text-slate-500 hover:text-red-400 text-[9px] transition-colors duration-200 cursor-pointer"
                          >
                            Archive Lead
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

            </div>

          </main>
        )}

        {/* Footer Area */}
        <footer id="saas-footer" className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/5 text-[11px] text-slate-500 space-y-3 sm:space-y-0">
          <div>
            <p>© 2026 Helios AI Technologies Inc. All rights reserved.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="#privacy" onClick={() => showToast('info', 'Privacy Policy', 'The portal adheres strictly to industry and Firebase security protocols.')} className="hover:text-slate-300 transition-colors duration-200">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" onClick={() => showToast('info', 'Terms of Service', 'Helios SaaS provides AI tools on a software subscription model.')} className="hover:text-slate-300 transition-colors duration-200">Subscription Terms</a>
            <span>•</span>
            <div className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Firebase Node SLA 99.98%</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
