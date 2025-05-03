const getAllUsername = async (username: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/voiceChat/all/username?username=${username}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response;
};

const getAllMessages = async (id: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/voiceChat/all/messages/${id}`, 
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response;
};
  
const createVoiceChat = async (name: string, language: string) => {
  // const token = JSON.parse(localStorage.getItem('loggedInUser') as string).token;
  return await fetch(
    process.env.NEXT_PUBLIC_API_URL + `/voiceChat/create`,
    {
        method:"POST",
        headers:{
            'Content-Type': 'application/json',
            Accept: 'application/json',
            // Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          username: 'admin',
          name,
          language,

        })

  }
);
};

const sendVoiceMessage = async (audioBlob: Blob, chatId: string, username: string) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm'); // name must match `upload.single('audio')`
  formData.append('chatId', chatId);
  formData.append('username', username);

  const response = await fetch('/api/voice/ask', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to send voice message');
  }

  const data = await response.json();
  return data.response;
};

const deleteChat = async (id: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/voiceChat/delete?id=${id}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response;
}


const Service = {
  getAllUsername,
  getAllMessages,
  createVoiceChat,
  sendVoiceMessage,
  deleteChat
};

export default Service;
