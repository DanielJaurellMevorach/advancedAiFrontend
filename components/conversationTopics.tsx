import React, { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

// Define types for our data
interface VoiceChat {
  id: number;
  name: string;
  createdAt: string;
}

interface Chat {
  id: number;
  createdAt: string;
}

interface ChatsData {
  voiceChats: VoiceChat[];
  chats: Chat[];
}

// Service import
import userService  from '../services/user.service';

const ConversationTopicsSection: React.FC<{ username: string }> = ({ username }) => {
  const [chatsData, setChatsData] = useState<ChatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserChats(username );
        const data = await response.json();
        setChatsData(data);
      } catch (err) {
        setError('Failed to load conversation topics');
        console.error("Failed to load conversation topics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [username]);

  // Format date to display in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div>
        <h3 className={styles.sectionTitle}>Conversation Topics</h3>
        <div className={styles.topicsList}>
          <div className={styles.topicCard}>Loading conversations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3 className={styles.sectionTitle}>Conversation Topics</h3>
        <div className={styles.topicsList}>
          <div className={styles.topicCard}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className={styles.sectionTitle}>Conversation Topics</h3>
      
      {/* Voice Chats Section */}
      {chatsData?.voiceChats && chatsData.voiceChats.length > 0 && (
        <>
          <h4 className={styles.subSectionTitle}>Voice Conversations</h4>
          <div className={styles.topicsList}>
            {chatsData.voiceChats.map((voiceChat) => (
              <div key={voiceChat.id} className={styles.topicCard}>
                <div>
                  <h4 className={styles.topicTitle}>{voiceChat.name || `Voice Chat #${voiceChat.id}`}</h4>
                  <p className={styles.topicText}>Created {formatDate(voiceChat.createdAt)}</p>
                </div>
                <span className={styles.topicArrow}>→</span>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Text Chats Section */}
      {chatsData?.chats && chatsData.chats.length > 0 && (
        <>
          <h4 className={styles.subSectionTitle}>Text Conversations</h4>
          <div className={styles.topicsList}>
            {chatsData.chats.map((chat) => (
              <div key={chat.id} className={styles.topicCard}>
                <div>
                  <h4 className={styles.topicTitle}>Chat #{chat.id}</h4>
                  <p className={styles.topicText}>Created {formatDate(chat.createdAt)}</p>
                </div>
                <span className={styles.topicArrow}>→</span>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Display if no conversations are found */}
      {(!chatsData?.chats?.length && !chatsData?.voiceChats?.length) && (
        <div className={styles.topicsList}>
          <div className={styles.topicCard}>
            <div>
              <h4 className={styles.topicTitle}>No conversations yet</h4>
              <p className={styles.topicText}>Start a new conversation to practice your language skills</p>
            </div>
            <span className={styles.topicArrow}>→</span>
          </div>
        </div>
      )}
      
      {/* Default Topics Section */}
      <h4 className={styles.subSectionTitle}>Suggested Topics</h4>
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
    </div>
  );
};

export default ConversationTopicsSection;