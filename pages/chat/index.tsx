/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Trash2, MessageSquare, Plus, BookOpen, User } from 'lucide-react';
import CheckIfSignedIn from '@/components/checkIfSignedIn';
import Header from '@/components/header';
import service from '@/services/voiceChat.service';

const ChatsPage: React.FC = () => {
  const router = useRouter();
  
  const fetcher = async () => {
    const response = await service.getAllUsername("admin");
    const result = await response.json();
    return result;
  };
  
  const { data, isLoading, error, mutate } = useSWR('fetcher', fetcher);
  
  const handleDelete = async (id: string) => {
    try {
      await service.deleteChat(id);
      await mutate(); // Revalidate the list after deletion
    } catch (err) {
      console.error('Failed to delete chat', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            {/* Page Title */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <MessageSquare size={24} className="text-emerald-600 mr-2" />
                  <h1 className="font-bold text-xl text-slate-800">My Conversations</h1>
                </div>
                <Link href="chat/create/new" className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium">
                  <Plus size={16} className="mr-1" />
                  New Chat
                </Link>
              </div>
              <p className="text-slate-500">All your language practice conversations</p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-pulse text-emerald-600">Loading conversations...</div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                Error loading conversations. Please try again.
              </div>
            )}

            {/* No Chats State */}
            {!isLoading && data?.response?.length === 0 && (
              <div className="bg-slate-100 p-6 rounded-lg text-center">
                <p className="text-slate-600 mb-4">You don't have any conversations yet.</p>
                <Link href="chat/create/new" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium">
                  Start a New Conversation
                </Link>
              </div>
            )}

            {/* Chats List */}
            {!isLoading && data?.response?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
                <div className="grid grid-cols-12 bg-slate-100 text-slate-600 text-sm font-medium py-3 px-4">
                  <div className="col-span-5 md:col-span-6">Name</div>
                  <div className="col-span-5 md:col-span-4 text-center">Created</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>
                
                {data?.response?.map((item: any, index: number) => (
                  <div 
                    key={index}
                    className={`grid grid-cols-12 items-center py-4 px-4 border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors duration-150 ${index === 0 ? 'border-t-0' : ''}`}
                    onClick={() => router.push(`/chat/${item.id}`)}
                  >
                    <div className="col-span-5 md:col-span-6 font-medium text-slate-800 truncate">
                      {item.name || 'Untitled Conversation'}
                    </div>
                    <div className="col-span-5 md:col-span-4 text-slate-500 text-sm text-center">
                      {formatDate(item.createdAt)}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent row click
                          handleDelete(item.id);
                        }}
                        className="text-red-500 hover:text-red-700 bg-transparent border-0 p-2 rounded-full hover:bg-red-50 transition-colors"
                        aria-label="Delete conversation"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mobile Create Button (Fixed at bottom for mobile) */}
            <div className="md:hidden fixed bottom-20 right-4">
              <Link href="chat/create/new" className="flex items-center justify-center bg-emerald-600 text-white w-12 h-12 rounded-full shadow-lg">
                <Plus size={24} />
              </Link>
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

export default ChatsPage;