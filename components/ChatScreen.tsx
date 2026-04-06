
import React, { useState, useEffect, useRef } from 'react';
import { Match, User, Message } from '../types';
import { databaseService } from '../services/databaseService';
import { SendIcon } from './icons/SendIcon';
import { useToast } from './feedback/useToast';

interface ChatScreenProps {
  match: Match;
  user: User;
  onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ match, user, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const unsubscribe = databaseService.subscribeToMessages(match.id, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [match.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    
    const text = newMessage;
    setNewMessage('');
    try {
      await databaseService.sendMessage(match.id, user.id, text);
    } catch (error) {
      addToast("Failed to send message", "error");
      setNewMessage(text);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="text-gray-600 mr-3 p-1 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img src={match.photos?.[0] || 'https://picsum.photos/seed/user/200'} alt={match.name} className="w-10 h-10 rounded-full object-cover" />
        <div className="ml-3 flex-1">
          <h2 className="font-bold text-lg text-brand-dark">{match.name}</h2>
          <p className="text-xs text-gray-500">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-brand-light/30 pb-44">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Start of conversation</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
              {msg.senderId !== user.id && <img src={match.photos?.[0] || 'https://picsum.photos/seed/user/200'} alt={match.name} className="w-6 h-6 rounded-full self-start" />}
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                  msg.senderId === user.id
                    ? 'bg-brand-primary text-white rounded-br-none'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="text-sm font-medium">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-3 fixed bottom-20 left-0 right-0 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-brand-secondary bg-gray-50 text-black"
          />
          <button onClick={handleSendMessage} className="bg-brand-primary text-white rounded-full p-2.5 hover:bg-brand-secondary transition-transform active:scale-95">
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
