/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import userService from '../../services/user.service';

// Define type for form errors
type FormErrors = {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Basic validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.confirmPassword !== formData.password) {
      newErrors.password = 'Passwords do not match';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setGeneralError('');
    
    try {
      const { confirmPassword, ...userData } = formData;
      
      // Register the user
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to register user");
      }
      
      // Clear any existing user data in localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('userData_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Automatically sign in the user with their new credentials
      try {
        const userDataArray = await userService.signIn(formData.username, formData.password);
        const { username: usernameResponse, token, id } = await userDataArray.json();
        localStorage.setItem('token', token);
        localStorage.setItem('username', usernameResponse);
        localStorage.setItem('userId', id);
        
        // Redirect to home page instead of login page
        router.push('/');
      } catch (err) {
        // If auto-login fails, redirect to login page
        router.push('/login');
      }
    } catch (err) {
      setGeneralError('Registration failed. Please try again.');
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
          
          <h2 className="text-xl font-semibold text-slate-800 text-center mb-2">Create your account</h2>
          <div className="text-sm text-slate-500 text-center mb-6">Start your language learning journey</div>
          
          {generalError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">
              {generalError}
            </div>
          )}
          
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className={`w-full px-3 py-2 text-base border ${errors.firstName ? 'border-red-500' : 'border-slate-200'} rounded-lg bg-white focus:outline-none focus:border-emerald-600`}
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className={`w-full px-3 py-2 text-base border ${errors.lastName ? 'border-red-500' : 'border-slate-200'} rounded-lg bg-white focus:outline-none focus:border-emerald-600`}
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`w-full px-3 py-2 text-base border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-lg bg-white focus:outline-none focus:border-emerald-600`}
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className={`w-full px-3 py-2 text-base border ${errors.username ? 'border-red-500' : 'border-slate-200'} rounded-lg bg-white focus:outline-none focus:border-emerald-600`}
                placeholder="johndoe123"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className={`w-full px-3 py-2 text-base border ${errors.password ? 'border-red-500' : 'border-slate-200'} rounded-lg bg-white focus:outline-none focus:border-emerald-600`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className={`w-full px-3 py-2 text-base border ${formData.confirmPassword !== formData.password && formData.confirmPassword ? 'border-red-500' : 'border-slate-200'} rounded-lg bg-white focus:outline-none focus:border-emerald-600`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {formData.confirmPassword !== formData.password && formData.confirmPassword && 
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              }
            </div>
            
            <button 
              type="submit" 
              className="w-full py-2 bg-emerald-600 text-white border-none rounded-lg text-base font-medium cursor-pointer hover:bg-emerald-700 disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
            
            <div className="mt-6 text-sm text-slate-500 text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-600 font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;