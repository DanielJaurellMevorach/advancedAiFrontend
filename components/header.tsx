import React, { useState } from 'react';
import { Menu, X, MessageSquare, BookOpen, Award, User, Settings, PanelLeftClose } from 'lucide-react';
import Link from 'next/link';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
      };

    return (
        <>
        {/* Top Navigation */}
                  <header className="px-4 py-3 bg-white shadow-sm flex justify-between items-center w-auto">
                    <div className="flex items-center">
                      <button onClick={toggleMenu} className="mr-3 bg-transparent border-none cursor-pointer">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                      </button>
                      <h1 className="text-xl font-bold text-emerald-600 m-0">Linguo</h1>
                    </div>
                    <div className="bg-emerald-100 text-emerald-800 rounded-full px-3 py-1 text-sm font-medium">
                      Level 3
                    </div>
                  </header>
        
                  {/* Side Menu (mobile overlay) */}
                  {isMenuOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleMenu}>
                      <div className="bg-white h-full w-64 shadow-md p-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-lg font-bold text-emerald-600 m-0">Linguo</h2>
                          <button onClick={toggleMenu} className="text-emerald-600 bg-transparent border-none cursor-pointer">
                            <PanelLeftClose size={22} />
                          </button>
                        </div>
                        <nav>
                          <ul className="list-none p-0 m-0">
                            <li>
                              <Link href="/" className="flex items-center text-slate-700 font-medium p-2 rounded-lg mb-4 bg-slate-100">
                                <BookOpen size={20} className="mr-3 text-emerald-600" />
                                Learn
                              </Link>
                            </li>
                            <li>
                              <Link href="/practice" className="flex items-center text-slate-700 font-medium p-2 rounded-lg mb-4">
                                <MessageSquare size={20} className="mr-3 text-emerald-600" />
                                Practice
                              </Link>
                            </li>
                            <li>
                              <Link href="/flashcards" className="flex items-center text-slate-700 font-medium p-2 rounded-lg mb-4">
                                <BookOpen size={20} className="mr-3 text-emerald-600" />
                                Flashcards
                              </Link>
                            </li>
                            <li>
                              <Link href="/login" className="flex items-center text-slate-700 font-medium p-2 rounded-lg mb-4">
                                <User size={20} className="mr-3 text-emerald-600" />
                                Profile
                              </Link>
                            </li>
                            <li>
                              <Link href="#" className="flex items-center text-slate-700 font-medium p-2 rounded-lg mb-4">
                                <Settings size={20} className="mr-3 text-emerald-600" />
                                Settings
                              </Link>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    </div>
                  )}
                  </>
    )

}
export default Header;