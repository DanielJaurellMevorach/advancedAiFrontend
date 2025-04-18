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
          const description = msg.correction[0].description;
          const corrected = msg.correction[0].correctionOfEntireSentence;

          messages.push({ sender: 'Error', text: description });
          messages.push({ sender: 'Correction', text: corrected });

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
      formData.append('username', 'admin'); // this should change



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

  return (
    <div>
      <h1>Chat with ID {id}</h1>
      {isLoading && <p>Loading messages...</p>}
      {error && <p style={{ color: 'red' }}>Error loading messages.</p>}
      <div>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <strong>{msg.sender} : </strong>


            <span
              style={{
                color:
                  msg.sender === 'Correction'
                    ? 'green'
                    : msg.correct === undefined
                      ? 'inherit'
                      : msg.correct
                        ? '#000000'
                        : '#ef4444',
              }}>{msg.text}
            </span>
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