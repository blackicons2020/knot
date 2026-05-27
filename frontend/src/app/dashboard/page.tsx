"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, ShieldCheck, Heart, User, Bot, MessageSquare, 
  Settings, LogOut, Send, AlertTriangle, Shield, CheckCircle2,
  TrendingUp, Award, Activity, Compass, BrainCircuit, HeartHandshake,
  Menu, X, ArrowLeft, ChevronLeft, ChevronRight, Image as ImageIcon, Camera
} from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("matches"); // matches, insights, coach, messages, profile
  const [isPremium, setIsPremium] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>("m1");
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [connectedMatchName, setConnectedMatchName] = useState("");

  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('knot_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://knot-backend-core.onrender.com';
          
        // Fetch real profile
        const profileRes = await fetch(`${API_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserProfile(profileData);
        }

        // Fetch daily matches securely
        const matchesRes = await fetch(`${API_URL}/matches/daily`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const matchesData = await matchesRes.json();
        setMatches(Array.isArray(matchesData) ? matchesData : []);
      } catch (err) {
        console.error("Error fetching data", err);
        setMatches([]);
      } finally {
        setIsLoadingMatches(false);
      }
    };
    fetchData();
  }, [router]);

  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const activeMatch = matches[currentMatchIndex];
  const [activeMatchImageIndex, setActiveMatchImageIndex] = useState(0);

  // User Photos State
  const [userPhotos, setUserPhotos] = useState([
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&q=80"
  ]);
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState(0);

  // AI Coach State
  const [coachMessages, setCoachMessages] = useState([
    { role: "ai", text: "Hello! I am your KNOT Relationship Coach. Ask me anything about attachment styles, conflict resolution, or first-date suggestions." }
  ]);
  const [coachInput, setCoachInput] = useState("");

  // Messaging State
  const [chatMessages, setChatMessages] = useState([
    { sender: "partner", text: "Hi! I really liked your thoughts on long-term commitment. How was your weekend?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiChatTip, setAiChatTip] = useState(
    "AI Message Assistant: You both value travel and family traditions. Ask about her favorite childhood memory."
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === "coach" || activeTab === "messages") {
        scrollToBottom();
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [coachMessages, chatMessages, activeTab]);

  const handleSendCoachMessage = async () => {
    if (!coachInput.trim()) return;
    
    const userQ = coachInput;
    const updatedMessages = [...coachMessages, { role: "user", text: userQ }];
    setCoachMessages(updatedMessages);
    setCoachInput("");

    // Optional: Set a typing state if desired, here we just await fetch
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/ai/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationHistory: updatedMessages.slice(0, -1),
          userProfile: { 
            firstName: userProfile?.firstName || "Web", 
            lastName: userProfile?.lastName || "User", 
            dateOfBirth: userProfile?.dateOfBirth || "1990-01-01", 
            bio: "Seeking a serious partner." 
          },
          currentMessage: userQ,
        })
      });
      const data = await res.json();
      if (data.response) {
        setCoachMessages(prev => [...prev, { role: "ai", text: data.response }]);
      } else {
        throw new Error("No response");
      }
    } catch (e) {
      setCoachMessages(prev => [...prev, { role: "ai", text: "I'm having a little trouble connecting with my insights right now." }]);
    }
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: "me", text: chatInput }]);
    setChatInput("");
    setAiChatTip(""); // Remove tip once sent

    setTimeout(() => {
      const sophiaResponses = [
        "That sounds wonderful! I actually think communication is key. We should talk more about our goals.",
        "Oh, I completely agree with you on that. It's so refreshing to hear.",
        "Haha, that's exactly what I was thinking! Tell me more.",
        "I've never looked at it that way before, but it makes perfect sense.",
        "That's so interesting. What made you feel that way?",
        "I love that we're on the same page. Alignment is really important to me."
      ];
      const randomResponse = sophiaResponses[Math.floor(Math.random() * sophiaResponses.length)];

      setChatMessages(prev => [...prev, { sender: "partner", text: randomResponse }]);
      setAiChatTip(`AI Message Assistant: ${activeMatch?.partner?.firstName || "Your match"} is highly engaged. Keep the conversation flowing naturally.`);
    }, 1500);
  };

  const handlePass = () => {
    if (currentMatchIndex < matches.length - 1) {
      setCurrentMatchIndex(prev => prev + 1);
      setActiveMatchImageIndex(0);
    } else {
      alert("You have reviewed all daily matches. More matches will be curated for you tomorrow!");
    }
  };

  const handleConnect = () => {
    setActiveTab("matchProfile");
  };

  const handlePaystackCheckout = () => {
    const paystack = (window as any).PaystackPop;
    if (!paystack) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => {
        const loadedPaystack = (window as any).PaystackPop;
        if (loadedPaystack) {
          triggerPaystackPopup(loadedPaystack);
        } else {
          alert("Error: Paystack payment gateway could not be loaded. Please disable any active adblockers and try again.");
        }
      };
      script.onerror = () => {
        alert("Error: Connection to secure payment gateway failed. Please check your internet connection.");
      };
      document.body.appendChild(script);
    } else {
      triggerPaystackPopup(paystack);
    }
  };

  const triggerPaystackPopup = (paystack: any) => {
    try {
      const handler = paystack.setup({
        key: "pk_live_b2c985a001f4c23b6bd1a19af4193f57c901446c",
        email: "gabriel@knot.com",
        amount: 250000,
        currency: "NGN",
        ref: "KNOT-WEB-" + Date.now(),
        callback: function(response: any) {
          console.log("Paystack payment successful! Reference:", response.reference);
          // Run async logic inside a standard function to prevent Paystack type-check errors
          (async () => {
            try {
              const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/payments/verify`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  reference: response.reference,
                  userId: "c8b74c0b-426b-4e14-9b2f-768a1d2e3c4d",
                  months: 1,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData && verifyData.success) {
                setIsPremium(true);
                alert("🌟 Premium Registry Activated!\n\nWelcome to Premium Alignment. You now have unlimited access to matches, advanced compatibility analysis, and our 24/7 AI Relationship Coach.");
              } else {
                alert("Verification Pending: Payment is being processed. Please refresh your profile in a few moments.");
              }
            } catch (err) {
              console.error("Verification error:", err);
              alert("Verification Connection Issue: Your payment was successful, but we couldn't connect to the verification server. Our webhook will automatically verify and upgrade your profile shortly.");
            }
          })();
        },
        onClose: () => {
          console.log("Checkout closed.");
        }
      });
      handler.openIframe();
    } catch (err) {
      console.error("Paystack popup error:", err);
      alert("Error: Secure payment setup failed. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0E14] text-white overflow-hidden">
      
      {/* Sidebar Backdrop for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#121721] border-r border-white/5 flex flex-col justify-between p-6 transition-transform duration-300 md:static md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsSidebarOpen(false)}>
              <span className="text-2xl font-serif font-black tracking-wider text-[#F5F5F1] flex items-center gap-1">
                KNOT<span className="text-[#D4AF37]">.</span>
              </span>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 text-gray-400 hover:text-white md:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => { setActiveTab("matches"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === "matches" ? "bg-[#2D1B4E] text-[#D4AF37] border-l-2 border-[#D4AF37]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            >
              <Compass className="w-4 h-4" /> Daily Matches
            </button>
            <button 
              onClick={() => { setActiveTab("insights"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === "insights" ? "bg-[#2D1B4E] text-[#D4AF37] border-l-2 border-[#D4AF37]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            >
              <BrainCircuit className="w-4 h-4" /> Insights Dashboard
            </button>
            <button 
              onClick={() => { setActiveTab("coach"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === "coach" ? "bg-[#2D1B4E] text-[#D4AF37] border-l-2 border-[#D4AF37]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            >
              <Bot className="w-4 h-4" /> AI Coach
            </button>
            <button 
              onClick={() => { setActiveTab("messages"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === "messages" ? "bg-[#2D1B4E] text-[#D4AF37] border-l-2 border-[#D4AF37]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            >
              <MessageSquare className="w-4 h-4" /> Messages
            </button>
            <button 
              onClick={() => { setActiveTab("profile"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === "profile" ? "bg-[#2D1B4E] text-[#D4AF37] border-l-2 border-[#D4AF37]" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            >
              <User className="w-4 h-4" /> My Profile
            </button>
            {userProfile?.role === 'ADMIN' && (
              <Link href="/admin" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-gray-400 hover:text-[#D4AF37] hover:bg-white/5 transition-all">
                <Shield className="w-4 h-4" /> Admin Panel
              </Link>
            )}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white leading-none">{userProfile?.firstName || "Gabriel"}</h5>
              <span className="text-[9px] text-[#10B981] font-bold">Base Trust 98%</span>
            </div>
          </div>
          <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/5 rounded-2xl transition-colors">
            <LogOut className="w-4 h-4" /> Log Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#0A0E14] relative overflow-y-auto flex flex-col">
        
        {/* Top Navbar */}
        <header className="h-16 md:h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-[#0A0E14]/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-400 hover:text-white md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-base md:text-xl font-serif font-black text-white capitalize truncate max-w-[180px] sm:max-w-none">
              {activeTab === "matches" && "Your AI Curated Match"}
              {activeTab === "insights" && "Relationship Intelligence Dashboard"}
              {activeTab === "coach" && "AI Relationship Counselor"}
              {activeTab === "messages" && "Secure Messenger"}
              {activeTab === "profile" && "My Identity Registry"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="trust-badge px-2.5 py-1.5 md:px-3.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider flex items-center gap-1 md:gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Biometric Identity Active</span>
              <span className="sm:hidden">Active</span>
            </div>
          </div>
        </header>

        {/* Tab Components */}
        <div className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full">

          {/* TAB 1: DAILY MATCHES */}
          {activeTab === "matches" && isLoadingMatches && (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Compass className="w-8 h-8 text-[#D4AF37] animate-spin" />
              <p className="text-sm text-gray-400">Curating your AI matches...</p>
            </div>
          )}
          {activeTab === "matches" && !isLoadingMatches && matches.length === 0 && (
            <div className="glass-card rounded-[32px] p-12 border border-white/10 text-center space-y-4 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mb-4">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">No matches found yet</h3>
              <p className="text-sm text-gray-400 max-w-md">Our AI matchmaking cron job curates new compatible partners every 24 hours. Check back soon for your personalized matches.</p>
            </div>
          )}
          {activeTab === "matches" && !isLoadingMatches && activeMatch && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Profile Card */}
              <div className="md:col-span-7 glass-card rounded-[32px] overflow-hidden border border-white/10 p-6 space-y-6">
                <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden">
                  <img src={activeMatch.imageUrls?.[0] || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"} alt={activeMatch.firstName} className="w-full h-full object-cover grayscale-[15%] brightness-95" />
                  
                  <div className="absolute top-8 right-4 trust-badge px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 z-10">
                    <ShieldCheck className="w-3.5 h-3.5" /> Trust {activeMatch.trustScore}%
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10">
                    <h3 className="text-2xl font-black text-white">{activeMatch.firstName} {activeMatch.lastName}, {activeMatch.dateOfBirth}</h3>
                    <p className="text-xs text-gray-400 font-semibold">{activeMatch.occupation} • {activeMatch.residenceCity}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-gray-300">✔ {activeMatch.archetype}</span>
                    <span className="px-3 py-1 rounded-full bg-[#2D1B4E]/30 border border-[#D4AF37]/20 text-xs text-[#D4AF37]">✔ {activeMatch.attachment} Attachment</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed font-sans">{activeMatch.bio}</p>
                </div>
              </div>

              {/* Match Details & AI Explanations */}
              <div className="md:col-span-5 space-y-6">
                <div className="glass-card rounded-[28px] p-6 border border-white/10 space-y-6">
                  <h4 className="text-xs uppercase tracking-widest text-[#D4AF37] font-black">Compatibility Profile</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-400">Values Alignment</span>
                        <span className="text-[#D4AF37]">95%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#D4AF37]" style={{ width: "95%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-400">Emotional Synergy</span>
                        <span className="text-[#E27D8D]">91%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#E27D8D]" style={{ width: "91%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-400">Communication Match</span>
                        <span className="text-white">88%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-white" style={{ width: "88%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Explanation Glow Box */}
                <div className="glass-card rounded-[28px] p-6 border border-[#D4AF37]/30 shadow-lg shadow-[#D4AF37]/5 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-[#D4AF37] font-black">
                    <Bot className="w-5 h-5 animate-pulse" /> Why You Matched
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    {activeMatch.aiExplanation}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button 
                    onClick={handlePass}
                    className="flex-1 py-4 rounded-full text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition-colors"
                  >
                    Pass
                  </button>
                  <button 
                    onClick={handleConnect}
                    className="flex-1 py-4 rounded-full text-sm font-black rose-glow-btn text-white flex items-center justify-center gap-1.5"
                  >
                    Connect <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MATCH PROFILE DETAIL */}
          {activeTab === "matchProfile" && activeMatch && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button 
                onClick={() => setActiveTab("matches")}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" /> Back to Curated Match
              </button>
              
              <div className="glass-card rounded-[32px] overflow-hidden border border-[#D4AF37]/30">
                <div className="relative h-[400px] md:h-[500px] group">
                  <img src={activeMatch.imageUrls?.[activeMatchImageIndex] || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"} alt={activeMatch.firstName} className="w-full h-full object-cover object-center transition-all duration-500" />
                  
                  {activeMatch.imageUrls?.length > 1 && (
                    <>
                      <button onClick={() => setActiveMatchImageIndex(prev => prev > 0 ? prev - 1 : activeMatch.imageUrls.length - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-20">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={() => setActiveMatchImageIndex(prev => prev < activeMatch.imageUrls.length - 1 ? prev + 1 : 0)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-20">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 px-8 z-10">
                        {activeMatch.imageUrls.map((_: any, i: number) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full ${i === activeMatchImageIndex ? 'bg-white shadow-lg shadow-white/50' : 'bg-white/30'}`} />
                        ))}
                      </div>
                    </>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-0" />
                  <div className="absolute bottom-0 left-0 p-8 z-10">
                    <h2 className="text-4xl font-black text-white">{activeMatch.firstName} {activeMatch.lastName}, {activeMatch.dateOfBirth}</h2>
                    <p className="text-gray-400 font-bold tracking-widest uppercase text-sm mt-2">{activeMatch.occupation} • {activeMatch.residenceCity}, {activeMatch.residenceCountry}</p>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300">Archetype: {activeMatch.archetype}</span>
                    <span className="px-4 py-2 rounded-full bg-[#2D1B4E]/30 border border-[#D4AF37]/20 text-xs font-bold text-[#D4AF37]">Attachment: {activeMatch.attachment}</span>
                    <span className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">Trust Score: {activeMatch.trustScore}%</span>
                    <span className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">Readiness: {activeMatch.readiness}%</span>
                  </div>

                  {/* Bio */}
                  <div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">About Me</h3>
                    <p className="text-gray-200 leading-relaxed font-serif text-lg italic">"{activeMatch.bio}"</p>
                  </div>

                  {/* ══ IDENTITY & ROOTS ══ */}
                  <div className="space-y-4 mt-8">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">Identity & Roots</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Marital Status</h4>
                        <p className="text-sm text-white font-medium">{activeMatch.maritalStatus || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Occupation</h4>
                        <p className="text-sm text-white font-medium">{activeMatch.occupation || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Current Residence</h4>
                        <p className="text-sm text-white font-medium">{activeMatch.residenceCity}, {activeMatch.residenceCountry}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Heritage & Origin</h4>
                        <p className="text-sm text-white font-medium">{activeMatch.originCity}, {activeMatch.originCountry}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Cultural Identity</h4>
                        <p className="text-sm text-white font-medium">{activeMatch.culturalBackground || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Nationality</h4>
                        <p className="text-sm text-white font-medium">{activeMatch.nationality || 'Not specified'}</p>
                      </div>
                      <div className="col-span-2 md:col-span-3">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Languages Spoken</h4>
                        <p className="text-sm text-white font-medium">{activeMatch.languagesSpoken?.join(', ') || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* ══ LIFESTYLE & BELIEFS ══ */}
                  <div className="space-y-4 mt-8">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">Lifestyle & Beliefs</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Faith / Religion</h4>
                        <p className="text-sm text-white font-medium">{activeMatch.religion || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Smoking</h4>
                        <p className="text-sm text-white font-medium">{activeMatch.smoking || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Drinking</h4>
                        <p className="text-sm text-white font-medium">{activeMatch.drinking || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Children</h4>
                        <p className="text-sm text-white font-medium">{activeMatch.childrenStatus || 'None'}</p>
                      </div>

                    </div>
                  </div>

                  {/* ══ MARRIAGE EXPECTATIONS ══ */}
                  <div className="space-y-4 mt-8">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">Marriage Expectations</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Vow Timeline</h4>
                        <p className="text-sm text-white font-medium">{activeMatch.marriageTimeline || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Relocation</h4>
                        <p className="text-sm text-white font-medium">{activeMatch.willingToRelocate || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Children Intent</h4>
                        <p className="text-sm text-white font-medium">{activeMatch.childrenPreference || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Partner Age</h4>
                        <p className="text-sm text-white font-medium">
                          {activeMatch.preferredPartnerAgeRange ? `${activeMatch.preferredPartnerAgeRange[0]} - ${activeMatch.preferredPartnerAgeRange[1]} years` : 'Not specified'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Ideal Partner Traits</h4>
                        <div className="flex flex-wrap gap-2">
                          {activeMatch.idealPartnerTraits?.map((t: string) => (
                            <span key={t} className="px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-xs font-bold text-[#D4AF37]">{t}</span>
                          )) || <p className="text-sm text-gray-500 italic">Not listed</p>}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Registry Expectations</h4>
                        <p className="text-sm text-white leading-relaxed">{activeMatch.marriageExpectations || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-6 border-t border-white/10 flex gap-4">
                    <button 
                      onClick={() => {
                        setActiveChatId(activeMatch.id);
                        setActiveTab("messages");
                      }}
                      className="flex-1 py-4 rounded-xl text-sm font-black rose-glow-btn text-white flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-5 h-5" /> Start Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSIGHTS DASHBOARD */}
          {activeTab === "insights" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-[24px] glass-card border border-[#D4AF37]/20 text-center space-y-2">
                  <Award className="w-8 h-8 text-[#D4AF37] mx-auto" />
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Readiness Index</div>
                  <div className="text-3xl font-serif font-black text-white">88%</div>
                  <span className="text-[9px] text-[#10B981] font-bold uppercase">Highly Marriage Ready</span>
                </div>
                <div className="p-6 rounded-[24px] glass-card border border-white/5 text-center space-y-2">
                  <TrendingUp className="w-8 h-8 text-white mx-auto" />
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Seriousness index</div>
                  <div className="text-3xl font-serif font-black text-white">94%</div>
                  <span className="text-[9px] text-gray-400 uppercase">Elite Intention Index</span>
                </div>
                <div className="p-6 rounded-[24px] glass-card border border-[#10B981]/20 text-center space-y-2">
                  <ShieldCheck className="w-8 h-8 text-[#10B981] mx-auto" />
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Safety trust</div>
                  <div className="text-3xl font-serif font-black text-white">98%</div>
                  <span className="text-[9px] text-[#10B981] font-bold uppercase">Authentic Signature</span>
                </div>
              </div>

              {/* Attachment styles */}
              <div className="glass-card rounded-[32px] p-8 border border-white/10 space-y-6">
                <h3 className="text-xl font-serif font-bold">Psychological Alignment Map</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-[#D4AF37]">Personality Archetype</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      You are registered as an **Intentional Builder**. You approach relationship milestones deliberately, prioritizing family values, structural boundaries, and joint growth curves.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-[#E27D8D]">Attachment Profile</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Your attachment is **Secure**. You comfortably express intimacy, manage boundaries with high collaborative intelligence, and recover from relationship friction smoothly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI RELATIONSHIP COACH */}
          {activeTab === "coach" && (
            <div className="glass-card rounded-[32px] border border-white/10 flex flex-col h-[550px] overflow-hidden">
              <div className="p-4 bg-[#121721]/90 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Counselor KNOT</h4>
                  <p className="text-[9px] uppercase tracking-wider text-[#D4AF37] font-bold">Active Coaching Session</p>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {coachMessages.map((m, idx) => (
                  <div key={idx} className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                    {m.role === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] text-xs font-bold flex-shrink-0">AI</div>
                    )}
                    <div className={`p-4 rounded-[22px] text-xs leading-relaxed max-w-[80%] ${
                      m.role === "user" 
                        ? "bg-[#E27D8D]/15 border border-[#E27D8D]/25 rounded-tr-none text-white"
                        : "bg-white/5 border border-white/5 rounded-tl-none text-gray-300"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-[#121721]/90 border-t border-white/5 flex items-center gap-2">
                <input 
                  type="text" 
                  value={coachInput}
                  onChange={e => setCoachInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendCoachMessage()}
                  placeholder="Ask for advice on attachment, relocation, timelines..."
                  className="flex-1 bg-white/5 border border-white/5 rounded-full py-3 px-6 text-xs text-white focus:outline-none focus:border-[#D4AF37]/50"
                />
                <button 
                  onClick={handleSendCoachMessage}
                  className="w-10 h-10 rounded-full bg-[#2D1B4E] flex items-center justify-center text-white hover:bg-[#D4AF37] hover:text-black transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MESSAGES */}
          {activeTab === "messages" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch h-[550px] md:h-[550px]">
              
              {/* Inbox Lists */}
              <div className={`md:col-span-4 glass-card rounded-[28px] border border-white/5 p-4 overflow-y-auto space-y-2 h-full ${activeChatId ? "hidden md:block" : "block"}`}>
                <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-2 mb-3">Chats</h4>
                <button 
                  onClick={() => setActiveChatId("m1")}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#2D1B4E]/30 border border-[#D4AF37]/20 text-left transition-all hover:bg-[#2D1B4E]/40"
                >
                  <img className="w-10 h-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" alt="" />
                  <div>
                    <h5 className="text-xs font-bold text-white">{activeMatch?.partner?.firstName || "Sophia"}</h5>
                    <p className="text-[10px] text-gray-400 truncate">How was your weekend?</p>
                  </div>
                </button>
              </div>

              {/* Chat View */}
              <div className={`md:col-span-8 glass-card rounded-[28px] border border-white/5 flex flex-col overflow-hidden h-full ${!activeChatId ? "hidden md:flex" : "flex"}`}>
                <div className="p-4 bg-[#121721]/90 border-b border-white/5 flex items-center gap-3">
                  <button 
                    onClick={() => setActiveChatId(null)}
                    className="p-2 -ml-2 text-gray-400 hover:text-white md:hidden"
                    aria-label="Back to chats"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <img className="w-8 h-8 rounded-full object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" alt="" />
                  <div>
                    <h5 className="text-xs font-bold text-white">{activeMatch?.partner?.firstName || "Match"}</h5>
                    <span className="text-[9px] text-[#10B981] font-bold">Verified Real Human</span>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {chatMessages.map((m, idx) => (
                    <div key={idx} className={`flex items-start gap-3 ${m.sender === "me" ? "justify-end" : ""}`}>
                      <div className={`p-4 rounded-[22px] text-xs leading-relaxed max-w-[80%] ${
                        m.sender === "me" 
                          ? "bg-[#2D1B4E] border border-white/10 rounded-tr-none text-white"
                          : "bg-white/5 border border-white/5 rounded-tl-none text-gray-300"
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* AI Safety/Prompt Indicator */}
                {aiChatTip && (
                  <div className="p-3 bg-[#D4AF37]/10 border-t border-[#D4AF37]/20 text-[10px] text-[#D4AF37] font-semibold flex items-center gap-2">
                    <Bot className="w-4 h-4 flex-shrink-0 animate-bounce" /> {aiChatTip}
                  </div>
                )}

                <div className="p-4 bg-[#121721]/90 border-t border-white/5 flex items-center gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSendChatMessage()}
                    placeholder="Type an emotionally authentic message..."
                    className="flex-1 bg-white/5 border border-white/5 rounded-full py-3 px-6 text-xs text-white focus:outline-none focus:border-[#D4AF37]/50"
                  />
                  <button 
                    onClick={handleSendChatMessage}
                    className="w-10 h-10 rounded-full bg-[#2D1B4E] flex items-center justify-center text-white"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MY PROFILE */}
          {activeTab === "profile" && (
            <div className="glass-card rounded-[32px] p-6 sm:p-8 border border-white/10 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-white/5">
                {/* Profile User Info & Edit Card */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4 flex flex-col justify-center">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
                    <div className="relative group w-20 h-20 flex-shrink-0">
                      <div className="w-20 h-20 rounded-full bg-[#2D1B4E] border border-white/10 flex items-center justify-center text-gray-300 text-3xl font-black overflow-hidden relative">
                        {userPhotos.length > 0 ? (
                          <img src={userPhotos[primaryPhotoIndex]} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          "G"
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const newPhotoUrl = URL.createObjectURL(e.target.files[0]);
                              const newPhotos = [...userPhotos];
                              newPhotos[primaryPhotoIndex] = newPhotoUrl;
                              setUserPhotos(newPhotos);
                            }
                          }} />
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider text-center">Update<br/>Photo</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{userProfile ? `${userProfile.firstName}, 29` : "Gabriel, 29"}</h3>
                      <p className="text-xs text-gray-400">{userProfile?.occupation || "Software Engineer"} • {userProfile?.residenceCity || "Boston"}, {userProfile?.residenceCountry || "MA"}</p>
                      <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#10B981]/25 border border-[#10B981]/30 text-[9px] font-black text-[#10B981] uppercase tracking-wider">Verified Registry Member</span>
                    </div>
                  </div>
                  <button className="w-full mt-2 py-2.5 rounded-xl bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                    <Settings className="w-3.5 h-3.5" /> Edit Profile Data
                  </button>
                </div>

                {/* Identity Verification */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3 flex flex-col justify-center">
                  <h4 className="text-xs text-gray-400 uppercase tracking-widest font-black mb-1">Identity Verification</h4>
                  <div className="flex items-center justify-between text-xs">
                    <span>Government ID Scan</span>
                    <span className="text-[#10B981] font-bold">Approved</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Liveness Selfie Match</span>
                    <span className="text-[#10B981] font-bold">Approved</span>
                  </div>
                  <div className="mt-3 p-2.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-[10px] text-[#10B981] font-black text-center uppercase tracking-wide">
                    Identity Verified
                  </div>
                </div>
              </div>

              {/* My Photos Section */}
              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs text-gray-400 uppercase tracking-widest font-black">My Photos</h4>
                  <span className="text-[10px] text-gray-500 font-bold">{userPhotos.length} / 6 Uploaded</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {userPhotos.map((photo, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                      <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === primaryPhotoIndex && (
                        <div className="absolute top-2 left-2 bg-[#D4AF37] px-2 py-0.5 rounded-md text-[8px] font-black uppercase text-black">
                          Primary
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">

                        <button onClick={() => {
                          const newPhotos = userPhotos.filter((_, i) => i !== idx);
                          setUserPhotos(newPhotos);
                          if (primaryPhotoIndex === idx) setPrimaryPhotoIndex(0);
                          else if (primaryPhotoIndex > idx) setPrimaryPhotoIndex(prev => prev - 1);
                        }} className="text-[9px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {userPhotos.length < 6 && (
                    <button className="aspect-square rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all">
                      <Camera className="w-6 h-6 text-gray-400" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Add Photo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Full Profile Detail Section */}
              <div className="pt-6 border-t border-white/5 space-y-8">
                {/* 1. Psychological Profile (Requested to keep) */}
                <div className="space-y-4">
                  <h4 className="text-xs text-gray-400 uppercase tracking-widest font-black">Psychological Profile</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-gray-300 font-medium">✔ The Intentional Builder</span>
                    <span className="px-3 py-1.5 rounded-full bg-[#2D1B4E]/30 border border-[#D4AF37]/20 text-xs text-[#D4AF37] font-medium">✔ Secure Attachment</span>
                  </div>
                </div>

                {/* 2. Identity & Roots */}
                <div className="space-y-4">
                  <h4 className="text-xs text-gray-400 uppercase tracking-widest font-black border-b border-white/5 pb-2">Identity & Roots</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Marriage History</div>
                      <div className="text-sm text-white font-bold">Never married</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Occupation</div>
                      <div className="text-sm text-white font-bold">Software Engineer</div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#121721] border border-white/10">
                    <h5 className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-black mb-3">Current Residence</h5>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div><div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Country</div><div className="text-sm text-white font-bold">USA</div></div>
                      <div><div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">State</div><div className="text-sm text-white font-bold">Massachusetts</div></div>
                      <div><div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">City</div><div className="text-sm text-white font-bold">Boston</div></div>
                    </div>
                    
                    <div className="h-px bg-white/5 my-4" />
                    
                    <h5 className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-black mb-3">Heritage & Origin</h5>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div><div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Country</div><div className="text-sm text-white font-bold">USA</div></div>
                      <div><div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">State</div><div className="text-sm text-white font-bold">New York</div></div>
                      <div><div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">City</div><div className="text-sm text-white font-bold">New York City</div></div>
                    </div>
                    
                    <div><div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Cultural Identity</div><div className="text-sm text-white font-bold">African-American</div></div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Registry Bio</div>
                    <div className="text-sm text-white leading-relaxed">Software engineer passionate about building a meaningful legacy. I value transparency, emotional availability, and structured growth. Looking for a partner who shares my vision for a stable, loving family and mutual continuous improvement.</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Nationality</div>
                      <div className="text-sm text-white font-bold">American</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Languages Spoken</div>
                      <div className="text-sm text-white font-bold">English, Spanish</div>
                    </div>
                  </div>
                </div>

                {/* 3. Lifestyle & Beliefs */}
                <div className="space-y-4">
                  <h4 className="text-xs text-gray-400 uppercase tracking-widest font-black border-b border-white/5 pb-2">Lifestyle & Beliefs</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Faith/Religion</div>
                      <div className="text-sm text-white font-bold">Christian</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Smoking</div>
                      <div className="text-sm text-white font-bold">Never</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Drinking</div>
                      <div className="text-sm text-white font-bold">Socially</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Children</div>
                      <div className="text-sm text-white font-bold">No kids</div>
                    </div>
                  </div>
                  

                </div>

                {/* 4. Marriage Expectations */}
                <div className="space-y-4">
                  <h4 className="text-xs text-gray-400 uppercase tracking-widest font-black border-b border-white/5 pb-2">Marriage Expectations</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Vow Timeline</div>
                      <div className="text-sm text-white font-bold">1-2 years</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Relocation</div>
                      <div className="text-sm text-white font-bold">Maybe</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Children Intent</div>
                      <div className="text-sm text-white font-bold">Wants children</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Partner Age</div>
                      <div className="text-sm text-white font-bold">25 - 30 years</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-2">Ideal Partner Traits</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider">Emotionally Available</span>
                      <span className="px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider">Loyal</span>
                      <span className="px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider">Driven</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Registry Expectations</div>
                    <div className="text-sm text-white leading-relaxed">Looking for someone who is ready to settle down, has done their emotional work, and is excited to build a legacy based on mutual respect and shared faith.</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Readiness</div>
                      <div className="text-sm text-[#10B981] font-bold">94% (Elite)</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Trust Score</div>
                      <div className="text-sm text-[#10B981] font-bold">98% (Verified)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Membership Subscription (Moved to Bottom) */}
              <div className="pt-6 border-t border-white/5">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <h4 className="text-xs text-gray-400 uppercase tracking-widest font-black mb-2">Membership Subscription</h4>
                  {isPremium ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Active Plan</span>
                        <span className="text-[#D4AF37] font-bold">Premium Alignment (Live)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Renews On</span>
                        <span className="text-gray-400">June 16, 2026</span>
                      </div>
                      <div className="mt-2 p-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[10px] text-[#D4AF37] font-black text-center uppercase tracking-wide">
                        🌟 Premium Membership Active
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span>Active Plan</span>
                        <span className="text-gray-400 font-bold">Base Member</span>
                      </div>
                      <button
                        onClick={handlePaystackCheckout}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-[#0A0E14] font-black text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" /> Upgrade to Premium
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Mutual Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-card rounded-[36px] max-w-sm w-full p-8 border border-[#D4AF37]/30 text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] animate-bounce">
              <Heart className="w-10 h-10 fill-current" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-black text-white">Mutual Match!</h3>
              <p className="text-xs text-gray-300 font-sans">
                Congratulations! You and <span className="text-[#D4AF37] font-bold">{connectedMatchName}</span> are mutually aligned and marriage ready.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Compatibility Score</div>
              <div className="text-3xl font-serif font-black text-[#D4AF37]">94%</div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setShowMatchModal(false);
                  setActiveTab("messages");
                }}
                className="w-full py-4 rounded-full text-xs font-black rose-glow-btn text-white"
              >
                Start Secure Conversation
              </button>
              <button 
                onClick={() => setShowMatchModal(false)}
                className="w-full py-3 rounded-full text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400"
              >
                Keep Exploring Matches
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
