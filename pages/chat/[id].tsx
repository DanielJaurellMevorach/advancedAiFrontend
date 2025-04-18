import { useRouter } from 'next/router';
import React, { useState, useRef, useEffect } from 'react';
import service from '@/services/voiceChatService';
import useSWR from 'swr';

type Message = {
  sender: 'You' | 'Bot' | 'Error' | 'Correction';
  text?: string;
  correct?: boolean;
};

const ItemPage: React.FC = () => {
  const router = useRouter();
  const id = router.query.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const shouldFetch = typeof id === 'string';

  const { data, isLoading, error } = useSWR(
    shouldFetch ? ['fetcherMessages', id] : null,
    () => service.getAllMessages(id! as string).then((res) => res.json())
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

  const startRecording = async () => {
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
      formData.append('chatId', id as string);
      formData.append('username', 'admin'); // change later

      try {
        const response = await fetch('http://localhost:3000/voiceMessage/ask', {
          method: 'POST',
          body: formData,
        });

        const newData = await response.json();
        const reply = newData.response;

        if (reply.correction.descriptionOfAllMistakes === '') {
          setMessages((prev) => [
            ...prev,
            { sender: 'You', text: reply.userSentence, correct: reply.correction.correctSentence },
            { sender: 'Bot', text: reply.followupQuestion }
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { sender: 'You', text: reply.userSentence, correct: reply.correction.correctSentence },
            { sender: 'Error', text: reply.correction.descriptionOfAllMistakes },
            { sender: 'Correction', text: reply.correction.correctionOfEntireSentence },
            { sender: 'Bot', text: reply.followupQuestion }
          ]);
        }
      } catch (err) {
        console.error('Error sending voice message:', err);
        setMessages((prev) => [...prev, { sender: 'Bot', text: 'Failed to get a reply.' }]);
      }
    };

    mediaRecorder.start();
    setRecording(true);
    mediaRecorderRef.current = mediaRecorder;
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const getBubbleStyle = (msg: Message): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '8px 12px',
      borderRadius: '10px',
      marginBottom: '10px',
      display: 'inline-block',
      maxWidth: '80%',
      color: '#000000',
      backgroundColor: 'transparent',
    };
  
    if (msg.sender === 'Error') {
      return {
        ...baseStyle,
        backgroundColor: '#ffe4e6',
        color: '#b91c1c',
      };
    }
  
    if (msg.sender === 'Correction') {
      return {
        ...baseStyle,
        backgroundColor: '#ecfdf5',
        color: 'green',
      };
    }
  
    if (msg.sender === 'You' && msg.correct === false) {
      return {
        ...baseStyle,
        color: '#ef4444',
      };
    }
  
    return baseStyle;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '20px' }}>Chat with ID {id}</h1>
      {isLoading && <p>Loading messages...</p>}
      {error && <p style={{ color: 'red' }}>Error loading messages.</p>}
      <div>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '15px' }}>
            <strong>{msg.sender}:</strong>
            <div style={getBubbleStyle(msg)}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={recording ? stopRecording : startRecording}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: recording ? '#ef4444' : '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {recording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>
    </div>
  );
};

export default ItemPage;
