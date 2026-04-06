
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Match, Screen, FilterState, SmokingHabits, DrinkingHabits, MaritalStatus, WillingToRelocate, ChildrenPreference } from './types';
import { INITIAL_FILTERS, CURRENT_USER, MATCHES_DATA } from './constants';
import { db } from './services/databaseService';
import { queryGlobalRegistry } from './services/matchingService';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MatchCard from './components/MatchCard';
import DiscoveryScreen from './components/DiscoveryScreen';
import ProfileDetailScreen from './components/ProfileDetailScreen';
import ChatScreen from './components/ChatScreen';
import ProfileCard from './components/ProfileCard';
import VerificationScreen from './components/VerificationScreen';
import EditProfileScreen from './components/EditProfileScreen';
import PhotoManagerScreen from './components/PhotoManagerScreen';
import AuthScreen from './components/AuthScreen';
import LikesScreen from './components/LikesScreen';
import PremiumModal from './components/PremiumModal';
import MessagesScreen from './components/MessagesScreen';
import FilterModal from './components/FilterModal';
import PaymentScreen from './components/PaymentScreen';
import OnboardingFlow from './components/OnboardingFlow';
import AdminScreen from './components/AdminScreen';
import { ToastProvider, useToast } from './components/feedback/useToast';
import { auth } from './src/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const AppContent: React.FC = () => {
    const [firebaseUser, loading, error] = useAuthState(auth);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [activeScreen, setActiveScreen] = useState<Screen>('home');
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const saved = localStorage.getItem('knot_theme');
            // Default to light if no saved preference
            if (saved === null) return false;
            return saved === 'dark';
        } catch (e) {
            return false;
        }
    });
    const { addToast } = useToast();

    // Sync theme class to HTML element
    useEffect(() => {
        const root = window.document.documentElement;
        try {
            if (isDarkMode) {
                root.classList.add('dark');
                localStorage.setItem('knot_theme', 'dark');
            } else {
                root.classList.remove('dark');
                localStorage.setItem('knot_theme', 'light');
            }
        } catch (e) {
            // Fallback for restricted environments
            if (isDarkMode) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    }, [isDarkMode]);

    const toggleTheme = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    // Load user profile when auth state changes
    useEffect(() => {
        const loadProfile = async () => {
            if (firebaseUser) {
                const profile = await db.getUser(firebaseUser.uid);
                if (profile) {
                    setUserProfile(profile);
                    if (activeScreen === 'home' && profile.email === 'admin@knot.ai') {
                        setActiveScreen('admin');
                    }
                } else {
                    // New user - trigger onboarding
                    setActiveScreen('onboarding');
                }
            } else {
                setUserProfile(null);
            }
        };
        loadProfile();
    }, [firebaseUser]);

    // Load initial matches
    useEffect(() => {
        const loadMatches = async () => {
            if (userProfile) {
                try {
                    let matchesData = await db.getPotentialMatches(userProfile);
                    console.log(`Initial matches found: ${matchesData.length}`);
                    
                    // If registry is empty or only contains the current user, seed it
                    if (matchesData.length <= 1) {
                        console.log("Seeding initial data...");
                        addToast("Initializing Registry Data...", "info");
                        
                        // First seed with some high-quality mock data
                        await db.seedMockData(MATCHES_DATA.slice(0, 5));
                        
                        // Then trigger a background AI fetch to make it dynamic
                        fetchMoreFromGlobalRegistry(true);
                        
                        matchesData = await db.getPotentialMatches(userProfile);
                    }
                    
                    // Ensure unique matches by ID
                    const uniqueMatches = Array.from(new Map(matchesData.map(m => [m.id, m])).values());
                    setMatches(uniqueMatches);
                    
                    if (uniqueMatches.length > 0) {
                        addToast(`${uniqueMatches.length} members found in registry`, "success");
                    }
                } catch (error) {
                    console.error("Error loading matches:", error);
                    addToast("Failed to load registry data", "error");
                }
            }
        };
        loadMatches();
    }, [userProfile]);

    const fetchMoreFromGlobalRegistry = useCallback(async (isSilent = false) => {
        if (isSyncing || !userProfile) return;
        setIsSyncing(true);
        if (!isSilent) addToast("Syncing with Global AI Registry...", "info");
        
        try {
            const newMatches = await queryGlobalRegistry(6);
            if (newMatches.length > 0) {
                // Persist to database so they show up on next load
                await db.addGlobalMatches(newMatches);
                
                setMatches(prev => {
                    const combined = [...prev, ...newMatches];
                    // Ensure unique matches by ID
                    return Array.from(new Map(combined.map(m => [m.id, m])).values());
                });
                
                if (!isSilent) addToast(`Discovered ${newMatches.length} new global profiles!`, "success");
            }
        } catch (e) {
            console.error("Global Registry Fetch Failed:", e);
            if (!isSilent) addToast("Global Sync Failed.", "error");
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing, addToast, userProfile]);

    // Infinite Scroll Logic
    useEffect(() => {
        const handleScroll = () => {
            if (activeScreen !== 'home') return;
            
            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop;
            const clientHeight = document.documentElement.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight - 300 && !isSyncing) {
                fetchMoreFromGlobalRegistry(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activeScreen, isSyncing, fetchMoreFromGlobalRegistry]);

    const handleLogin = (name?: string, email?: string) => {
        // Auth state is handled by useAuthState
        addToast("Directory Access Granted", "success");
    };

    const handleSignUp = (name?: string, email?: string) => {
        // Auth state is handled by useAuthState
        addToast("Welcome to Knot Registry", "success");
    };

    const handleNavigate = (screen: Screen) => {
        setActiveScreen(screen);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleCardClick = (match: Match) => {
        setSelectedMatch(match);
        setActiveScreen('profileDetail');
    };

    const handleStartChat = (match: Match) => {
        if (userProfile && !userProfile.isPremium) {
            setIsPremiumModalOpen(true);
            return;
        }
        setSelectedMatch(match);
        setActiveScreen('chat');
    };

    const handleBack = () => {
        if (activeScreen === 'chat') {
            setActiveScreen('profileDetail');
        } else if (activeScreen === 'profileDetail' || activeScreen === 'payment') {
            setActiveScreen('home');
            setSelectedMatch(null);
        } else if (['verification', 'editProfile', 'managePhotos', 'admin'].includes(activeScreen)) {
            setActiveScreen('profile');
            setSelectedMatch(null);
        } else {
            setActiveScreen('home');
            setSelectedMatch(null);
        }
    };
    
    const handleUpgradeClick = () => {
        setIsPremiumModalOpen(false);
        setActiveScreen('payment');
    };

    const handleSubscribe = () => {
        if (userProfile) {
            const updated: User = { 
                ...userProfile, 
                isPremium: true,
                subscriptionAmount: 7.00,
                subscriptionDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                subscriptionPeriod: 'Custom'
            };
            setUserProfile(updated);
            db.saveUser(updated);
        }
        addToast('Welcome to Premium!', 'success');
        setActiveScreen('likes'); 
    };

    const handleSaveProfile = (updatedUser: User) => {
        if (firebaseUser) {
            const finalUser = { ...updatedUser, id: firebaseUser.uid };
            setUserProfile(finalUser);
            db.saveUser(finalUser);
            addToast('Directory Updated', 'success');
            if (activeScreen === 'onboarding') {
                setActiveScreen('home');
                // Trigger an AI fetch after onboarding so the user sees fresh matches
                fetchMoreFromGlobalRegistry(true);
            } else {
                handleBack();
            }
        }
    };

    const handleCancelOnboarding = () => {
        if (window.confirm("Exit registry activation?")) {
            auth.signOut();
            setActiveScreen('home');
        }
    };

    const handleVerificationComplete = () => {
        if (userProfile) {
            const updated = {...userProfile, isVerified: true};
            setUserProfile(updated);
            db.saveUser(updated);
        }
        setActiveScreen('profile');
    };

    const handleUpdatePhotos = (photos: string[]) => {
        if (userProfile) {
            const updated = {...userProfile, profileImageUrls: photos};
            setUserProfile(updated);
            db.saveUser(updated);
        }
        addToast('Photos Updated', 'success');
        handleBack();
    };
    
    const filteredMatches = matches
        .filter(match => {
            const ageMatch = match.age >= filters.ageRange[0] && match.age <= filters.ageRange[1];
            const locationMatch = filters.location ? (match.city?.toLowerCase().includes(filters.location.toLowerCase()) || match.country?.toLowerCase().includes(filters.location.toLowerCase())) : true;
            const verifiedMatch = filters.showVerifiedOnly ? match.isVerified : true;
            return ageMatch && locationMatch && verifiedMatch;
        })
        .sort((a, b) => (b.subscriptionAmount || 0) - (a.subscriptionAmount || 0));

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-brand-dark text-brand-accent font-black animate-pulse">KNOT INITIALIZING...</div>;
    }

    if (!firebaseUser) {
        return <AuthScreen onLogin={handleLogin} onSignUp={handleSignUp} />;
    }

    if (!userProfile && activeScreen !== 'onboarding') {
        return <div className="h-screen flex items-center justify-center bg-brand-dark text-brand-accent font-black animate-pulse">LOADING PROFILE...</div>;
    }

    const renderScreen = () => {
        if (selectedMatch) {
            switch(activeScreen) {
                case 'profileDetail':
                    return <ProfileDetailScreen match={selectedMatch} user={userProfile!} onBack={handleBack} onStartChat={handleStartChat} onUpgrade={handleUpgradeClick} />;
                case 'chat':
                    return <ChatScreen match={selectedMatch} user={userProfile!} onBack={handleBack} />;
            }
        }

        switch (activeScreen) {
            case 'onboarding':
                return <OnboardingFlow user={userProfile || { ...CURRENT_USER, id: firebaseUser.uid, email: firebaseUser.email || '' }} onComplete={handleSaveProfile} onCancel={handleCancelOnboarding} />;
            case 'home':
                return (
                    <div className="p-4 space-y-4 pb-32">
                        {filteredMatches.length > 0 ? (
                            filteredMatches.map(match => (
                                <MatchCard key={match.id} match={match} user={userProfile!} onCardClick={handleCardClick} />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 m-2">
                                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs px-10">No matches found in this criteria.</p>
                                <button onClick={() => setFilters(INITIAL_FILTERS)} className="mt-4 text-brand-primary dark:text-brand-accent font-black uppercase text-[10px] tracking-widest underline">Reset Filters</button>
                            </div>
                        )}
                        
                        {isSyncing && (
                            <div className="pt-6 pb-4 flex flex-col items-center">
                                <div className="w-6 h-6 border-2 border-brand-primary dark:border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[10px] font-black uppercase text-brand-primary dark:text-brand-accent mt-2">Loading more...</span>
                            </div>
                        )}
                    </div>
                );
            case 'discovery':
                return (
                    <div className="relative">
                        <DiscoveryScreen 
                            matches={matches} 
                            user={userProfile!} 
                            onMatchClick={handleCardClick} 
                            onOpenFilters={() => setIsFilterModalOpen(true)} 
                        />
                        {/* Floating Sync Button for Discovery */}
                        <div className="fixed bottom-24 right-4 z-40">
                            <button 
                                onClick={() => fetchMoreFromGlobalRegistry()}
                                disabled={isSyncing}
                                className={`p-4 rounded-full shadow-2xl transition-all active:scale-90 ${
                                    isSyncing ? 'bg-gray-400 animate-pulse' : 'bg-brand-primary hover:bg-brand-dark'
                                } text-white`}
                            >
                                {isSyncing ? (
                                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                );
            case 'likes':
                 return <LikesScreen likedMatches={matches.filter(m => m.id !== userProfile?.id).slice(0, 3)} onMatchClick={handleCardClick} user={userProfile!} onUpgrade={handleUpgradeClick} />;
            case 'messages':
                return <MessagesScreen onChatSelect={handleStartChat} user={userProfile!} onUpgrade={handleUpgradeClick} />;
            case 'profile':
                return <ProfileCard 
                    user={userProfile!} 
                    onEditProfile={() => setActiveScreen('editProfile')} 
                    onManagePhotos={() => setActiveScreen('managePhotos')}
                    onVerifyProfile={() => setActiveScreen('verification')}
                    onOpenAdmin={() => setActiveScreen('admin')}
                />;
            case 'verification':
                return <VerificationScreen onVerificationComplete={handleVerificationComplete} onBack={handleBack} />;
            case 'editProfile':
                return <EditProfileScreen user={userProfile!} onBack={handleBack} onSave={handleSaveProfile} />;
            case 'managePhotos':
                return <PhotoManagerScreen user={userProfile!} onBack={handleBack} onUpdatePhotos={handleUpdatePhotos} />;
            case 'payment':
                return <PaymentScreen onBack={handleBack} onSubscribe={handleSubscribe} user={userProfile!} />;
            case 'admin':
                return <AdminScreen onBack={handleBack} />;
            default:
                return <div className="p-10 text-center">Screen Not Found</div>;
        }
    };
    
    const showHeader = ['home', 'discovery', 'likes', 'messages', 'profile'].includes(activeScreen);
    const showBottomNav = ['home', 'discovery', 'likes', 'messages', 'profile'].includes(activeScreen);

    return (
        <div className={`max-w-md mx-auto bg-gray-50 dark:bg-brand-dark min-h-screen font-sans shadow-2xl overflow-x-hidden transition-colors ${isDarkMode ? 'dark' : ''}`}>
            {showHeader && (
                <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-50">
                    <Header 
                        onOpenFilters={() => setIsFilterModalOpen(true)} 
                        isDarkMode={isDarkMode} 
                        toggleTheme={toggleTheme} 
                    />
                    {isSyncing && (
                        <div className="h-0.5 w-full bg-brand-light dark:bg-gray-800 relative overflow-hidden">
                            <div className="absolute inset-0 bg-brand-primary dark:bg-brand-accent animate-progress-ind"></div>
                        </div>
                    )}
                </div>
            )}
            
            <main className={`${showHeader ? 'pt-[6rem]' : ''}`}>
                {renderScreen()}
            </main>

            {showBottomNav && (
                <BottomNav activeScreen={activeScreen} onNavigate={handleNavigate} />
            )}

            <FilterModal 
                isOpen={isFilterModalOpen} 
                onClose={() => setIsFilterModalOpen(false)}
                currentFilters={filters}
                onApplyFilters={(newFilters) => {
                    setFilters(newFilters);
                    addToast('Filters Applied', 'info');
                }}
                initialFilters={INITIAL_FILTERS}
            />
            
            <PremiumModal 
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
                onUpgrade={handleUpgradeClick}
                user={userProfile}
            />
            
            <style>{`
                @keyframes progress-ind {
                    0% { left: -100%; width: 100%; }
                    100% { left: 100%; width: 100%; }
                }
                .animate-progress-ind { animation: progress-ind 1.5s infinite linear; }
            `}</style>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    );
};

const AppWithAuth: React.FC = () => {
    return <App />;
}

export default AppWithAuth;
