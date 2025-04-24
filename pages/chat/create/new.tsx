/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowLeft, BookOpen, User } from 'lucide-react';
import service from '../../../services/voiceChat.service';
import CheckIfSignedIn from '@/components/checkIfSignedIn';
import Header from '@/components/header';

const CreateChatForm: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearErrors = () => {
    setNameError(null);
    setStatusMessage(null);
    setStatusType(null);
  };

  const validate = (): boolean => {
    let result = true;
    if (!name || name.trim() === '') {
      setNameError('Please enter a name for your conversation');
      result = false;
    }
    return result;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearErrors();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await service.createVoiceChat(name);
      
      if (response.status === 200) {
        const result = await response.json();
        setStatusType('success');
        setStatusMessage('Conversation successfully created');
        setName('');
        
        setTimeout(() => {
          router.push('/chat');
        }, 2000);
      } else {
        const result = await response.json();
        setStatusType('error');
        setStatusMessage('Failed to create conversation. Please try again.');
      }
    } catch (error) {
      setStatusType('error');
      setStatusMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-x-hidden box-border">
      <div className="flex flex-col h-screen w-full bg-slate-50 font-sans">
        <CheckIfSignedIn
          redirectTo="/login"
          loadingComponent={<div></div>}
        >
          <Header />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 w-full max-w-full box-border overflow-x-hidden">
            {/* Back Button */}
            <Link href="/chat" className="flex items-center text-slate-600 mb-4">
              <ArrowLeft size={18} className="mr-1" />
              <span>Back to Conversations</span>
            </Link>

            {/* Page Title */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <MessageSquare size={24} className="text-emerald-600 mr-2" />
                <h1 className="font-bold text-xl text-slate-800">Create New Conversation</h1>
              </div>
              <p className="text-slate-500">Start a new language practice session</p>
            </div>

            {/* Status Messages */}
            {statusMessage && (
              <div className={`p-4 mb-6 rounded-lg ${
                statusType === 'success' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {statusMessage}
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-100 max-w-md mx-auto">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label 
                    htmlFor="chatName" 
                    className="block mb-2 text-sm font-medium text-slate-700"
                  >
                    Conversation Name
                  </label>
                  <input
                    id="chatName"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter a name for your conversation"
                    className={`w-full p-3 rounded-lg border ${
                      nameError ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors`}
                  />
                  {nameError && (
                    <div className="mt-2 text-sm text-red-600">{nameError}</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium text-center ${
                    isSubmitting 
                      ? 'opacity-70 cursor-not-allowed' 
                      : 'hover:bg-emerald-700 transition-colors'
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Conversation'}
                </button>
              </form>
            </div>
          </main>

          {/* Bottom Navigation */}
          <footer className="bg-white shadow-sm border-t border-slate-100 w-full">
            <nav className="flex justify-around">
              <Link href="/" className="flex flex-col items-center py-3 px-6 text-slate-400">
                <BookOpen size={20} />
                <span className="text-xs mt-1 font-medium">Learn</span>
              </Link>
              <Link href="#" className="flex flex-col items-center py-3 px-6 text-slate-400">
                <BookOpen size={20} />
                <span className="text-xs mt-1 font-medium">Practice</span>
              </Link>
              <Link href="/flashcards" className="flex flex-col items-center py-3 px-6 text-slate-400">
                <BookOpen size={20} />
                <span className="text-xs mt-1 font-medium">Flashcards</span>
              </Link>
              <Link href="/login" className="flex flex-col items-center py-3 px-6 text-slate-400">
                <User size={20} />
                <span className="text-xs mt-1 font-medium">Profile</span>
              </Link>
            </nav>
          </footer>
        </CheckIfSignedIn>
      </div>
    </div>
  );
};

export default CreateChatForm;