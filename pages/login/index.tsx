/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import userService from '../../services/user.service';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('userData_')) {
        localStorage.removeItem(key);
      }
    });
       
    try {
      const userDataArray = await userService.signIn(username, password);
      const {username: usernameResponse, token} = await userDataArray.json();
      localStorage.setItem('token', token);
      localStorage.setItem('username', usernameResponse);
      router.push('/');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-white">
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
          {/* App name at the top of the card */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-emerald-600">Linguo</h1>
          </div>
          
          <h2 className="text-xl font-semibold text-slate-800 text-center mb-2">Sign in</h2>
          <div className="text-sm text-slate-500 text-center mb-6">Continue your language learning journey</div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}
          
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full px-3 py-2 text-base border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-emerald-600"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-3 py-2 text-base border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-emerald-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-5 text-right">
              <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-emerald-600">
                Forgot password?
              </Link>
            </div>
            
            <button 
              type="submit" 
              className="w-full py-2 bg-emerald-600 text-white border-none rounded-lg text-base font-medium cursor-pointer hover:bg-emerald-700 disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
            
            <div className="mt-6 text-sm text-slate-500 text-center">
              Don't have an account?{' '}
              <Link href="/signup" className="text-emerald-600 font-medium">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;