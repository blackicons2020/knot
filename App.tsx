import React, { useState, useEffect, useCallback } from 'react';
import { User, Match, Screen, FilterState } from './types';
import { INITIAL_FILTERS, MATCHES_DATA } from './constants';
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
import { useAuth } from './hooks/useAuth';

const AppContent: React.FC = () => {
    const { user: authUser, loading, login, register, logout } = useAuth();
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
            if (isDarkMode) root.classList.add('dark');
            else root.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleTheme = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    // Load user profile when auth state changes
    useEffect(() => {
        const loadProfile = async () => {
            if (authUser) {
                // If it's a new user without a full profile name/age, trigger onboarding
                if (!authUser.name || authUser.age === 0) {
                    setActiveScreen('onboarding');
                    setUserProfile(authUser);
                } else {
                    setUserProfile(authUser);
                    if (activeScreen === 'home' && authUser.email === 'admin@knot.ai') {
                        setActiveScreen('admin');
                    }
                }
            } else {
                setUserProfile(null);
            }
        };
        loadProfile();
    }, [authUser]);

    // Load initial matches
    useEffect(() => {
        const loadMatches = async () => {
            if (userProfile && userProfile.id) {
                try {
                    let matchesData = await db.getPotentialMatches(userProfile);
                    
                    if (matchesData.length <= 1) {
                        addToast("Initializing Registry Data...", "info");
                        await db.seedMockData(MATCHES_DATA.slice(0, 5));
                        fetchMoreFromGlobalRegistry(true);
                        matchesData = await db.getPotentialMatches(userProfile);
                    }
                    
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
                await db.addGlobalMatches(newMatches);
                setMatches(prev => {
                    const combined = [...prev, ...newMatches];
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

    const handleLogin = async (email: string, password: string) => {
        await login(email, password);
        addToast("Directory Access Granted", "success");
    };

    const handleSignUp = async (email: string, password: string, name?: string) => {
        await register(email, password, name || '');
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
        const backMap: Record<string, Screen> = {
            chat: 'profileDetail',
            profileDetail: 'home',
            payment: 'home',
            verification: 'profile',
            editProfile: 'profile',
            managePhotos: 'profile',
            admin: 'profile'
        };
        setActiveScreen(backMap[activeScreen] || 'home');
        if (activeScreen === 'profileDetail' || activeScreen === 'payment') setSelectedMatch(null);
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
        if (authUser) {
            const finalUser = { ...updatedUser, id: authUser.id };
            setUserProfile(finalUser);
            db.saveUser(finalUser);
            addToast('Directory Updated', 'success');
            if (activeScreen === 'onboarding') {
                setActiveScreen('home');
                fetchMoreFromGlobalRegistry(true);
            } else {
                handleBack();
            }
        }
    };

    const handleCancelOnboarding = () => {
        if (window.confirm("Exit registry activation?")) {
            logout();
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

    if (!authUser) {
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
                return <OnboardingFlow user={userProfile!} onComplete={handleSaveProfile} onCancel={handleCancelOnboarding} />;
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
                return <DiscoveryScreen matches={matches} user={userProfile!} onMatchClick={handleCardClick} onOpenFilters={() => setIsFilterModalOpen(true)} />;
            case 'likes':
                 return <LikesScreen likedMatches={matches.filter(m => m.id !== userProfile?.id).slice(0, 3)} onMatchClick={handleCardClick} user={userProfile!} onUpgrade={handleUpgradeClick} />;
            case 'messages':
                return <MessagesScreen onChatSelect={handleStartChat} user={userProfile!} onUpgrade={handleUpgradeClick} />;
            case 'profile':
                return <ProfileCard user={userProfile!} onEditProfile={() => setActiveScreen('editProfile')} onManagePhotos={() => setActiveScreen('managePhotos')} onVerifyProfile={() => setActiveScreen('verification')} onOpenAdmin={() => setActiveScreen('admin')} />;
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
                    <Header onOpenFilters={() => setIsFilterModalOpen(true)} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
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

            <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} currentFilters={filters} onApplyFilters={(newFilters) => { setFilters(newFilters); addToast('Filters Applied', 'info'); }} initialFilters={INITIAL_FILTERS} />
            <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} onUpgrade={handleUpgradeClick} user={userProfile!} />
            
            <style>{`
                @keyframes progress-ind { 0% { left: -100%; width: 100%; } 100% { left: 100%; width: 100%; } }
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

export default App;
