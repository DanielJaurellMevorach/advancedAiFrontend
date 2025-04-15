import { useRouter } from 'next/router';
import React, { useState, useRef, useEffect } from 'react';
import service from '@/services/voiceChatService';
import useSWR from 'swr';

type Message = {
  sender: 'you' | 'bot';
  text?: string;
};


const ItemPage: React.FC = () => {
  const router = useRouter();
  const  id  = router.query.id;

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
          messages.push({ sender: 'you', text: msg.prompt });
        }

        if (msg.content) {
          messages.push({ sender: 'bot', text: msg.content });
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
      formData.append('username', 'admin'); // this should change
  
      
    
      try {
        const response = await fetch('http://localhost:3000/voiceMessage/ask', {
          method: 'POST',
          body: formData,
        });
    
        const newData = await response.json();
        const reply = newData.response;

        
    
        setMessages((prev) => [...prev, { sender: 'you', text: reply.userSentence }]);
        setMessages((prev) => [...prev, { sender: 'bot', text: reply.followupQuestion }]);

      } catch (err) {
        console.error('Error sending voice message:', err);
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Failed to get a reply.' }]);
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

  return (
    <div>
      <h1>Chat with ID {id}</h1>
      {isLoading && <p>Loading messages...</p>}
      {error && <p style={{ color: 'red' }}>Error loading messages.</p>}
      <div>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <strong>{msg.sender === 'you' ? 'You' : 'Bot'}:</strong>
    
              <span> {msg.text}</span>
          </div>
        ))}
      </div>
      <div>
        <button onClick={recording ? stopRecording : startRecording}>
          {recording ? 'Stop' : 'Record'}
        </button>
      </div>
    </div>
  );
};

export default ItemPage;