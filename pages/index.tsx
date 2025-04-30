import React, { useEffect, useState } from 'react';
import { MessageSquare, BookOpen, Award, User, PencilLine} from 'lucide-react';
import Link from 'next/link';
import CheckIfSignedIn from '@/components/checkIfSignedIn';
import ConversationTopicsSection from '@/components/conversationTopics';
import Header from '@/components/header';

const Home: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('French');
  const [username, setUsername] = useState("");
  
  const languages = ['French', 'Spanish', 'Japanese', 'German', 'Italian'];
  
  // Safely access localStorage after component mounts (client-side only)
  useEffect(() => {
    setUsername(localStorage.getItem('username') || "");
  }, []);

  return (
    <div className="overflow-x-hidden box-border">
      <div className="flex flex-col h-screen w-full bg-slate-50 font-sans">
        <CheckIfSignedIn
          redirectTo="/login"
          loadingComponent={<div></div>}
        >
          <Header/>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 w-full max-w-full box-border overflow-x-hidden">
            {/* Language Selector */}
            <div className="flex mb-6 overflow-x-auto w-full scrollbar-none pb-2">
              {languages.map(language => (
                <button
                  key={language}
                  className={`mr-3 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${
                    selectedLanguage === language 
                      ? 'bg-emerald-600 text-white border-none' 
                      : 'bg-white border border-slate-200 text-slate-700'
                  } cursor-pointer`}
                  onClick={() => setSelectedLanguage(language)}
                >
                  {language}
                </button>
              ))}
            </div>

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 mb-5 text-white shadow-md w-full box-border">
              <h2 className="font-bold text-xl m-0 mb-1">Bonjour {username}!</h2>
              <p className="m-0 mb-4">Continue ton aventure en français...</p>
              <button className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium border-none shadow shadow-black/10 cursor-pointer">
                Practice Now
              </button>
            </div>

            {/* Quick Actions */}
            <h3 className="font-bold text-lg m-0 mb-3 text-slate-800">Quick Start</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 w-full">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                <Link href={"/chat"}>
                <MessageSquare size={24} className="text-emerald-600 mb-2" />
                <h4 className="font-bold text-slate-800 m-0 mb-1">Conversation</h4>
                <p className="text-sm text-slate-500 m-0">Practice speaking with AI</p>
              </Link>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                <BookOpen size={24} className="text-emerald-600 mb-2" />
                <Link href={"/flashcards"}>
                <h4 className="font-bold text-slate-800 m-0 mb-1">Flashcards</h4>
                <p className="text-sm text-slate-500 m-0">Review vocabulary</p>
                </Link>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                <Link href={"/evaluate"}>
                <PencilLine size={24} className="text-emerald-600 mb-2" />
                <h4 className="font-bold text-slate-800 m-0 mb-1">Evaluate</h4>
                <p className="text-sm text-slate-500 m-0">Evaluate your text based on the CEFR level</p>
              </Link>
              </div>
            </div>

            {/* Topics Section */}
            <ConversationTopicsSection username={username} />
          </main>

          {/* Bottom Navigation */}
          <footer className="bg-white shadow-sm border-t border-slate-100 w-full">
            <nav className="flex justify-around">
              <Link href="/" className="flex flex-col items-center py-3 px-6 text-emerald-600">
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

export default Home;
