/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../styles/Login.module.css';
import stylesHeader from '../../styles/Home.module.css';
import userService from '../../services/user.service'

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

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
        }
    };
  

  return (
    <div className={styles.background}>
        <div className={stylesHeader.headerContainer}>
        <header className={stylesHeader.navbarHeader}>
        <div className={stylesHeader.headerLeft}>
          
          <h1 className={stylesHeader.appTitleNavbar}>LinguaChat</h1>
        </div>
    
      </header>
      </div>
    

    <div className={styles.container}>
        
    
    
      <div className={styles.loginCard}>
      <h1 className={styles.appTitle}>Sign in</h1>
        <div className={styles.tagline}>Start your language learning journey</div>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.inputLabel}>username</label>
            <input
              id="username"
              type="username"
              className={styles.inputField}
              placeholder="John"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.inputLabel}>Password</label>
            <input
              id="password"
              type="password"
              className={styles.inputField}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.forgotPassword}>
            <Link href="/forgot-password">
              Forgot password?
            </Link>
          </div>
          
          <button type="submit" className={styles.loginButton}>
            Continue
          </button>
          
          <div className={styles.signupPrompt}>Dont have an account?{' '}
            <Link href="/signup" className={styles.signupLink}>
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