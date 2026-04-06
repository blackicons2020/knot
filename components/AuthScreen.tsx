
import React, { useState } from 'react';
import { KnotLogo } from './KnotLogo';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { GmailIcon } from './icons/GmailIcon';
import { AppleIcon } from './icons/AppleIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { auth } from '../src/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from './feedback/useToast';

interface AuthScreenProps {
    onLogin: (name?: string, email?: string) => void;
    onSignUp: (name?: string, email?: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onSignUp }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const { addToast } = useToast();

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setShowEmailForm(false);
    };
    
    const handleEmailContinue = () => {
        setShowEmailForm(true);
    };

    const handleGoogleSignIn = async () => {
        setIsProcessing(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            if (isLogin) {
                onLogin(user.displayName || undefined, user.email || undefined);
            } else {
                onSignUp(user.displayName || undefined, user.email || undefined);
            }
        } catch (error: any) {
            console.error("Google Sign-In Error:", error);
            addToast(error.message || "Google Sign-In failed.", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                onLogin(undefined, email);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                onSignUp(undefined, email);
            }
        } catch (error: any) {
            console.error("Email Auth Error:", error);
            addToast(error.message || "Authentication failed.", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-light flex flex-col justify-center items-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-5%] left-[-5%] w-72 h-72 bg-brand-accent/10 rounded-full blur-3xl"></div>

            <KnotLogo className="text-4xl mb-8 relative z-10" />
            
            <div className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-2xl relative z-10 border border-white/50">
                <h1 className="text-2xl font-black text-center text-brand-dark mb-6 tracking-tight">
                    {isLogin ? 'Welcome Back' : 'Join Registry'}
                </h1>

                {showEmailForm ? (
                    <form onSubmit={handleFormSubmit} className="space-y-4 animate-fade-in">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block" htmlFor="email">Email Address</label>
                            <input 
                                id="email"
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white text-brand-dark transition-all text-sm"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block" htmlFor="password">Security Password</label>
                            <input 
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white text-brand-dark transition-all text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        {email === 'admin@knot.ai' && (
                            <div className="bg-brand-dark text-brand-accent p-3 rounded-xl flex items-center gap-2 animate-pulse">
                                <ShieldCheckIcon className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Administrator Credentials Detected</span>
                            </div>
                        )}
                         <button 
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-brand-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-primary/20 hover:bg-brand-secondary transition-all mt-4 active:scale-95 disabled:bg-gray-300"
                        >
                            {isProcessing ? 'Processing...' : (isLogin ? 'Log In to Registry' : 'Continue to Onboarding')}
                        </button>
                        <button type="button" onClick={() => setShowEmailForm(false)} className="w-full text-gray-400 text-xs font-bold uppercase tracking-widest py-2">Go Back</button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <button 
                            onClick={handleGoogleSignIn} 
                            disabled={isProcessing}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-100 text-brand-dark font-bold py-4 rounded-2xl hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                        >
                            <GmailIcon className="w-5 h-5" />
                            Continue with Google
                        </button>
                        <button 
                            disabled={isProcessing}
                            className="w-full flex items-center justify-center gap-3 bg-brand-dark text-white font-bold py-4 rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg disabled:opacity-50"
                        >
                            <AppleIcon className="w-5 h-5" />
                            Continue with Apple
                        </button>
                        <div className="relative flex py-4 items-center">
                            <div className="flex-grow border-t border-gray-100"></div>
                            <span className="flex-shrink mx-4 text-gray-300 text-[10px] font-black uppercase tracking-widest">OR</span>
                            <div className="flex-grow border-t border-gray-100"></div>
                        </div>
                        <button onClick={handleEmailContinue} disabled={isProcessing} className="w-full flex items-center justify-center gap-3 bg-brand-light text-brand-primary font-bold py-4 rounded-2xl hover:bg-brand-primary hover:text-white transition-all active:scale-95 disabled:opacity-50">
                            <EnvelopeIcon className="w-5 h-5" />
                            Continue with Email
                        </button>
                    </div>
                )}

                <p className="text-center text-[10px] font-bold text-gray-400 mt-8 uppercase tracking-widest">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button onClick={toggleAuthMode} className="text-brand-primary underline ml-1">
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default AuthScreen;
