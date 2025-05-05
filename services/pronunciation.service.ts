const createPronunciation = async (transcript: string, audioFile: Blob) => {
  const formData = new FormData();
  formData.append("audio", audioFile, "transcript.webm"); // name must match `upload.single('audio')`
  formData.append("transcript", transcript);

  const response = await fetch(`http://localhost:5000/score`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create pronunciation");
  }

  return response.json();
};

const getPronunciations = async () => {
  const response = await fetch(`http://localhost:5000/`);

  if (!response.ok) {
    throw new Error("Failed to fetch pronunciation");
  }

  return response.json();
};

const getTimelinePhoto = async (id: string) => {
  const response = await fetch(
    `http://localhost:5000/get-timeline?path=audio/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch timeline photo");
  }

  //   returns a png image
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  return url;
};

const pronunciationService = {
  createPronunciation,
  getPronunciations,
  getTimelinePhoto,
};

export default pronunciationService;
