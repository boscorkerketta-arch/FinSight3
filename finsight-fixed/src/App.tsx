/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SpendingModel, MonthRecord } from './lib/spendingModel';
import { 
  ChevronLeft, 
  Lock, 
  CheckCircle2, 
  MessageCircle, 
  Sparkles, 
  TrendingUp, 
  Wallet, 
  Clock,
  Home,
  CreditCard,
  User,
  Search,
  Smartphone,
  Tv,
  Zap,
  Train,
  Receipt,
  ArrowRight,
  Send,
  Plus,
  Utensils,
  Car,
  Lightbulb,
  ShoppingBag,
  Film,
  ChevronRight,
  BarChart3,
  Info,
  LineChart,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { format, addDays } from 'date-fns';
import { streamSaathi, AppState, ChatMessage } from '@/src/lib/saathi';

// Global Constants
const MOCK_SCORE = 612;
const MOCK_SCORE_BAND = "Good";
const MOCK_SCORE_DELTA = +8;
const MOCK_LADDER_RUNG = 2;
const MOCK_STREAK_DAYS = 9;

type Screen = "landing" | "onboarding" | "mockPaytm" | "calculating" 
            | "scoreReveal" | "dashboard" | "habitTracker" 
            | "insights" | "loanOffer";

// Screen Wrapper Component
const ScreenWrapper = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className={`fixed inset-0 flex flex-col overflow-hidden ${className}`}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

// Helper for Tailwind class merging (simple version)
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [history, setHistory] = useState<Screen[]>([]);
  const [dashboardTab, setDashboardTab] = useState<'spending' | 'credit'>('spending');

  const navigateTo = (newScreen: Screen, tab: 'spending' | 'credit' = 'spending') => {
    setHistory(prev => [...prev, screen]);
    setDashboardTab(tab);
    setScreen(newScreen);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prevScreen = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setScreen(prevScreen);
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case "landing":
        return (
          <ScreenWrapper 
            className="bg-[#00040D] items-center justify-center p-6 cursor-pointer"
            onClick={() => navigateTo("onboarding")}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              {/* Text Logo like the original version but with new styling */}
              <h1 className="text-7xl font-black tracking-tighter flex items-center">
                <span className="text-white">Fin</span>
                <span className="text-[#00d09c]">Sight</span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1, duration: 1 }}
                className="text-white mt-12 text-xs font-light tracking-[0.4em] uppercase"
              >
                Tap to continue
              </motion.p>
            </motion.div>
          </ScreenWrapper>
        );
      case "onboarding":
        return (
          <ScreenWrapper className="bg-slate-50">
            <header className="bg-[#00040D] text-white p-4 flex items-center gap-4">
              <button onClick={goBack}>
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-bold">What we'll look at</h2>
            </header>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Here's what we'll look at</h1>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { title: "UPI Transactions", text: "Your UPI payments from the last 90 days", icon: <TrendingUp className="text-[#00d09c]" /> },
                  { title: "Bill Payments", text: "Utility, telecom, OTT — regularity and timing", icon: <Receipt className="text-[#00d09c]" /> },
                  { title: "Wallet Balance", text: "Daily balance stability and floor tracking", icon: <Wallet className="text-[#00d09c]" /> },
                  { title: "Spending Patterns", text: "Category breakdown of your expenses", icon: <TrendingUp className="text-[#00d09c]" /> }
                ].map((item, i) => (
                  <div key={i} className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                    <div className="mb-2">{item.icon}</div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 mb-6">
                <Lock className="w-5 h-5 text-slate-400" />
                <p className="text-xs text-slate-500">Your data is encrypted and never shared.</p>
              </div>
            </div>
            
            <div className="p-6 bg-white border-t border-slate-200">
              <button 
                onClick={() => navigateTo("mockPaytm")}
                className="bg-[#00d09c] text-white rounded-full py-4 w-full font-bold text-lg shadow-md active:scale-95 transition-transform"
              >
                Continue
              </button>
            </div>
          </ScreenWrapper>
        );
      case "mockPaytm":
        return (
          <ScreenWrapper className="bg-slate-100">
            <header className="bg-[#00040D] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={goBack} className="mr-2">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="italic font-black text-xl">paytm</span>
              </div>
              <div className="flex items-center gap-4">
                <Search className="w-6 h-6" />
                <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-white rounded-full px-4 py-2 inline-flex items-center gap-2 shadow-sm border border-slate-200">
                <Wallet className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold">Paytm Wallet: ₹250.00</span>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                <div className="grid grid-cols-4 gap-y-6">
                  {[
                    { label: "Mobile Recharge", icon: <Smartphone /> },
                    { label: "DTH", icon: <Tv /> },
                    { label: "FASTag", icon: <Zap /> },
                    { label: "Electricity", icon: <Zap /> },
                    { label: "Loan EMI", icon: <Receipt /> },
                    { label: "Metro", icon: <Train /> },
                    { label: "Toll", icon: <Zap /> },
                    { label: "View All", icon: <ArrowRight /> }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-slate-50 rounded-full border border-slate-200 flex items-center justify-center text-slate-600">
                        {item.icon}
                      </div>
                      <span className="text-[10px] text-center font-medium text-slate-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Personal Finance Buddy Card */}
              <div 
                onClick={() => navigateTo("dashboard")}
                className="bg-[#00040D] rounded-3xl p-6 shadow-xl relative overflow-hidden cursor-pointer active:scale-95 transition-transform flex items-center justify-between"
              >
                <div className="z-10">
                  <h3 className="text-white font-bold text-xl leading-tight">
                    Personal Finance<br />Buddy
                  </h3>
                  <p className="text-slate-400 text-[10px] mt-2 font-medium">ML Powered Spending Assistant</p>
                </div>

                <div className="flex items-center gap-4 z-10">
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                      rotate: [0, 2, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                    className="w-20 h-20 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-2xl p-1 shadow-inner"
                  >
                    <img 
                      src="https://api.dicebear.com/7.x/adventurer/svg?seed=Buddy&backgroundColor=b6e3f4" 
                      alt="Buddy" 
                      className="w-full h-full object-contain rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                  
                  <div className="bg-[#00d09c] text-white rounded-full p-2 shadow-lg">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#00d09c]/10 rounded-full blur-2xl" />
              </div>

              {/* Credit Analyser Card */}
              <div 
                onClick={() => navigateTo("calculating")}
                className="bg-white rounded-3xl p-6 shadow-xl relative overflow-hidden cursor-pointer active:scale-95 transition-transform flex items-center justify-between border border-slate-100"
              >
                <div className="z-10">
                  <h3 className="text-[#00040D] font-bold text-xl leading-tight">
                    Credit<br />Analyser
                  </h3>
                  <p className="text-slate-500 text-[10px] mt-2 font-medium">Improve your credit health</p>
                </div>

                <div className="flex items-center gap-4 z-10">
                  <motion.div
                    animate={{ 
                      y: [0, 5, 0],
                      rotate: [0, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                    className="w-24 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-xl p-0.5 shadow-2xl relative overflow-hidden"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1613243555988-441166d4d6fd?auto=format&fit=crop&w=200&h=120&q=80" 
                      alt="Credit Card" 
                      className="w-full h-full object-cover rounded-[10px] opacity-90 mix-blend-overlay"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                    <div className="absolute top-2 left-2 w-6 h-4 bg-yellow-400/80 rounded-sm blur-[0.5px]" />
                    <div className="absolute bottom-2 left-2 w-10 h-1 bg-white/30 rounded-full" />
                  </motion.div>
                  
                  <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
              </div>
            </div>
            
            <nav className="bg-white border-t border-slate-200 p-2 flex items-center justify-around">
              {[
                { label: "Home", icon: <Home className="w-6 h-6 text-blue-600" />, active: true },
                { label: "Payments", icon: <ArrowRight className="w-6 h-6 text-slate-400" /> },
                { label: "Passbook", icon: <Receipt className="w-6 h-6 text-slate-400" /> },
                { label: "Offers", icon: <TrendingUp className="w-6 h-6 text-slate-400" /> },
                { label: "FinSight", icon: <Sparkles className="w-6 h-6 text-slate-400" />, action: () => navigateTo("calculating") }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="flex flex-col items-center gap-1 cursor-pointer"
                  onClick={item.action}
                >
                  {item.icon}
                  <span className={`text-[10px] ${item.active ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>{item.label}</span>
                </div>
              ))}
            </nav>
          </ScreenWrapper>
        );
      case "calculating":
        return <CalculatingScreen onComplete={() => navigateTo("dashboard", "credit")} onBack={goBack} />;
      case "scoreReveal":
        return <ScoreRevealScreen onNext={() => navigateTo("dashboard")} onBack={goBack} />;
      case "dashboard":
        return (
          <DashboardScreen 
            onHabitTracker={() => navigateTo("habitTracker")} 
            onInsights={() => navigateTo("insights")} 
            onBack={goBack}
            initialTab={dashboardTab}
          />
        );
      case "habitTracker":
        return <HabitTrackerScreen onBack={goBack} onNext={() => navigateTo("insights")} />;
      case "insights":
        return <InsightsScreen onBack={goBack} onNext={() => navigateTo("loanOffer")} />;
      case "loanOffer":
        return <LoanOfferScreen onBack={goBack} />;
      default:
        return <div className="p-10 text-center">Screen {screen} coming soon...</div>;
    }
  };

  return (
    <div className="h-full w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </div>
  );
}

// --- Screen 8: AI Saathi (Insights + Chat) ---
const MOCK_APP_STATE: AppState = {
  score: MOCK_SCORE,
  scoreBand: MOCK_SCORE_BAND,
  scoreDelta: MOCK_SCORE_DELTA,
  ladderRung: MOCK_LADDER_RUNG,
  streakDays: MOCK_STREAK_DAYS,
  topShapFactors: [
    { factor: "Bill regularity", delta: +18 },
    { factor: "Balance stability", delta: -6 }
  ],
  budgets: [
    { category: "Food", spent: 5000, total: 7000 },
    { category: "Bills", spent: 4200, total: 5000 }
  ]
};

const QUICK_CHIPS = [
  "Mera score kyun gira?",
  "Loan kab milega?",
  "Score kaise badhao?",
  "Is mahine ka kharch?"
];

const InsightsScreen = ({ onBack, onNext }: { onBack: () => void; onNext: () => void }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: "Namaste! Main AI Saathi hoon. Score, budget, ya loan — kuch bhi poochho! 😊" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const userText = text ?? input;
    if (!userText.trim() || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    // Build Gemini history format (exclude the last user msg — sent via sendMessageStream)
    const history: ChatMessage[] = messages
      .filter(m => !(m.role === 'model' && messages.indexOf(m) === 0)) // skip greeting
      .map(m => ({ role: m.role, parts: [{ text: m.text }] }));

    let response = '';
    try {
      for await (const chunk of streamSaathi(userText, MOCK_APP_STATE, history)) {
        response += chunk;
        setMessages(prev => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.role === 'model') {
            updated[updated.length - 1] = { role: 'model', text: response };
          } else {
            updated.push({ role: 'model', text: response });
          }
          return updated;
        });
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'Kuch technical problem aa gayi. Thodi der baad try karein.' 
      }]);
    }
    setLoading(false);
  };

  return (
    <ScreenWrapper className="bg-slate-50">
      <header className="bg-[#00040D] text-white p-4 flex items-center gap-3">
        <button onClick={onBack}><ChevronLeft className="w-6 h-6" /></button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 bg-[#00d09c] rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold">AI Saathi</p>
            <p className="text-[10px] text-slate-300">Powered by Gemini</p>
          </div>
        </div>
        <button 
          onClick={onNext}
          className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded border border-white/20"
        >
          LOAN OFFER
        </button>
      </header>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
            {msg.role === 'model' && (
              <div className="w-7 h-7 bg-[#00d09c] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            )}
            <div className={cn(
              'max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-[#00040D] text-white rounded-br-sm'
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
            )}>
              {msg.text}
              {loading && i === messages.length - 1 && msg.role === 'model' && (
                <span className="inline-block ml-1 animate-pulse">|</span>
              )}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-2">
            <div className="w-7 h-7 bg-[#00d09c] rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick suggestion chips */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
        {QUICK_CHIPS.map((chip, i) => (
          <button 
            key={i} 
            onClick={() => handleSend(chip)}
            className="flex-shrink-0 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-[#00d09c] hover:text-[#00d09c] transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Kuch bhi poochho..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder-slate-400 py-2"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="w-8 h-8 bg-[#00d09c] text-white rounded-full flex items-center justify-center disabled:opacity-40 active:scale-90 transition-all flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </ScreenWrapper>
  );
};

// --- Screen 7: Habit Tracker ---
const HabitTrackerScreen = ({ onBack, onNext }: { onBack: () => void; onNext: () => void }) => {
  return (
    <ScreenWrapper className="bg-slate-50">
      <header className="bg-[#00040D] text-white p-4 flex items-center gap-4">
        <button onClick={onBack}><ChevronLeft className="w-6 h-6" /></button>
        <h2 className="text-lg font-bold">Credit Ladder Habit Tracker</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900">{MOCK_STREAK_DAYS} / 14 days</h3>
              <p className="text-sm text-slate-600">Current Streak</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#00d09c] bg-white px-2 py-1 rounded-full border border-emerald-100">
                64% Complete
              </span>
            </div>
          </div>
          
          <div className="flex justify-between mb-6">
            {Array.from({ length: 14 }).map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full border ${i < MOCK_STREAK_DAYS ? 'bg-[#00d09c] border-[#00d09c]' : 'bg-white border-slate-200'}`} 
              />
            ))}
          </div>

          <div className="w-full h-2 bg-white rounded-full overflow-hidden mb-4">
            <div className="h-full bg-[#00d09c]" style={{ width: '64%' }} />
          </div>

          <p className="text-sm font-bold text-slate-700 text-center">
            5 days to unlock your first credit reward
          </p>
        </div>

        <div className="relative space-y-8 pl-8">
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200" />
          
          {[
            { 
              title: "Paid bills on time", 
              points: "+15 Score Points", 
              status: "DONE", 
              icon: <CheckCircle2 className="w-5 h-5 text-white" />,
              iconBg: "bg-[#00d09c]"
            },
            { 
              title: "Save ₹2,000 this month", 
              points: "+10 Score Points", 
              status: "60%", 
              icon: <Clock className="w-5 h-5 text-white" />,
              iconBg: "bg-blue-500"
            },
            { 
              title: "Spend less than ₹5,000 on shopping", 
              points: "+12 Score Points", 
              status: "TODO", 
              icon: <Wallet className="w-5 h-5 text-white" />,
              iconBg: "bg-slate-400"
            }
          ].map((habit, i) => (
            <div key={i} className="relative bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <div className={`absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${habit.iconBg} flex items-center justify-center z-10 border-4 border-slate-50`}>
                {habit.icon}
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{habit.title}</h4>
                  <p className="text-xs text-[#00d09c] font-bold mt-1">{habit.points}</p>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${habit.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {habit.status}
                </span>
              </div>
              {habit.status === '60%' && (
                <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '60%' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-white border-t border-slate-200">
        <button 
          onClick={onNext}
          className="bg-[#00d09c] text-white rounded-full py-4 w-full font-bold text-lg shadow-md active:scale-95 transition-transform"
        >
          Continue Challenge
        </button>
      </div>
    </ScreenWrapper>
  );
};

// --- Screen 9: Loan Offer ---
const LoanOfferScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <ScreenWrapper className="bg-slate-50">
      <header className="bg-[#00040D] text-white p-4 flex items-center gap-4">
        <button onClick={onBack}><ChevronLeft className="w-6 h-6" /></button>
        <h2 className="text-lg font-bold">Loan Approval Offer</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold">
            Rung 5 Unlock
          </div>
          <h3 className="text-4xl font-black mb-1">{MOCK_SCORE}</h3>
          <p className="text-lg font-bold opacity-90 mb-4">Excellent Credit Score</p>
          <p className="text-sm opacity-80 leading-relaxed">
            You've unlocked exclusive NBFC loan offers based on your behavioral patterns.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { amount: "₹10,000", tenure: "3 months", emi: "₹3,400/mo", rate: "12% p.a." },
            { amount: "₹25,000", tenure: "6 months", emi: "₹4,350/mo", rate: "11.5% p.a.", popular: true },
            { amount: "₹50,000", tenure: "12 months", emi: "₹4,550/mo", rate: "11% p.a." }
          ].map((opt, i) => (
            <div 
              key={i} 
              className={`bg-white rounded-xl p-3 border-2 flex flex-col items-center text-center relative ${opt.popular ? 'border-[#00d09c] shadow-md' : 'border-slate-100'}`}
            >
              {opt.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#00d09c] text-white text-[8px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                  POPULAR CHOICE
                </div>
              )}
              <span className="text-sm font-black text-slate-900">{opt.amount}</span>
              <span className="text-[10px] text-slate-500 mb-2">{opt.tenure}</span>
              <span className="text-[10px] font-bold text-slate-900">{opt.emi}</span>
              <span className="text-[8px] text-[#00d09c] font-bold">{opt.rate}</span>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900">Behavioral Signal</h4>
            <p className="text-xs text-blue-700 leading-relaxed mt-1">
              Your consistent bill payments over 90 days have increased your eligibility.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pre-filled KYC Details</h4>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Full Name</p>
              <p className="text-sm font-bold text-slate-700">Rajesh Kumar</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">PAN</p>
              <p className="text-sm font-bold text-slate-700">ABCDE1234F</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Mobile</p>
              <p className="text-sm font-bold text-slate-700">+91 98765 43210</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Address</p>
              <p className="text-sm font-bold text-slate-700 leading-tight">123, Green Park, Bangalore</p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button className="bg-[#00d09c] text-white rounded-full py-4 w-full font-bold text-lg shadow-md active:scale-95 transition-transform">
            Apply Now — eKYC in 2 mins
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-4 font-medium">
            Powered by FinSight
          </p>
        </div>
      </div>
    </ScreenWrapper>
  );
};

// --- Screen 6: Dashboard ---
const DashboardScreen = ({ onHabitTracker, onInsights, onBack, initialTab = 'spending' }: { onHabitTracker: () => void; onInsights: () => void; onBack: () => void; initialTab?: 'spending' | 'credit' }) => {
  const [activeTab, setActiveTab] = useState<'spending' | 'credit'>(initialTab);
  const [showLargeSpendModal, setShowLargeSpendModal] = useState(false);
  const [editingField, setEditingField] = useState<{ name: string, value: any } | null>(null);
  const [creditProfile, setCreditProfile] = useState<'cibil' | 'pulse'>('cibil');
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [showPulseDetail, setShowPulseDetail] = useState(false);

  // Spending Model State - with localStorage persistence
  const [totalBudget, setTotalBudget] = useState(() => {
    const saved = localStorage.getItem('totalBudget');
    return saved ? Number(saved) : 25000;
  });
  const [alreadySpent, setAlreadySpent] = useState(() => {
    const saved = localStorage.getItem('alreadySpent');
    return saved ? Number(saved) : 8500;
  });
  const [spentToday, setSpentToday] = useState(() => {
    const saved = localStorage.getItem('spentToday');
    return saved ? Number(saved) : 0;
  });
  const [customBufferPct, setCustomBufferPct] = useState<number | null>(() => {
    const saved = localStorage.getItem('customBufferPct');
    return saved ? Number(saved) : null;
  });
  const [daysRemaining, setDaysRemaining] = useState(() => {
    const saved = localStorage.getItem('daysRemaining');
    return saved ? Number(saved) : 20;
  });
  const [upcomingExpenses, setUpcomingExpenses] = useState(() => {
    const saved = localStorage.getItem('upcomingExpenses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse upcomingExpenses from localStorage", e);
      }
    }
    return [
      { label: "Electricity Bill", amount: 1500, days_from_now: 5 },
      { label: "Birthday Dinner", amount: 800, days_from_now: 12 },
    ];
  });
  const [prediction, setPrediction] = useState<any>(null);

  // Initialize local model for fallback
  const localModel = useMemo(() => {
    const model = new SpendingModel();
    const historical: MonthRecord[] = [
      { month: 1,  days_in_period: 31, total_budget: 18000, already_spent_start: 0, planned_expenses: 3000, free_balance: 15000, unplanned_actual: 2100 },
      { month: 2,  days_in_period: 28, total_budget: 15000, already_spent_start: 0, planned_expenses: 2500, free_balance: 12500, unplanned_actual: 900 },
      { month: 3,  days_in_period: 31, total_budget: 17000, already_spent_start: 0, planned_expenses: 4000, free_balance: 13000, unplanned_actual: 2800 },
      { month: 4,  days_in_period: 30, total_budget: 16000, already_spent_start: 0, planned_expenses: 2000, free_balance: 14000, unplanned_actual: 1200 },
      { month: 5,  days_in_period: 31, total_budget: 20000, already_spent_start: 0, planned_expenses: 5000, free_balance: 15000, unplanned_actual: 3200 },
      { month: 6,  days_in_period: 30, total_budget: 15000, already_spent_start: 0, planned_expenses: 1500, free_balance: 13500, unplanned_actual: 1100 },
      { month: 7,  days_in_period: 31, total_budget: 22000, already_spent_start: 0, planned_expenses: 6000, free_balance: 16000, unplanned_actual: 4100 },
      { month: 8,  days_in_period: 31, total_budget: 18000, already_spent_start: 0, planned_expenses: 3000, free_balance: 15000, unplanned_actual: 1800 },
      { month: 9,  days_in_period: 30, total_budget: 16000, already_spent_start: 0, planned_expenses: 2500, free_balance: 13500, unplanned_actual: 950 },
      { month: 10, days_in_period: 31, total_budget: 19000, already_spent_start: 0, planned_expenses: 3500, free_balance: 15500, unplanned_actual: 2600 },
    ];
    model.fit(historical);
    return model;
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('totalBudget', totalBudget.toString());
    localStorage.setItem('alreadySpent', alreadySpent.toString());
    localStorage.setItem('spentToday', spentToday.toString());
    localStorage.setItem('daysRemaining', daysRemaining.toString());
    localStorage.setItem('upcomingExpenses', JSON.stringify(upcomingExpenses));
    if (customBufferPct !== null) localStorage.setItem('customBufferPct', customBufferPct.toString());
    else localStorage.removeItem('customBufferPct');
  }, [totalBudget, alreadySpent, spentToday, daysRemaining, upcomingExpenses, customBufferPct]);

  useEffect(() => {
    const fetchPrediction = async () => {
      const input = {
        total_budget: totalBudget,
        already_spent: alreadySpent + spentToday,
        days_remaining: daysRemaining,
        month: new Date().getMonth() + 1,
        upcoming_expenses: upcomingExpenses,
        override_buffer_pct: customBufferPct
      };

      try {
        const response = await fetch('/api/spending/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
        
        if (!response.ok) throw new Error('API failed');
        
        const data = await response.json();
        setPrediction(data);
      } catch (error) {
        console.warn("API failed, using local model fallback:", error);
        // Fallback to local calculation if API is unavailable (e.g. on Vercel static deploy)
        try {
          const localResult = localModel.predict(input);
          setPrediction(localResult);
        } catch (e) {
          console.error("Local prediction failed:", e);
        }
      }
    };
    fetchPrediction();
  }, [totalBudget, alreadySpent, spentToday, daysRemaining, upcomingExpenses, customBufferPct, localModel]);

  const spendingData = Array.from({ length: 7 }, (_, i) => ({
    date: format(addDays(new Date(), -6 + i), 'MMM dd'),
    amount: 300 + Math.random() * 1000
  }));

  const pieData = prediction ? [
    { name: 'Spent', value: alreadySpent + spentToday, color: '#00040D' },
    { name: 'Upcoming', value: prediction.locked_for_upcoming, color: '#3b82f6' },
    { name: 'Buffer (ML)', value: prediction.buffer_amount, color: '#00d09c' },
    { name: 'Free', value: prediction.truly_free_balance > 0 ? prediction.truly_free_balance : 0, color: '#10b981' },
  ] : [];

  const handleUpdateField = (name: string, value: any) => {
    const numValue = Number(value);
    if (name === 'totalBudget') setTotalBudget(numValue);
    if (name === 'alreadySpent') setAlreadySpent(numValue);
    if (name === 'spentToday') setSpentToday(numValue);
    if (name === 'bufferPct') setCustomBufferPct(numValue);
    if (name === 'daysRemaining') setDaysRemaining(numValue);
    setEditingField(null);
  };

  const spendingOverview = [
    { category: "Food & Dining", amount: 769, color: "#00d09c" },
    { category: "Bills & Utilities", amount: 2449, color: "#00d09c" },
    { category: "Shopping", amount: 1299, color: "#00d09c" },
    { category: "Transport", amount: 186, color: "#00d09c" },
    { category: "Entertainment", amount: 199, color: "#00d09c" },
  ];

  const budgetStatus = [
    { category: "Food & Dining", spent: 3200, total: 5000, icon: <Utensils className="w-4 h-4" />, color: "#00d09c" },
    { category: "Transport", spent: 1800, total: 3000, icon: <Car className="w-4 h-4" />, color: "#00d09c" },
    { category: "Bills & Utilities", spent: 3450, total: 4000, icon: <Lightbulb className="w-4 h-4" />, color: "#00d09c" },
    { category: "Shopping", spent: 2100, total: 4000, icon: <ShoppingBag className="w-4 h-4" />, color: "#00d09c" },
    { category: "Entertainment", spent: 800, total: 2000, icon: <Film className="w-4 h-4" />, color: "#00d09c" },
  ];

  const renderContent = () => {
    if (activeTab === 'spending') {
      return (
        <div className="space-y-6 pb-24">
          {/* Main Spending Assistant Window */}
          <div className="bg-[#00040D] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-start">
                <div onClick={() => setEditingField({ name: 'alreadySpent', value: alreadySpent })} className="cursor-pointer group">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 group-hover:text-[#00d09c] transition-colors">Spend Today (Limit)</p>
                  <h2 className="text-3xl font-black tracking-tighter">₹{prediction?.daily_allowance || '...'}</h2>
                  <p className="text-[10px] text-[#00d09c] font-bold mt-1">ML Recommended</p>
                </div>
                <div 
                  onClick={() => setEditingField({ name: 'totalBudget', value: totalBudget })}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 cursor-pointer hover:bg-white/20 transition-colors"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Monthly Budget</p>
                  <p className="text-lg font-black">₹{totalBudget.toLocaleString()}</p>
                </div>
              </div>

              {/* Budget Allocation Status (Pie Chart) - Moved here */}
              <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-[#00d09c]" />
                  Budget Allocation (ML Optimized)
                </h3>
                <div className="flex items-center gap-4">
                  <div className="h-28 w-28 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={45}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color === '#00040D' ? '#1e293b' : entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    {pieData.map((item, i) => (
                      <div key={i} className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color === '#00040D' ? '#1e293b' : item.color }} />
                          <span className="text-[9px] font-bold text-slate-400 truncate">{item.name}</span>
                        </div>
                        <span className="text-[9px] font-black text-white shrink-0">₹{Math.round(item.value).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Inputs for Spent Today and Buffer */}
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setEditingField({ name: 'spentToday', value: spentToday })}
                  className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/20 transition-colors"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Spent Today</p>
                  <p className="text-xl font-black">₹{spentToday.toLocaleString()}</p>
                  <p className="text-[8px] text-slate-500 mt-1">Tap to update</p>
                </div>
                <div 
                  onClick={() => setEditingField({ name: 'bufferPct', value: customBufferPct || prediction?.recommended_buffer_pct })}
                  className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/20 transition-colors"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">AI Buffer %</p>
                  <p className="text-xl font-black">{customBufferPct || prediction?.recommended_buffer_pct || '0'}%</p>
                  <p className="text-[8px] text-[#00d09c] mt-1">{customBufferPct ? 'Manual Override' : 'AI Suggested'}</p>
                </div>
              </div>

              {/* Spending Graph */}
              <div className="h-40 w-full -mx-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendingData}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d09c" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00d09c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#00040D', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: '#00d09c' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#00d09c" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorSpend)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowLargeSpendModal(true)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95"
                >
                  <div className="w-8 h-8 bg-[#00d09c] rounded-full flex items-center justify-center">
                    <Send className="w-4 h-4 text-[#00040D]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Large Spend (₹{prediction?.locked_for_upcoming || 0})</span>
                </button>
                <button 
                  onClick={() => setEditingField({ name: 'daysRemaining', value: daysRemaining })}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{daysRemaining} Days Left</span>
                </button>
              </div>

              {prediction?.warning && (
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-slate-400 font-medium italic text-center">"{prediction.warning}"</p>
                </div>
              )}
            </div>
            
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#00d09c]/20 rounded-full blur-[80px]" />
          </div>

          {/* Spending Overview */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-[#00040D]">Spending Overview</h3>
              <div className="flex items-center gap-3">
                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-500">April 2026</span>
                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-4xl font-black text-[#00040D]">₹4,902</h2>
            </div>
            <div className="space-y-6">
              {spendingOverview.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-600">{item.category}</span>
                    <span className="text-xs font-black text-[#00040D]">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.amount / 4902) * 100}%` }}
                      className="h-full bg-[#00d09c]" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Spending Trend Graph */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-[#00040D] mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00d09c]" />
              7-Day Spending Trend
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingData}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #f1f5f9', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: '#00d09c', fontWeight: 'bold' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spent']}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#00d09c" 
                    radius={[6, 6, 0, 0]} 
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget Status */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-[#00040D] mb-8 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00d09c]" />
              Budget Status
            </h3>
            <div className="space-y-8">
              {budgetStatus.map((item, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="text-[#00040D]">
                        {item.icon}
                      </div>
                      <span className="text-xs font-bold text-slate-600">{item.category}</span>
                    </div>
                    <span className="text-xs font-black text-[#00040D]">
                      ₹{item.spent.toLocaleString()} / ₹{item.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.spent / item.total) * 100}%` }}
                      className="h-full bg-[#00d09c]" 
                    />
                  </div>
                </div>
              ))}
            </div>

            {upcomingExpenses.length > 0 && (
              <div className="w-full pt-6 mt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4">Upcoming Large Spends</h4>
                <div className="space-y-3">
                  {upcomingExpenses.map((exp, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl group">
                      <div>
                        <p className="text-xs font-bold text-[#00040D]">{exp.label}</p>
                        <p className="text-[10px] text-slate-500">In {exp.days_from_now} days</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-[#00040D]">₹{exp.amount.toLocaleString()}</span>
                        <button 
                          onClick={() => setUpcomingExpenses(upcomingExpenses.filter((_, idx) => idx !== i))}
                          className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Plus className="w-3 h-3 rotate-45" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Switch to Credit Analyser */}
          <button 
            onClick={() => setActiveTab('credit')}
            className="w-full bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6 flex items-center justify-between group hover:border-[#00d09c] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-[#00d09c]/10 transition-colors">
                <CreditCard className="w-6 h-6 text-slate-400 group-hover:text-[#00d09c]" />
              </div>
              <div className="text-left">
                <p className="font-black text-[#00040D]">Credit Analyser</p>
                <p className="text-xs text-slate-500">Check your ladder & score</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#00d09c] group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      );
    }

    const isCibil = creditProfile === 'cibil';
    const score = isCibil ? 750 : 680;
    const scoreBand = isCibil ? "Excellent" : "Good";
    const scoreLabel = isCibil ? "CIBIL Score" : "Paytm Pulse Score";

    return (
      <div className="space-y-6 pb-24">
        {/* Pronounced Credit Score */}
        <div 
          onClick={() => !isCibil && setShowPulseDetail(true)}
          className={`bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl text-center relative overflow-hidden ${!isCibil ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">{scoreLabel}</p>
            {!isCibil && <Info className="w-4 h-4 text-slate-300" />}
          </div>
          <div className="relative inline-block">
            <motion.div 
              key={creditProfile}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-8xl font-black text-[#00040D] tracking-tighter"
            >
              {score}
            </motion.div>
            <div className="absolute -right-4 -top-4 bg-[#00d09c] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
              {scoreBand}
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full ${i <= (isCibil ? 5 : 4) ? 'bg-[#00d09c]' : 'bg-slate-100'}`} />
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500 font-medium italic">
            {isCibil ? '"Your CIBIL is in the top 5% nationally"' : '"Your Pulse is increasing based on recent activity"'}
          </p>
        </div>

        {/* Credit Ladder */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-[#00040D] mb-8 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            Credit Ladder
          </h3>
          <div className="space-y-10 relative">
            <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-100" />
            {(isCibil ? [
              { title: "Credit Utilization", desc: "Keep credit card usage below 30% of limit", status: "current", icon: <CreditCard className="w-5 h-5" />, progress: 45 },
              { title: "Payment History", desc: "No late payments for 6 months", status: "completed", icon: <CheckCircle2 className="w-5 h-5" /> },
              { title: "Credit Mix", desc: "Maintain a mix of secured & unsecured loans", status: "locked", icon: <Lock className="w-5 h-5" /> },
            ] : [
              { title: "Bill Discipline", desc: "Pay all utility bills via Paytm for 3 months", status: "current", icon: <Receipt className="w-5 h-5" />, progress: 66 },
              { title: "Wallet Health", desc: "Maintain ₹1000+ in wallet for 30 days", status: "completed", icon: <Wallet className="w-5 h-5" /> },
              { title: "UPI Activity", desc: "Increase UPI transaction frequency", status: "locked", icon: <Zap className="w-5 h-5" /> },
            ]).map((step, i) => (
              <div key={i} className="flex items-start gap-6 relative z-10">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  step.status === 'completed' ? 'bg-[#00d09c] text-white' : 
                  step.status === 'current' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h4 className={`font-black ${step.status === 'locked' ? 'text-slate-400' : 'text-[#00040D]'}`}>{step.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                  {step.status === 'current' && (
                    <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${step.progress}%` }}
                        className="h-full bg-blue-500" 
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score Forecast (CIBIL) or Path to CIBIL (Pulse) */}
        {isCibil ? (
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-[#00040D] mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Score Forecast
            </h3>
            <div className="space-y-4">
              {[
                { action: "Pay off ₹50,000 credit card balance", impact: "+25 pts", positive: true },
                { action: "Apply for a new Personal Loan", impact: "-12 pts", positive: false },
                { action: "Close your oldest credit card", impact: "-18 pts", positive: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs font-medium text-slate-600 max-w-[70%]">{item.action}</p>
                  <span className={`text-xs font-black ${item.positive ? 'text-[#00d09c]' : 'text-red-500'}`}>
                    {item.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-[#00040D] mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Path to CIBIL
            </h3>
            <p className="text-xs text-slate-500 mb-6">You don't have a CIBIL score yet. Here's how to enter the formal system:</p>
            <div className="space-y-4">
              {[
                { title: "Secured Credit Card", desc: "Get a card against a Fixed Deposit", icon: <CreditCard className="w-4 h-4" /> },
                { title: "Paytm Postpaid", desc: "Use BNPL for small daily purchases", icon: <Smartphone className="w-4 h-4" /> },
                { title: "Consumer Durable Loan", desc: "Buy electronics on easy EMIs", icon: <Tv className="w-4 h-4" /> },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#00040D]">{item.title}</p>
                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Switch back to Spending Assistant */}
        <button 
          onClick={() => setActiveTab('spending')}
          className="w-full bg-[#00040D] text-white rounded-2xl p-6 flex items-center justify-between active:scale-95 transition-all shadow-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#00d09c]" />
            </div>
            <div className="text-left">
              <p className="font-black">Spending Assistant</p>
              <p className="text-xs text-slate-400">Manage your daily limits</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#00d09c]" />
        </button>
      </div>
    );
  };

  return (
    <ScreenWrapper className="bg-slate-50">
      <header className="bg-slate-50 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-2xl font-black tracking-tighter">
            <span className="text-[#00040D]">Fin</span>
            <span className="text-[#00d09c]">Sight</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm cursor-pointer">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <div 
            onClick={() => setShowProfileSelector(true)}
            className="w-10 h-10 bg-[#00040D] rounded-2xl flex items-center justify-center shadow-lg cursor-pointer active:scale-90 transition-transform"
          >
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6">
        {renderContent()}
      </div>

      {/* Profile Selector Modal */}
      <AnimatePresence>
        {showProfileSelector && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileSelector(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-white rounded-t-[3rem] p-8 pb-12 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
              <h3 className="text-xl font-black text-[#00040D] mb-2 text-center">Credit Profile</h3>
              <p className="text-xs text-slate-500 text-center mb-8">Select your current credit status</p>
              
              <div className="space-y-4">
                {[
                  { id: 'cibil', title: "I have a CIBIL score", desc: "View formal credit history and forecasts", icon: <ShieldCheck className="w-5 h-5 text-blue-500" /> },
                  { id: 'pulse', title: "I don't have a CIBIL score", desc: "View Paytm Pulse and path to CIBIL", icon: <Zap className="w-5 h-5 text-emerald-500" /> },
                ].map((opt) => (
                  <button 
                    key={opt.id}
                    onClick={() => {
                      setCreditProfile(opt.id as any);
                      setShowProfileSelector(false);
                    }}
                    className={`w-full p-6 rounded-3xl border-2 flex items-center gap-4 transition-all ${
                      creditProfile === opt.id ? 'border-[#00d09c] bg-[#00d09c]/5' : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      {opt.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-[#00040D]">{opt.title}</p>
                      <p className="text-[10px] text-slate-500">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pulse Detail Modal */}
      <AnimatePresence>
        {showPulseDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPulseDetail(false)}
              className="absolute inset-0 bg-[#00040D]/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-[#00040D]">Paytm Pulse</h3>
                  <p className="text-xs text-slate-500 font-medium">Alternative Credit Scoring</p>
                </div>
                <button onClick={() => setShowPulseDetail(false)} className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <ChevronLeft className="w-6 h-6 rotate-90" />
                </button>
              </div>

              <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-emerald-600" />
                  <p className="font-black text-emerald-900">What is this score?</p>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Pulse score is based on your digital footprint within Paytm. It analyzes your UPI activity, bill payment consistency, and spending patterns to predict your creditworthiness before you enter the formal CIBIL system.
                </p>
              </div>

              <div className="h-48 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: 'Jan', score: 620 },
                    { month: 'Feb', score: 645 },
                    { month: 'Mar', score: 630 },
                    { month: 'Apr', score: 680 },
                  ]}>
                    <defs>
                      <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d09c" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00d09c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="score" stroke="#00d09c" strokeWidth={4} fillOpacity={1} fill="url(#colorPulse)" />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black">
                  <ArrowUpRight className="w-3 h-3" />
                  INCREASING
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Trend Analysis</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <button 
        onClick={onInsights}
        className="fixed bottom-10 right-6 w-16 h-16 bg-[#00d09c] text-[#00040D] rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-50 border-4 border-white"
      >
        <Sparkles className="w-8 h-8" />
      </button>

      {/* Large Spend Modal */}
      <AnimatePresence>
        {showLargeSpendModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end"
            onClick={() => setShowLargeSpendModal(false)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full rounded-t-[3rem] p-8 space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
              <h3 className="text-2xl font-black text-[#00040D]">Plan Large Spend</h3>
              <p className="text-slate-500 text-sm">Tell Saathi about a big purchase and we'll adjust your daily limits.</p>
              
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Item Label</p>
                  <input id="large-spend-label" type="text" placeholder="e.g. New Phone" className="bg-transparent text-lg font-bold w-full outline-none" />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Estimated Amount</p>
                  <input id="large-spend-amount" type="number" placeholder="₹0.00" className="bg-transparent text-2xl font-black w-full outline-none" />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Days from now</p>
                  <input id="large-spend-days" type="number" placeholder="0" className="bg-transparent text-lg font-bold w-full outline-none" />
                </div>
                <button 
                  onClick={() => {
                    const label = (document.getElementById('large-spend-label') as HTMLInputElement).value;
                    const amount = Number((document.getElementById('large-spend-amount') as HTMLInputElement).value);
                    const days = Number((document.getElementById('large-spend-days') as HTMLInputElement).value);
                    if (label && amount) {
                      setUpcomingExpenses([...upcomingExpenses, { label, amount, days_from_now: days }]);
                    }
                    setShowLargeSpendModal(false);
                  }}
                  className="w-full bg-[#00040D] text-white py-5 rounded-2xl font-black shadow-xl active:scale-95 transition-transform"
                >
                  Confirm with Saathi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Field Modal */}
      <AnimatePresence>
        {editingField && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6"
            onClick={() => setEditingField(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-8 space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-black text-[#00040D]">
                Update {
                  editingField.name === 'spentToday' ? 'Spent Today' : 
                  editingField.name === 'bufferPct' ? 'Buffer %' : 
                  editingField.name === 'totalBudget' ? 'Monthly Budget' :
                  editingField.name === 'alreadySpent' ? 'Total Spent' :
                  editingField.name === 'daysRemaining' ? 'Days Remaining' :
                  editingField.name
                }
              </h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <input 
                  autoFocus
                  type="number" 
                  defaultValue={editingField.value}
                  className="bg-transparent text-2xl font-black w-full outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateField(editingField.name, (e.target as HTMLInputElement).value);
                    }
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setEditingField(null)}
                  className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                    handleUpdateField(editingField.name, input.value);
                  }}
                  className="flex-1 bg-[#00d09c] text-white py-4 rounded-2xl font-bold shadow-lg"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ScreenWrapper>
  );
};

// --- Screen 4: Calculating ---
const CalculatingScreen = ({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const duration = 4000;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const p = (currentStep / steps) * 100;
      setProgress(p);

      if (currentStep >= steps * 0.75) setStep(2);
      else if (currentStep >= steps * 0.375) setStep(1);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 500);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  const steps = [
    "Reading UPI activity...",
    "Checking bill payments...",
    "Analyzing balance trends..."
  ];

  return (
    <ScreenWrapper className="bg-[#00040D] items-center justify-center p-8 text-center">
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <h2 className="text-white text-2xl font-bold mb-12">Calculating FinSight Score</h2>
      
      <div className="relative w-48 h-48 mb-12">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            fill="transparent"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="80"
            stroke="#00d09c"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray="502.65"
            initial={{ strokeDashoffset: 502.65 }}
            animate={{ strokeDashoffset: 502.65 - (progress / 100) * 502.65 }}
            transition={{ duration: 0.1 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-4xl font-bold">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="space-y-4 text-left w-full max-w-xs">
        {steps.map((text, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: step >= i ? 1 : 0.3, x: 0 }}
            className="flex items-center gap-3 text-white"
          >
            <CheckCircle2 className={`w-6 h-6 ${step >= i ? 'text-[#00d09c]' : 'text-slate-500'}`} />
            <span className="text-lg">{text}</span>
          </motion.div>
        ))}
      </div>
    </ScreenWrapper>
  );
};

// --- Screen 5: Score Reveal ---
const ScoreRevealScreen = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const chartData = Array.from({ length: 12 }, (_, i) => ({
    week: i + 1,
    score: 300 + (i * (MOCK_SCORE - 300) / 11)
  }));

  const circumference = 502.65;
  const strokeDashoffset = circumference - (MOCK_SCORE / 900) * circumference;

  return (
    <ScreenWrapper className="bg-slate-50">
      <header className="bg-[#00040D] text-white p-4 flex items-center gap-4">
        <button onClick={onBack}><ChevronLeft className="w-6 h-6" /></button>
        <h2 className="text-lg font-bold">Your FinSight Score</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Score Gauge */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-56 h-56">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="80"
                stroke="#e2e8f0"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * 0.25} // Semi-circle look
                strokeLinecap="round"
              />
              <motion.circle
                cx="112"
                cy="112"
                r="80"
                stroke="#00d09c"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-[#00040D]">{MOCK_SCORE}</span>
              <span className="text-lg font-bold text-[#00d09c] mt-1">{MOCK_SCORE_BAND}</span>
            </div>
          </div>
        </div>

        {/* Score Band Bar */}
        <div className="space-y-2">
          <div className="flex h-3 rounded-full overflow-hidden">
            <div className="flex-1 bg-red-400" />
            <div className="flex-1 bg-orange-400" />
            <div className="flex-1 bg-blue-400" />
            <div className="flex-1 bg-green-400" />
          </div>
          <div className="relative h-4">
            <div 
              className="absolute top-0 w-1 h-4 bg-slate-900" 
              style={{ left: `${(MOCK_SCORE / 900) * 100}%` }} 
            />
          </div>
        </div>

        {/* 12-week History Chart */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">12-Week History</h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d09c" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d09c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" hide />
                <YAxis hide domain={[300, 900]} />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#00d09c" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SHAP Reason Chips */}
        <div className="flex flex-wrap gap-2">
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Positive: On-time payments
          </div>
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Positive: Regular UPI activity
          </div>
          <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 rotate-180" /> Negative: Low balance 3 days
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-slate-200">
        <button 
          onClick={onNext}
          className="bg-[#00d09c] text-white rounded-full py-4 w-full font-bold text-lg shadow-md active:scale-95 transition-transform"
        >
          Explore My Dashboard
        </button>
      </div>
    </ScreenWrapper>
  );
};

