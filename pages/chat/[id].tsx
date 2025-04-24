/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from 'next/router';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Mic, MicOff, ArrowLeft } from 'lucide-react';
import service from '@/services/voiceChat.service';
import useSWR from 'swr';
import CheckIfSignedIn from '@/components/checkIfSignedIn';
import Header from '@/components/header';

type Message = {
  sender: 'You' | 'Bot' | 'Error' | 'Correction';
  text?: string;
  correct?: boolean;
};

const ChatPage: React.FC = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const shouldFetch = typeof id === 'string';

  const { data, isLoading, error } = useSWR(
    shouldFetch ? ['fetcherMessages', id] : null,
    () => service.getAllMessages(id).then((res) => res.json())
  );

  useEffect(() => {
    if (data?.response) {
      const fetchedMessages: Message[] = data.response.flatMap((msg: any) => {
        const messages: Message[] = [];

        if (msg.prompt) {
          const mistakes = msg.correction[0].description;
          const isCorrect = mistakes === '';
          messages.push({ sender: 'You', text: msg.prompt, correct: isCorrect });
        }

        if (msg.prompt && msg.correction[0].description) {
          messages.push({ sender: 'Error', text: msg.correction[0].description });
          messages.push({ sender: 'Correction', text: msg.correction[0].correctionOfEntireSentence });
        }

        if (msg.content) {
          messages.push({ sender: 'Bot', text: msg.content });
        }

        return messages;
      });

      setMessages(fetchedMessages);
    }
  }, [data]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');
        formData.append('chatId', id);
        formData.append('username', 'admin'); // change later

        // Add a temporary recording message
        setMessages((prev) => [...prev, { sender: 'You', text: 'Processing your voice message...' }]);

        try {
          const response = await fetch('http://localhost:3000/voiceMessage/ask', {
            method: 'POST',
            body: formData,
          });

          // Remove the temporary message
          setMessages((prev) => prev.slice(0, -1));

          const newData = await response.json();
          const reply = newData.response;

          if (reply.correction.descriptionOfAllMistakes === '') {
            setMessages((prev) => [
              ...prev,
              { sender: 'You', text: reply.userSentence, correct: true },
              { sender: 'Bot', text: reply.followupQuestion }
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              { sender: 'You', text: reply.userSentence, correct: false },
              { sender: 'Error', text: reply.correction.descriptionOfAllMistakes },
              { sender: 'Correction', text: reply.correction.correctionOfEntireSentence },
              { sender: 'Bot', text: reply.followupQuestion }
            ]);
          }
        } catch (err) {
          console.error('Error sending voice message:', err);
          // Remove the temporary message and add an error
          setMessages((prev) => [...prev.slice(0, -1), { sender: 'Bot', text: 'Failed to process your message. Please try again.' }]);
        }
      };

      mediaRecorder.start();
      setRecording(true);
      mediaRecorderRef.current = mediaRecorder;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setMessages((prev) => [...prev, { sender: 'Bot', text: 'Failed to access microphone. Please check your permissions and try again.' }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
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
          <main className="flex-1 overflow-y-auto pb-24 w-full max-w-full box-border overflow-x-hidden relative">
            {/* Back Button - Fixed at top */}
            <div className="sticky top-0 bg-slate-50 z-10 p-4 border-b border-slate-100">
              <Link href="/chat" className="flex items-center text-slate-600">
                <ArrowLeft size={18} className="mr-1" />
                <span>Back to Conversations</span>
              </Link>
            </div>

            {/* Chat Messages */}
            <div className="p-4">
              {isLoading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-pulse text-emerald-600">Loading conversation...</div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                  Error loading messages. Please try refreshing the page.
                </div>
              )}

              {!isLoading && messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No messages yet. Start recording to begin the conversation.</p>
                </div>
              )}

              <div className="space-y-4">
                {messages.map((msg, index) => {
                  if (msg.sender === 'You') {
                    return (
                      <div key={index} className="flex justify-end">
                        <div className={`rounded-lg px-4 py-2 max-w-xs md:max-w-md ${
                          msg.correct === false 
                            ? 'bg-red-50 text-red-700 border border-red-100' 
                            : 'bg-emerald-600 text-white'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  } else if (msg.sender === 'Bot') {
                    return (
                      <div key={index} className="flex justify-start">
                        <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-slate-100 max-w-xs md:max-w-md">
                          {msg.text}
                        </div>
                      </div>
                    );
                  } else if (msg.sender === 'Error') {
                    return (
                      <div key={index} className="flex justify-start">
                        <div className="bg-red-50 text-red-700 rounded-lg px-4 py-2 border border-red-100 max-w-xs md:max-w-md">
                          <strong>Errors:</strong> {msg.text}
                        </div>
                      </div>
                    );
                  } else if (msg.sender === 'Correction') {
                    return (
                      <div key={index} className="flex justify-start">
                        <div className="bg-emerald-50 text-emerald-700 rounded-lg px-4 py-2 border border-emerald-100 max-w-xs md:max-w-md">
                          <strong>Correct form:</strong> {msg.text}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Recording Button - Fixed at bottom */}
            <div className="fixed bottom-20 inset-x-0 p-4 bg-gradient-to-t from-slate-50 to-transparent flex justify-center">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-colors ${
                  recording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {recording ? (
                  <MicOff size={24} className="text-white" />
                ) : (
                  <Mic size={24} className="text-white" />
                )}
              </button>
            </div>
          </main>

          {/* Bottom Navigation */}
          <footer className="bg-white shadow-sm border-t border-slate-100 w-full fixed bottom-0 left-0 right-0">
            <nav className="flex justify-around">
              <Link href="/" className="flex flex-col items-center py-3 px-6 text-slate-400">
                <MessageSquare size={20} />
                <span className="text-xs mt-1 font-medium">Home</span>
              </Link>
              <Link href="/chat" className="flex flex-col items-center py-3 px-6 text-emerald-600">
                <MessageSquare size={20} />
                <span className="text-xs mt-1 font-medium">Chats</span>
              </Link>
              <Link href="/flashcards" className="flex flex-col items-center py-3 px-6 text-slate-400">
                <MessageSquare size={20} />
                <span className="text-xs mt-1 font-medium">Flashcards</span>
              </Link>
              <Link href="/login" className="flex flex-col items-center py-3 px-6 text-slate-400">
                <MessageSquare size={20} />
                <span className="text-xs mt-1 font-medium">Profile</span>
              </Link>
            </nav>
          </footer>
        </CheckIfSignedIn>
      </div>
    </div>
  );
};

export default ChatPage;