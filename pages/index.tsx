import React, { useState } from 'react';
import { Menu, X, MessageSquare, BookOpen, Award, User, Settings } from 'lucide-react';
import styles from '../styles/Home.module.css';

const Home: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('French');
  
  const languages = ['French', 'Spanish', 'Japanese', 'German', 'Italian'];
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={styles.container}>
      {/* Top Navigation */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={toggleMenu} className={styles.menuButton}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className={styles.appTitle}>LinguaChat</h1>
        </div>
        <div className={styles.levelBadge}>
          Level 3
        </div>
      </header>

      {/* Side Menu (mobile overlay) */}
      {isMenuOpen && (
        <div className={styles.menuOverlay} onClick={toggleMenu}>
          <div className={styles.sideMenu} onClick={e => e.stopPropagation()}>
            <div className={styles.menuHeader}>
              <h2 className={styles.menuTitle}>LinguaChat</h2>
              <button onClick={toggleMenu}>
                <X size={20} />
              </button>
            </div>
            <nav>
              <ul className={styles.menuList}>
                <li>
                  <a href="#" className={`${styles.menuItem} ${styles.menuItemActive}`}>
                    <BookOpen size={20} className={styles.menuIcon} />
                    Learn
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.menuItem}>
                    <MessageSquare size={20} className={styles.menuIcon} />
                    Practice
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.menuItem}>
                    <Award size={20} className={styles.menuIcon} />
                    Progress
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.menuItem}>
                    <User size={20} className={styles.menuIcon} />
                    Profile
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.menuItem}>
                    <Settings size={20} className={styles.menuIcon} />
                    Settings
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Language Selector */}
        <div className={styles.languageSelector}>
          {languages.map(language => (
            <button
              key={language}
              className={`${styles.languageButton} ${
                selectedLanguage === language ? styles.languageButtonActive : ''
              }`}
              onClick={() => setSelectedLanguage(language)}
            >
              {language}
            </button>
          ))}
        </div>

        {/* Welcome Section */}
        <div className={styles.welcomeCard}>
          <h2 className={styles.welcomeTitle}>Bonjour! Welcome back</h2>
          <p className={styles.welcomeText}>username, Continue ton aventure en français...</p>
          <button className={styles.practiceButton}>
            Practice Now
          </button>
        </div>

        {/* Quick Actions */}
        <h3 className={styles.sectionTitle}>Quick Start</h3>
        <div className={styles.quickActionsGrid}>
          <div className={styles.actionCard}>
            <MessageSquare size={24} className={styles.actionIcon} />
            <h4 className={styles.actionTitle}>Conversation</h4>
            <p className={styles.actionText}>Practice speaking with AI</p>
          </div>
          <div className={styles.actionCard}>
            <BookOpen size={24} className={styles.actionIcon} />
            <h4 className={styles.actionTitle}>Flashcards</h4>
            <p className={styles.actionText}>Review vocabulary</p>
          </div>
        </div>

        {/* Topics Section */}
        <h3 className={styles.sectionTitle}>Conversation Topics</h3>
        <div className={styles.topicsList}>
          <div className={styles.topicCard}>
            <div>
              <h4 className={styles.topicTitle}>At the Restaurant</h4>
              <p className={styles.topicText}>Order food and drinks</p>
            </div>
            <span className={styles.topicArrow}>→</span>
          </div>
          <div className={styles.topicCard}>
            <div>
              <h4 className={styles.topicTitle}>Travel & Directions</h4>
              <p className={styles.topicText}>Navigate a new city</p>
            </div>
            <span className={styles.topicArrow}>→</span>
          </div>
          <div className={styles.topicCard}>
            <div>
              <h4 className={styles.topicTitle}>Daily Routine</h4>
              <p className={styles.topicText}>Talk about your day</p>
            </div>
            <span className={styles.topicArrow}>→</span>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className={styles.footer}>
        <nav className={styles.bottomNav}>
          <a href="#" className={`${styles.navItem} ${styles.navItemActive}`}>
            <BookOpen size={20} />
            <span className={styles.navLabel}>Learn</span>
          </a>
          <a href="#" className={styles.navItem}>
            <MessageSquare size={20} />
            <span className={styles.navLabel}>Practice</span>
          </a>
          <a href="#" className={styles.navItem}>
            <Award size={20} />
            <span className={styles.navLabel}>Progress</span>
          </a>
          <a href="#" className={styles.navItem}>
            <User size={20} />
            <span className={styles.navLabel}>Profile</span>
          </a>
        </nav>
      </footer>
    </div>
  );
};

export default Home;