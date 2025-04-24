import React, { useEffect, useState } from 'react';
import { BookOpen, ArrowLeft, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';
import CheckIfSignedIn from '@/components/checkIfSignedIn';
import Header from '@/components/header';
import flashCardService from '@/services/flashCard.service';

// Define TypeScript interfaces
interface Flashcard {
  id: string;
  question: string;
  answer: string;
  topic: string;
}

interface FlashcardsByTopic {
  [topic: string]: Flashcard[];
}

const Flashcards: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardsByTopic, setFlashcardsByTopic] = useState<FlashcardsByTopic>({});
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const data = await flashCardService.getAllFlashCardsByUserId(userId);
        setFlashcards(data);
        
        // Organize flashcards by topic
        const byTopic: FlashcardsByTopic = {};
        data.forEach((card: Flashcard) => {
          if (!byTopic[card.topic]) {
            byTopic[card.topic] = [];
          }
          byTopic[card.topic].push(card);
        });
        
        setFlashcardsByTopic(byTopic);
        setTopics(Object.keys(byTopic));
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching flashcards:', err);
        setError('Failed to load flashcards. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [userId]);

  const selectTopic = (topic: string) => {
    setSelectedTopic(topic);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const goBack = () => {
    setSelectedTopic(null);
    setIsFlipped(false);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    if (!selectedTopic) return;
    
    if (currentCardIndex < flashcardsByTopic[selectedTopic].length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      // Completed all cards in this topic
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  const previousCard = () => {
    if (!selectedTopic) return;
    
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
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
            {/* Back button when topic is selected */}
            {selectedTopic && (
              <button 
                onClick={goBack}
                className="flex items-center text-slate-600 mb-4"
              >
                <ArrowLeft size={18} className="mr-1" />
                <span>Back to Topics</span>
              </button>
            )}

            {/* Page Title */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <BookOpen size={24} className="text-emerald-600 mr-2" />
                <h1 className="font-bold text-xl text-slate-800">
                  {selectedTopic ? `Flashcards: ${selectedTopic}` : 'Flashcards'}
                </h1>
              </div>
              {!selectedTopic && (
                <p className="text-slate-500">Select a topic to practice</p>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-pulse text-emerald-600">Loading flashcards...</div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* No flashcards state */}
            {!isLoading && flashcards.length === 0 && (
              <div className="bg-slate-100 p-6 rounded-lg text-center">
                <p className="text-slate-600 mb-4">You don't have any flashcards yet.</p>
                <Link href="/" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium">
                  Go Back Home
                </Link>
              </div>
            )}

            {/* Topic Selection */}
            {!isLoading && !selectedTopic && topics.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topics.map((topic) => (
                  <div 
                    key={topic}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => selectTopic(topic)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-slate-800">{topic}</h3>
                        <p className="text-sm text-slate-500">{flashcardsByTopic[topic].length} cards</p>
                      </div>
                      <ChevronRight size={20} className="text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Flashcard Game */}
            {!isLoading && selectedTopic && flashcardsByTopic[selectedTopic] && flashcardsByTopic[selectedTopic].length > 0 && (
              <div className="flex flex-col items-center w-full">
                {/* Card Count */}
                <div className="text-slate-500 mb-2 text-sm">
                  Card {currentCardIndex + 1} of {flashcardsByTopic[selectedTopic].length}
                </div>
                
                {/* Flashcard */}
                <div 
                  className="w-full max-w-md h-64 mb-6 perspective"
                  onClick={flipCard}
                >
                  <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front Side */}
                    <div className="absolute w-full h-full bg-white rounded-xl shadow-md p-6 flex flex-col justify-center items-center backface-hidden">
                      <div className="text-2xl font-bold text-center text-slate-800">
                        {flashcardsByTopic[selectedTopic][currentCardIndex].question}
                      </div>
                      <div className="text-sm text-slate-500 mt-4">
                        Tap to reveal answer
                      </div>
                    </div>
                    
                    {/* Back Side */}
                    <div className="absolute w-full h-full bg-emerald-600 text-white rounded-xl shadow-md p-6 flex flex-col justify-center items-center backface-hidden rotate-y-180">
                      <div className="text-2xl font-bold text-center">
                        {flashcardsByTopic[selectedTopic][currentCardIndex].answer}
                      </div>
                      <div className="text-sm mt-4">
                        Tap to see question
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between w-full max-w-md">
                  <button 
                    onClick={previousCard}
                    disabled={currentCardIndex === 0}
                    className={`px-4 py-2 rounded-lg ${currentCardIndex === 0 ? 'bg-slate-200 text-slate-400' : 'bg-slate-200 text-slate-700'}`}
                  >
                    Previous
                  </button>
                  <button 
                    onClick={nextCard}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
                  >
                    {currentCardIndex === flashcardsByTopic[selectedTopic].length - 1 ? 'Start Over' : 'Next'}
                  </button>
                </div>
              </div>
            )}
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
              <Link href="#" className="flex flex-col items-center py-3 px-6 text-emerald-600">
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

      {/* CSS for the card flip effect */}
      <style jsx global>{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default Flashcards;