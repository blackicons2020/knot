
import React, { useEffect, useState } from 'react';
import { Match, Message, User } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { db } from '../services/databaseService';

interface MessagesScreenProps {
    onChatSelect: (match: Match) => void;
    user: User;
    onUpgrade: () => void;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ onChatSelect, user, onUpgrade }) => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadMatches = async () => {
            setIsLoading(true);
            const mutualMatches = await db.getLikedMatches(user.id);
            setMatches(mutualMatches);
            setIsLoading(false);
        };
        loadMatches();
    }, [user.id]);

    const timeSince = (dateStr: string) => {
        const date = new Date(dateStr);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) {
            return Math.floor(interval) + "y";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + "m";
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return Math.floor(interval) + "d";
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return Math.floor(interval) + "h";
        }
        interval = seconds / 60;
        if (interval > 1) {
            return Math.floor(interval) + "m";
        }
        return Math.floor(seconds) + "s";
    }

    if (isLoading) {
        return (
            <div className="pb-24 p-4 space-y-4">
                <h1 className="text-2xl font-bold text-brand-dark">Chats</h1>
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                        <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="pb-24">
            <h1 className="text-2xl font-bold text-brand-dark p-4 tracking-tight uppercase font-black">Chats</h1>
            {!user.isPremium ? (
                <div className="px-6 py-10">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 text-center border border-dashed border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="w-16 h-16 bg-brand-light dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary dark:text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-black text-brand-dark dark:text-white uppercase tracking-tight mb-3">Messaging Restricted</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8">
                            Subscribe to start chatting with your matches and build real connections.
                        </p>
                        <button 
                            onClick={onUpgrade}
                            className="w-full bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-dark font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-brand-primary/20 active:scale-95 transition-transform"
                        >
                            Upgrade to Premium
                        </button>
                    </div>
                </div>
            ) : matches.length === 0 ? (
                <div className="text-center py-20 px-6">
                    <p className="text-gray-600 font-bold">No chats yet.</p>
                    <p className="text-sm text-gray-500 mt-2">When you match with someone, you can start chatting here.</p>
                </div>
            ) : (
                <div>
                    {matches.map((match) => {
                        return (
                             <div key={match.id} onClick={() => onChatSelect(match)} className="flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                                <img src={match.photos?.[0] || 'https://picsum.photos/seed/user/200'} alt={match.name} className="w-14 h-14 rounded-full object-cover" />
                                <div className="ml-4 flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                      <h2 className="font-bold text-brand-dark">{match.name}</h2>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500 truncate">Tap to start chatting</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default MessagesScreen;
