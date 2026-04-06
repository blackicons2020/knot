
import React from 'react';
import { Match, User } from '../types';

interface LikesScreenProps {
  likedMatches: Match[];
  onMatchClick: (match: Match) => void;
  user: User;
  onUpgrade: () => void;
}

const LikesScreen: React.FC<LikesScreenProps> = ({ likedMatches, onMatchClick, user, onUpgrade }) => {
  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold text-brand-dark mb-4">Who Likes You</h1>
      {!user.isPremium ? (
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 text-center border border-dashed border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-16 h-16 bg-brand-light dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary dark:text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
            <h2 className="text-xl font-black text-brand-dark dark:text-white uppercase tracking-tight mb-3">Premium Access Only</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8">
                Subscribe to see who has liked your profile and start meaningful conversations.
            </p>
            <button 
                onClick={onUpgrade}
                className="w-full bg-brand-primary dark:bg-brand-accent text-white dark:text-brand-dark font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-brand-primary/20 active:scale-95 transition-transform"
            >
                Upgrade to Premium
            </button>
        </div>
      ) : likedMatches.length === 0 ? (
        <div className="text-center py-20">
            <p className="text-gray-600">No one has liked your profile yet.</p>
            <p className="text-sm text-gray-500">Keep exploring and check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {likedMatches.map((match) => (
            <div key={match.id} onClick={() => onMatchClick(match)} className="cursor-pointer group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <img src={match.profileImageUrls[0]} alt={match.name} className="w-full h-56 object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-2 text-white">
                <p className="font-bold text-sm truncate">{match.name}, {match.age}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikesScreen;