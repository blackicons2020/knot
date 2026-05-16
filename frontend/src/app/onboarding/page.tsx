"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Bot, Send, Sparkles, ShieldCheck, Heart, User, CheckCircle2, 
  MapPin, Brain, GraduationCap, Briefcase, Calendar, ArrowRight, Loader2
} from "lucide-react";

export default function Onboarding() {
  const [step, setStep] = useState(1); // 1: Welcome, 2: Essentials Form, 3: AI Interview, 4: Processing, 5: Results Card
  
  // Essentials Form Fields
  const [name, setName] = useState("");
  const [age, setAge] = useState(25);
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [religion, setReligion] = useState("");
  const [occupation, setOccupation] = useState("");

  // AI Interview Conversation State
  const [messages, setMessages] = useState<Array<{ role: "ai" | "user"; text: string }>>([
    {
      role: "ai",
      text: "Welcome to KNOT. I am your AI Matchmaking Guide. I will explore your psychological profiles, attachment dynamics, and commitment objectives. Shall we begin?"
    }
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [interviewQuestionIndex, setInterviewQuestionIndex] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulated AI Interview Prompts
  const interviewPrompts = [
    "What kind of relationship are you hoping to build with a potential partner?",
    "What core values and priorities matter most in your life and future marriage?",
    "What does permanent commitment mean to you personally?",
    "How do you usually approach disagreements or conflict resolution in relationships?",
    "What are your core relationship non-negotiables?",
    "Would you be open to relocating for the right relationship?"
  ];

  // Extracted AI Archetype Results
  const [archetype, setArchetype] = useState({
    personalityArchetype: "The Intentional Builder",
    attachmentStyle: "Secure",
    readinessScore: 88,
    seriousnessLevel: 94,
    trustScore: 85,
    personalValues: ["Family Traditions", "Faith", "Mutual Growth"]
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    // Append user message
    const userMsg = currentInput;
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setCurrentInput("");

    // Simulate AI Guide evaluating and asking next question
    setTimeout(() => {
      if (interviewQuestionIndex < interviewPrompts.length) {
        setMessages(prev => [...prev, { 
          role: "ai", 
          text: `Thank you for sharing that. ${interviewPrompts[interviewQuestionIndex]}` 
        }]);
        setInterviewQuestionIndex(prev => prev + 1);
      } else {
        setMessages(prev => [...prev, { 
          role: "ai", 
          text: "Excellent. I have completed my relationship intelligence assessment. I will now analyze your values, personality alignment, and readiness indices. Shall we generate your Relationship Registry Certificate?" 
        }]);
      }
    }, 1000);
  };

  const handleProcessAIArchetype = () => {
    setStep(4); // Trigger Processing

    // Simulate psychological calculation
    setTimeout(() => {
      setStep(5); // Show results certificate
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0A0E14] text-white flex flex-col justify-between py-12 px-6">
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="text-xl font-serif font-black tracking-wider flex items-center gap-1">
          KNOT<span className="text-[#D4AF37]">.</span>
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
          Step {step} of 5
        </span>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto w-full my-auto py-12">
        
        {/* Step 1: Cinematic Welcome */}
        {step === 1 && (
          <div className="space-y-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-serif font-black">AI Guided Relationship Registry</h2>
              <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                Before entering KNOT, all members complete our AI Guided interview to establish personality vectors, attachment archetypes, and commitment integrity.
              </p>
            </div>
            <button 
              onClick={handleNextStep}
              className="px-8 py-4 rounded-full text-base font-black rose-glow-btn text-white w-full max-w-sm"
            >
              Begin Registry Setup
            </button>
          </div>
        )}

        {/* Step 2: Essentials Form */}
        {step === 2 && (
          <div className="glass-card rounded-[32px] p-8 border border-white/10 space-y-6">
            <h2 className="text-2xl font-serif font-black text-center">Identity Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name" 
                    className="w-full bg-[#121721] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Age</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="number" 
                      value={age} 
                      onChange={e => setAge(parseInt(e.target.value))}
                      className="w-full bg-[#121721] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Current Residence</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      value={location} 
                      onChange={e => setLocation(e.target.value)}
                      placeholder="City, Country" 
                      className="w-full bg-[#121721] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Occupation</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    value={occupation} 
                    onChange={e => setOccupation(e.target.value)}
                    placeholder="e.g. Software Engineer" 
                    className="w-full bg-[#121721] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@email.com" 
                  className="w-full bg-[#121721] border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                />
              </div>
            </div>

            <button 
              onClick={handleNextStep}
              disabled={!name || !email}
              className="w-full py-4 rounded-full text-sm font-black rose-glow-btn text-white disabled:opacity-40"
            >
              Continue to AI Interview
            </button>
          </div>
        )}

        {/* Step 3: Conversational AI Onboarding Interview */}
        {step === 3 && (
          <div className="glass-card rounded-[32px] border border-white/10 flex flex-col h-[500px] overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-[#121721]/90 border-b border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold">KNOT AI Matchmaking Guide</h4>
                <p className="text-[9px] uppercase tracking-wider text-[#D4AF37] font-bold">Interview Session Active</p>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((m, idx) => (
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
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-[#121721]/90 border-t border-white/5 flex items-center gap-2">
              <input 
                type="text" 
                value={currentInput}
                onChange={e => setCurrentInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                placeholder="Share your thoughts empathetically..."
                className="flex-1 bg-white/5 border border-white/5 rounded-full py-3 px-6 text-xs text-white focus:outline-none focus:border-[#D4AF37]/50"
              />
              {interviewQuestionIndex > interviewPrompts.length && currentInput === "" ? (
                <button 
                  onClick={handleProcessAIArchetype}
                  className="px-5 py-3 rounded-full text-xs font-black rose-glow-btn text-white flex items-center gap-1.5"
                >
                  Analyze <Sparkles className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button 
                  onClick={handleSendMessage}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Simulated AI Analysis */}
        {step === 4 && (
          <div className="space-y-6 text-center py-12">
            <div className="relative w-20 h-20 mx-auto">
              <Loader2 className="w-20 h-20 text-[#D4AF37] animate-spin opacity-40" />
              <Brain className="w-10 h-10 text-[#D4AF37] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Evaluating Relationship Vector</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest animate-pulse">Running attachment style cosine calculations...</p>
            </div>
          </div>
        )}

        {/* Step 5: Cinematic AI Relationship Certificate Reveal */}
        {step === 5 && (
          <div className="space-y-8 animate-fade-in">
            <div className="glass-card rounded-[36px] p-8 border border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/5 relative overflow-hidden max-w-md mx-auto">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="text-center space-y-4 mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full trust-badge text-[10px] font-black tracking-widest uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Registry Certificate
                </div>
                <h3 className="text-2xl font-serif font-black text-white">{name}</h3>
                <p className="text-xs text-gray-400">{location} • Active Member</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">Archetype</span>
                  <span className="text-xs text-[#D4AF37] font-black">{archetype.personalityArchetype}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">Attachment Style</span>
                  <span className="text-xs text-white font-bold">{archetype.attachmentStyle}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-white/5 text-center">
                  <div className="p-2 rounded-xl bg-white/5">
                    <div className="text-[9px] text-gray-500 uppercase font-black">Readiness</div>
                    <div className="text-sm font-black text-white">{archetype.readinessScore}%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <div className="text-[9px] text-gray-500 uppercase font-black">Seriousness</div>
                    <div className="text-sm font-black text-[#D4AF37]">{archetype.seriousnessLevel}%</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5">
                    <div className="text-[9px] text-gray-500 uppercase font-black">Trust Score</div>
                    <div className="text-sm font-black text-[#10B981]">{archetype.trustScore}%</div>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-gray-500 font-black block mb-2">Extracted Value Maps</label>
                  <div className="flex flex-wrap gap-1.5">
                    {archetype.personalValues.map((val, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] text-gray-300 font-semibold">
                        ✔ {val}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-black rose-glow-btn text-white text-center w-full max-w-xs"
              >
                Activate Dashboard <ArrowRight className="w-4.5 h-4.5" />
              </Link>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="text-center text-[10px] text-gray-600 uppercase tracking-widest">
        Secured Relationship Encryption • KNOT Platform
      </footer>
    </div>
  );
}
