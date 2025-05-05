import pronunciationService from "@/services/pronunciation.service";
import React, { useEffect, useRef, useState } from "react";

const Pronunciation: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSentence, setCurrentSentence] = useState<string>("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult>();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const arrayOfSentences = [
    `A lonely star fell from the sky, landing in a quiet meadow.
     It whispered dreams of the universe to the flowers below.`,
  
    `A young boy found a key buried in the sand.
     It unlocked a door to a world filled with endless adventures.`,
  
    `A cat chased a butterfly through a magical forest.
     Each step turned the ground into a carpet of blooming flowers.`,
  
    `A fisherman caught a golden fish that granted him one wish.
     He wished for happiness, and the fish smiled as it swam away.`,
  
    `A curious fox followed a glowing trail of mushrooms.
     It led to a hidden meadow where the stars touched the earth.`,
  
    `A girl planted a single seed in her barren garden.
     By morning, it had grown into a tree filled with golden fruit.`,
  
    `A knight ventured into a cave to find a lost treasure.
     Instead, he found a mirror that reflected his truest self.`
  ];

  type ScoreResult =  {
    phoneme_feedback: {
      phoneme: string;
      grade: string;
      tip?: string;
    }[];
    word_feedback: {
      word: string;
      avg_score: number;
      feedback: string[];
    }[];
    phoneme_timeline?: string;
  }

  // Get a random sentence when the component loads
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * arrayOfSentences.length);
    setCurrentSentence(arrayOfSentences[randomIndex]);
  }, []);

  // Check for media permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setPermissionGranted(true);
        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.error("Error checking microphone permissions:", err);
        setError(
          "Microphone permission denied. Please allow microphone access."
        );
        setPermissionGranted(false);
      }
    };

    checkPermissions();

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Reset states
      setAudioURL(null);
      setAudioBlob(null);
      setRecordingTime(0);
      setScoreResult({
        phoneme_feedback: [],
        word_feedback: [],
        phoneme_timeline: undefined
      });
      
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const newAudioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(newAudioBlob);
        setAudioURL(url);
        setAudioBlob(newAudioBlob);

        // Release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(
        "Could not start recording. Please check microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (!audioBlob) {
      setError("No recording available. Please record yourself first.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await pronunciationService.createPronunciation(
        // currentSentence, remove any symbols (, . , ! ?:) and turn to uppercase
        currentSentence.replace(/[.,!?]/g, "").toUpperCase(),
        audioBlob
      );
      setScoreResult(result);
      
      // Get next sentence
      const randomIndex = Math.floor(Math.random() * arrayOfSentences.length);
      setCurrentSentence(arrayOfSentences[randomIndex]);
      
    } catch (err) {
      console.error("Error submitting pronunciation:", err);
      setError("Failed to submit your pronunciation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNextSentence = () => {
    // Clear previous recording
    setAudioURL(null);
    setAudioBlob(null);
    setScoreResult({
      phoneme_feedback: [],
      word_feedback: [],
      phoneme_timeline: undefined
    });
    
    // Get next random sentence
    const randomIndex = Math.floor(Math.random() * arrayOfSentences.length);
    setCurrentSentence(arrayOfSentences[randomIndex]);
  };

  return (
    <div className="min-h-screen bg-white p-4">
      {/* <div className="max-w-md mx-auto"> increase width */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-emerald-600 mb-6">
          Pronunciation Practice
        </h1>

        <div className="bg-white rounded-xl shadow-md p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* Sentence to read */}
          <div className="mb-8 p-4 bg-emerald-50 rounded-lg">
            <h2 className="text-sm uppercase font-medium text-emerald-700 mb-2">Read aloud:</h2>
            <p className="text-lg text-slate-800">{currentSentence}</p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Recording status indicator */}
            <div className="flex items-center justify-center w-32 h-32 rounded-full bg-gray-100">
              {isRecording ? (
                <div className="w-16 h-16 rounded-full bg-red-500 animate-pulse flex items-center justify-center text-white">
                  <span className="text-xs font-medium">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              )}
            </div>

            {/* Recording controls */}
            <div className="flex space-x-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={!permissionGranted}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg"
                >
                  Stop Recording
                </button>
              )}
            </div>

            {/* Audio playback */}
            {audioURL && (
              <div className="w-full mt-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Your Recording
                </h3>
                <audio controls className="w-full" src={audioURL}>
                  Your browser does not support the audio element.
                </audio>
                
                {/* Submit button */}
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !audioBlob}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex-1"
                  >
                    {isSubmitting ? "Analyzing..... this can take up to 3 minutes" : "Submit Pronunciation"}
                  </button>
                  
                  <button
                    onClick={getNextSentence}
                    className="px-6 py-2 bg-slate-600 text-white rounded-lg"
                  >
                    Next Sentence
                  </button>
                </div>
              </div>
            )}

            {/* Score result */}
            {scoreResult && (
              <div className="w-full mt-6 overflow-hidden bg-white rounded-xl shadow-md">
                {/* Header with overall assessment */}
                <div className="p-4 bg-emerald-50 border-b border-emerald-100">
                  <h3 className="text-xl font-semibold text-emerald-700 mb-1">Pronunciation Feedback</h3>
                  <p className="text-sm text-emerald-600">Your spoken English assessment</p>
                </div>
                
                {/* Overall average score */}
                <div className="p-5 flex items-center justify-between bg-white border-b border-gray-100">
                  <div>
                    <h4 className="text-lg font-medium text-slate-800">Overall Score</h4>
                    <p className="text-sm text-slate-500">Based on phoneme accuracy</p>
                  </div>
                  <div className="flex items-center">
                    {/* Calculate average score from phoneme_feedback */}
                    {(() => {
                      // Add null checking here
                      if (!scoreResult?.phoneme_feedback?.length) {
                        return <span className="text-3xl font-bold text-gray-400">-</span>;
                      }
                      
                      const avgScore = scoreResult.phoneme_feedback.reduce(
                        (sum, p) => sum + p.score, 0
                      ) / scoreResult.phoneme_feedback.length;
                      
                      // Determine color based on score
                      const scoreColor = 
                        avgScore > 0.7 ? "text-emerald-600" : 
                        avgScore > 0.5 ? "text-amber-500" : 
                        "text-red-500";
                        
                      return (
                        <span className={`text-3xl font-bold ${scoreColor}`}>
                          {(avgScore * 100).toFixed(1)}%
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Word Feedback Section */}
                <div className="p-5 border-b border-gray-100">
                  <h4 className="text-md font-semibold text-slate-800 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Word Feedback
                  </h4>
                  
                  <div className="space-y-3">
                    {scoreResult.word_feedback
                      .sort((a, b) => a.avg_score - b.avg_score) // Sort by score ascending (show problems first)
                      .map((word, index) => {
                        // Color coding based on score
                        const scoreColor = 
                          word.avg_score > 0.7 ? "bg-emerald-100 text-emerald-800" : 
                          word.avg_score > 0.5 ? "bg-amber-100 text-amber-800" : 
                          "bg-red-100 text-red-800";
                          
                        return (
                          <div key={index} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-slate-800">{word.word}</h5>
                              <span className={`text-sm px-2 py-1 rounded-full ${scoreColor}`}>
                                Score: {(word.avg_score * 100).toFixed(0)}%
                              </span>
                            </div>
                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                              {word.feedback.map((feedback, idx) => (
                                <li key={idx} className="leading-relaxed">{feedback}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                  </div>
                </div>
                
                {/* Phoneme Details */}
                <div className="p-5 border-b border-gray-100">
                  <h4 className="text-md font-semibold text-slate-800 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Phoneme Details
                  </h4>
                  
                  <div className="overflow-y-auto max-h-72 pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {scoreResult.phoneme_feedback.map((phoneme, index) => {
                        const gradeColors = {
                          "very good": "bg-emerald-100 text-emerald-800",
                          "good": "bg-green-100 text-green-800",
                          "borderline": "bg-amber-100 text-amber-800",
                          "poor": "bg-red-100 text-red-800"
                        };
                        const gradeColor = gradeColors[phoneme.grade] || "bg-gray-100 text-gray-800";
                        
                        return (
                          <div key={index} className="p-2 border border-gray-100 rounded-md bg-white">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-700">{phoneme.phoneme}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${gradeColor}`}>
                                {phoneme.grade}
                              </span>
                            </div>
                            {phoneme.tip && (
                              <p className="text-xs mt-1 text-slate-600">{phoneme.tip}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Phoneme Timeline */}
                {scoreResult.phoneme_timeline && (
                  <div className="p-5">
                    <h4 className="text-md font-semibold text-slate-800 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3m0 0l3 3m-3-3v12m6-6l3 3m0 0l3-3m-3 3V6" />
                      </svg>
                      Phoneme Timeline
                    </h4>
                    <div className="rounded-lg overflow-hidden bg-white border border-gray-200">
                      <img
                        src={"http://localhost:5000/get-timeline?path=audio/"+scoreResult.phoneme_timeline.replace(/\\/g, "/").replace("audio/", "")}
                        alt="Phoneme Timeline Visualization"
                        className="w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pronunciation;

/*
score response body: 
{"duration_comparison":null,"phoneme_feedback":[{"confidence":0.8932674527168274,"end":1.67,"grade":"borderline","phoneme":"P","score":0.45239943265914917,"start":1.59,"tip":"Close both lips then release with a small burst. Examples: 'pen', 'cup'. Common error: Aspirating too strongly—keep it light."},{"confidence":0.6720092296600342,"end":1.74,"grade":"borderline","phoneme":"IY1","score":0.4173813462257385,"start":1.67,"tip":""},{"confidence":0.9118883609771729,"end":1.78,"grade":"good","phoneme":"T","score":0.5625560879707336,"start":1.74,"tip":"Place tongue tip behind your upper teeth ridge, then release. Examples: 'top', 'cat'. Common error: Using too much aspiration—release gently."},{"confidence":0.9741783142089844,"end":1.81,"grade":"borderline","phoneme":"ER0","score":0.4863610863685608,"start":1.78,"tip":""},{"confidence":0.9998089671134949,"end":1.99,"grade":"borderline","phoneme":"P","score":0.46789613366127014,"start":1.96,"tip":"Close both lips then release with a small burst. Examples: 'pen', 'cup'. Common error: Aspirating too strongly—keep it light."},{"confidence":0.999281108379364,"end":2.12,"grade":"good","phoneme":"AY1","score":0.669439435005188,"start":1.99,"tip":""},{"confidence":0.9632189273834229,"end":2.16,"grade":"borderline","phoneme":"P","score":0.45702919363975525,"start":2.12,"tip":"Close both lips then release with a small burst. Examples: 'pen', 'cup'. Common error: Aspirating too strongly—keep it light."},{"confidence":0.9655446410179138,"end":2.3,"grade":"borderline","phoneme":"ER0","score":0.5348254442214966,"start":2.16,"tip":""},{"confidence":0.8723538517951965,"end":2.41,"grade":"borderline","phoneme":"P","score":0.4215909242630005,"start":2.3,"tip":"Close both lips then release with a small burst. Examples: 'pen', 'cup'. Common error: Aspirating too strongly—keep it light."},{"confidence":0.9146836996078491,"end":2.53,"grade":"good","phoneme":"IH1","score":0.5594915151596069,"start":2.41,"tip":""},{"confidence":0.9757745265960693,"end":2.56,"grade":"borderline","phoneme":"K","score":0.4514507055282593,"start":2.53,"tip":"Raise the back of your tongue to the soft palate, then release. Examples: 'key', 'back'. Common error: Not releasing fully—feel the puff of air."},{"confidence":0.9659387469291687,"end":2.59,"grade":"borderline","phoneme":"T","score":0.45086702704429626,"start":2.56,"tip":"Place tongue tip behind your upper teeth ridge, then release. Examples: 'top', 'cat'. Common error: Using too much aspiration—release gently."},{"confidence":0.9246917366981506,"end":2.72,"grade":"good","phoneme":"AH0","score":0.5954025983810425,"start":2.59,"tip":""},{"confidence":0.99069744348526,"end":2.84,"grade":"good","phoneme":"P","score":0.5907784700393677,"start":2.76,"tip":"Close both lips then release with a small burst. Examples: 'pen', 'cup'. Common error: Aspirating too strongly—keep it light."},{"confidence":0.9987537860870361,"end":2.93,"grade":"good","phoneme":"EH1","score":0.5981428623199463,"start":2.84,"tip":""},{"confidence":0.8551110625267029,"end":2.98,"grade":"borderline","phoneme":"K","score":0.42158085107803345,"start":2.93,"tip":"Raise the back of your tongue to the soft palate, then release. Examples: 'key', 'back'. Common error: Not releasing fully—feel the puff of air."},{"confidence":0.9999687075614929,"end":3.41,"grade":"good","phoneme":"AH1","score":0.6068887114524841,"start":3.31,"tip":""},{"confidence":0.9500822424888611,"end":3.54,"grade":"very good","phoneme":"V","score":0.7857409119606018,"start":3.41,"tip":"Touch bottom lip to upper teeth and voice. Examples: 'very', 'love'. Common error: Making it /w/—feel the vibration."},{"confidence":0.9998560547828674,"end":3.6,"grade":"borderline","phoneme":"P","score":0.5060973167419434,"start":3.54,"tip":"Close both lips then release with a small burst. Examples: 'pen', 'cup'. Common error: Aspirating too strongly—keep it light."},{"confidence":0.9341710209846497,"end":3.68,"grade":"borderline","phoneme":"IH1","score":0.4970322549343109,"start":3.6,"tip":""},{"confidence":0.9521058797836304,"end":3.72,"grade":"borderline","phoneme":"K","score":0.44248828291893005,"start":3.68,"tip":"Raise the back of your tongue to the soft palate, then release. Examples: 'key', 'back'. Common error: Not releasing fully—feel the puff of air."},{"confidence":0.9841834902763367,"end":3.76,"grade":"borderline","phoneme":"AH0","score":0.5030876398086548,"start":3.72,"tip":""},{"confidence":0.9635740518569946,"end":3.79,"grade":"borderline","phoneme":"L","score":0.46979475021362305,"start":3.76,"tip":"Tongue tip on ridge and voice. Examples: 'light', 'feel'. Common error: Velarized /l/ everywhere—use light /l/ initially."},{"confidence":0.9495604038238525,"end":3.87,"grade":"borderline","phoneme":"D","score":0.4618287980556488,"start":3.79,"tip":"Place tongue tip behind the ridge and voice on release. Examples: 'dog', 'mad'. Common error: Dropping the tongue—keep contact until release."},{"confidence":0.9666507840156555,"end":3.93,"grade":"borderline","phoneme":"P","score":0.5114516615867615,"start":3.87,"tip":"Close both lips then release with a small burst. Examples: 'pen', 'cup'. Common error: Aspirating too strongly—keep it light."},{"confidence":0.9995464086532593,"end":4.01,"grade":"borderline","phoneme":"EH1","score":0.5347014665603638,"start":3.93,"tip":""},{"confidence":0.9956062436103821,"end":4.07,"grade":"borderline","phoneme":"P","score":0.47043558955192566,"start":4.01,"tip":"Close both lips then release with a small burst. Examples: 'pen', 'cup'. Common error: Aspirating too strongly—keep it light."},{"confidence":0.9608883261680603,"end":4.24,"grade":"borderline","phoneme":"ER0","score":0.5347422361373901,"start":4.07,"tip":""},{"confidence":0.9962447881698608,"end":4.41,"grade":"very good","phoneme":"Z","score":0.7659106254577637,"start":4.24,"tip":"Same as /s/ but voice. Examples: 'zoo', 'lazy'. Common error: Leaving out voice—feel the buzz."}],"phoneme_timeline":".\\audio\\1746400779\\phoneme_timeline.png","word_feedback":[{"avg_score":0.47085004299879074,"feedback":["Your /p/ sound in 'picked' scored 0.42. Close both lips then release with a small burst. Examples: 'pen', 'cup'. Common error: Aspirating too strongly—keep it light.","Your /t/ sound in 'picked' scored 0.45. Place tongue tip behind your upper teeth ridge, then release. Examples: 'top', 'cat'. Common error: Using too much aspiration—release gently."],"word":"picked"},{"avg_score":0.47967448830604553,"feedback":["Your /IY1/ sound in 'peter' scored 0.42. ","Your /p/ sound in 'peter' scored 0.45. Close both lips then release with a small burst. Examples: 'pen', 'cup'. Common error: Aspirating too strongly—keep it light."],"word":"peter"},{"avg_score":0.4800548404455185,"feedback":["Your /k/ sound in 'pickled' scored 0.44. Raise the back of your tongue to the soft palate, then release. Examples: 'key', 'back'. Common error: Not releasing fully—feel the puff of air.","Your /d/ sound in 'pickled' scored 0.46. Place tongue tip behind the ridge and voice on release. Examples: 'dog', 'mad'. Common error: Dropping the tongue—keep contact until release."],"word":"pickled"},{"avg_score":0.5322975516319275,"feedback":["Your /p/ sound in 'piper' scored 0.46. Close both lips then release with a small burst. Examples: 'pen', 'cup'. Common error: Aspirating too strongly—keep it light.","Your /p/ sound in 'piper' scored 0.47. Close both lips then release with a small burst. Examples: 'pen', 'cup'. Common error: Aspirating too strongly—keep it light."],"word":"piper"},{"avg_score":0.5368340611457825,"feedback":["Your /k/ sound in 'peck' scored 0.42. Raise the back of your tongue to the soft palate, then release. Examples: 'key', 'back'. Common error: Not releasing fully—feel the puff of air.","Your /p/ sound in 'peck' scored 0.59. Close both lips then release with a small burst. Examples: 'pen', 'cup'. Common error: Aspirating too strongly—keep it light."],"word":"peck"},{"avg_score":0.5634483158588409,"feedback":["Your /p/ sound in 'peppers' scored 0.47. Close both lips then release with a small burst. Examples: 'pen', 'cup'. Common error: Aspirating too strongly—keep it light.","Your /p/ sound in 'peppers' scored 0.51. Close both lips then release with a small burst. Examples: 'pen', 'cup'. Common error: Aspirating too strongly—keep it light."],"word":"peppers"},{"avg_score":0.5954025983810425,"feedback":["Your /AH0/ sound in 'a' scored 0.60. "],"word":"a"},{"avg_score":0.696314811706543,"feedback":["Your /AH1/ sound in 'of' scored 0.61. ","Your /v/ sound in 'of' scored 0.79. Touch bottom lip to upper teeth and voice. Examples: 'very', 'love'. Common error: Making it /w/—feel the vibration."],"word":"of"}]}
*/
