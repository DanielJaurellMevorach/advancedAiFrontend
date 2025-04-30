import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import evaluateTextService from '../../services/evaluateText.service';
import { ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import Header from '@/components/header';

const Evaluate: React.FC = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleVerify = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await evaluateTextService.sendEvaluateText(text);
            const json = await res.json();
            setResult(json.response);
        } catch (err) {
            setResult('An error occurred while verifying.');
        } finally {
            setLoading(false);
        }
        setText('');
    };

    return (
        <div className="overflow-x-hidden box-border">
            <div className="flex flex-col h-screen w-full bg-slate-50 font-sans">
                <Header />

                <main className="flex-1 overflow-y-auto pb-24 w-full max-w-full box-border overflow-x-hidden relative">
                    {/* Back Button */}
                    <div className="sticky top-0 bg-slate-50 z-10 p-4 border-b border-slate-100">
                        <Link href="/" className="flex items-center text-slate-600">
                            <ArrowLeft size={18} className="mr-1" />
                            <span>Back to Menu</span>
                        </Link>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-emerald-600">
                                <Loader2 className="animate-spin w-12 h-12 mb-4" />
                                <p className="text-lg">Analyzing your text...</p>
                            </div>
                        ) : result !== null ? (
                            <div className="text-center mt-12">
                                <div className="flex justify-center mt-12">
                                    <div className="w-60 h-60 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                        <h2 className="text-[80px] font-bold text-white">{result}</h2>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setResult(null)}
                                    className="mt-6 bg-slate-100 text-slate-600 px-4 py-2 rounded hover:bg-slate-200 transition"
                                >
                                    Verify another text
                                </button>
                            </div>
                        ) : (
                            <>
                                <label htmlFor="longText" className="block text-slate-700 font-medium mb-2">
                                    Paste or write your text below (up to ~3000 words):
                                </label>
                                <textarea
                                    id="longText"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={10}
                                    maxLength={3000}
                                    className="w-full p-4 border border-slate-200 rounded-lg resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                    placeholder="Start writing or paste your text here..."
                                />
                                <button
                                    onClick={handleVerify}
                                    disabled={!text.trim()}
                                    className={`mt-4 font-semibold px-6 py-2 rounded-lg shadow-md transition-colors ${text.trim()
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    Verify
                                </button>
                            </>
                        )}
                    </div>
                </main>

                <footer className="bg-white shadow-sm border-t border-slate-100 w-full fixed bottom-0 left-0 right-0">
                    <nav className="flex justify-around">
                        <Link href="/" className="flex flex-col items-center py-3 px-6 text-slate-400">
                            <MessageSquare size={20} />
                            <span className="text-xs mt-1 font-medium">Home</span>
                        </Link>
                        <Link href="/evaluate" className="flex flex-col items-center py-3 px-6 text-emerald-600">
                            <MessageSquare size={20} />
                            <span className="text-xs mt-1 font-medium">Evaluate</span>
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
            </div>
        </div>
    );
};

export default Evaluate;
