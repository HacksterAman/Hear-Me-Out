import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

// Audio feedback utilities
const playTone = (frequency, duration, type = 'sine') => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

const vibrate = (pattern) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// Audio format detection
const getSupportedMimeType = () => {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/m4a',
    'audio/ogg;codecs=opus',
    'audio/wav'
  ];
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
};

// Audio constraints for recording
const AUDIO_CONSTRAINTS = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100
  }
};

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [micPermissionStatus, setMicPermissionStatus] = useState('unknown'); // 'unknown', 'granted', 'denied', 'prompt'
  
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const synthRef = useRef(window.speechSynthesis);
  const streamRef = useRef(null);

  // Check microphone permission status on mount (without requesting)
  useEffect(() => {
    const checkPermission = async () => {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia is not supported in this browser');
        setMicPermissionStatus('denied');
        setStatus('Browser not supported');
        speak('Your browser does not support microphone access. Please use a modern browser.');
        return;
      }

      // Only check permission status, don't request (mobile browsers require user gesture)
      try {
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const result = await navigator.permissions.query({ name: 'microphone' });
            setMicPermissionStatus(result.state);
            
            if (result.state === 'granted') {
              setMicPermissionGranted(true);
            }
            
            // Listen for permission changes
            result.onchange = () => {
              setMicPermissionStatus(result.state);
              setMicPermissionGranted(result.state === 'granted');
            };
          } catch (permError) {
            // Permissions API might not work on all browsers (especially iOS)
            console.log('Permissions API not available, will request on first button press');
            setMicPermissionStatus('prompt');
          }
        } else {
          // Permissions API not available - will request on first button press
          console.log('Permissions API not available, will request on first button press');
          setMicPermissionStatus('prompt');
        }
      } catch (error) {
        console.log('Permission check not available:', error);
        setMicPermissionStatus('prompt');
      }
    };
    
    checkPermission();
  }, []);

  // WebSocket connection setup
  useEffect(() => {
    const getBackendUrl = () => {
      if (process.env.REACT_APP_BACKEND_URL) {
        return process.env.REACT_APP_BACKEND_URL;
      }
      const hostname = window.location.hostname;
      return (hostname === 'localhost' || hostname === '127.0.0.1') 
        ? 'http://localhost:5000' 
        : `http://${hostname}:5000`;
    };
    
    const backendUrl = getBackendUrl();
    console.log('Connecting to backend at:', backendUrl);
    const socket = io(backendUrl);
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus('Connected');
      setStatus('Ready to listen');
      playTone(440, 0.2);
      vibrate(100);
      
      // Announce connection and mic status
      if (micPermissionStatus === 'granted') {
        speak('Connected. Microphone ready. Press and hold the button to speak.');
      } else {
        speak('Connected. Press the button to allow microphone access.');
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus('Disconnected');
      setStatus('Disconnected');
      playTone(220, 0.3);
    });
    
    socket.on('text_response', (data) => {
      console.log('Received response:', data.text);
      setIsProcessing(false);
      setStatus('Speaking response');
      playTone(660, 0.2);
      vibrate([100, 50, 100]);
      speak(data.text);
    });
    
    socket.on('error', (data) => {
      console.error('Error:', data.message);
      setIsProcessing(false);
      setStatus('Error occurred');
      playTone(200, 0.5);
      vibrate([200, 100, 200]);
      speak('Sorry, there was an error. Please try again.');
    });
    
    return () => {
      socket.disconnect();
    };
  }, [micPermissionStatus]);

  // Text-to-speech
  const speak = (text) => {
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onend = () => {
      setStatus('Ready to listen');
      playTone(440, 0.1);
    };
    synthRef.current.speak(utterance);
  };

  // Request microphone permission using getUserMedia
  const requestMicPermission = async () => {
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errorMessage = 'Your browser does not support microphone access. Please use a modern browser like Chrome, Firefox, or Safari.';
      setStatus('Browser not supported');
      playTone(200, 0.5);
      vibrate([200, 100, 200]);
      speak(errorMessage);
      return false;
    }

    try {
      setStatus('Requesting microphone access...');
      playTone(400, 0.2);
      
      // Use navigator.mediaDevices.getUserMedia() to request permission
      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
      streamRef.current = stream;
      setMicPermissionGranted(true);
      setMicPermissionStatus('granted');
      setStatus('Microphone ready');
      playTone(550, 0.2);
      vibrate(100);
      speak('Microphone access granted. You can now record your voice.');
      
      // Stop the stream - we'll get it again when recording
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      setMicPermissionGranted(false);
      
      let errorMessage = 'Could not access microphone. ';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setMicPermissionStatus('denied');
        errorMessage += 'Please allow microphone access in your browser settings and try again.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += 'No microphone found. Please connect a microphone.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += 'Microphone is being used by another app. Please close other apps and try again.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += 'Microphone constraints could not be satisfied. Please try again.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      setStatus('Microphone error');
      playTone(200, 0.5);
      vibrate([200, 100, 200]);
      speak(errorMessage);
      return false;
    }
  };

  // Start recording
  const startRecording = async () => {
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errorMessage = 'Your browser does not support microphone recording. Please use a modern browser.';
      setStatus('Browser not supported');
      playTone(200, 0.5);
      speak(errorMessage);
      return;
    }

    try {
      // Always request/get stream - this will trigger permission prompt on mobile if needed
      // Mobile browsers require user gesture (button press) to show permission prompt
      setStatus('Requesting microphone access...');
      playTone(400, 0.2);
      
      // Use navigator.mediaDevices.getUserMedia() - this will show permission prompt on mobile
      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
      
      // Permission granted - update state
      setMicPermissionGranted(true);
      setMicPermissionStatus('granted');
      streamRef.current = stream;
      
      setStatus('Starting recording...');
      
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      
      if (!mediaRecorder || mediaRecorder.state === undefined) {
        throw new Error('MediaRecorder not supported. Please use a different browser.');
      }
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setStatus('Recording error');
        playTone(200, 0.5);
        vibrate(300);
      };
      
      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const blobType = mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
          sendAudio(audioBlob, blobType);
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorder.start(100);
      setIsRecording(true);
      setStatus('Listening...');
      playTone(550, 0.15);
      vibrate(50);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      
      // Handle permission errors
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setStatus('Permission denied');
        setMicPermissionGranted(false);
        setMicPermissionStatus('denied');
        playTone(200, 0.5);
        vibrate([200, 100, 200]);
        speak('Microphone permission was denied. Please allow microphone access in your browser settings and try again.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setStatus('No microphone found');
        playTone(200, 0.5);
        vibrate(300);
        speak('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setStatus('Microphone in use');
        playTone(200, 0.5);
        vibrate(300);
        speak('Microphone is being used by another app. Please close other apps and try again.');
      } else {
        setStatus('Recording error');
        playTone(200, 0.5);
        vibrate(300);
        speak(`Could not start recording. ${error.message || 'Please try again.'}`);
      }
      
      // Clean up any partial stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setIsProcessing(true);
        setStatus('Processing...');
        playTone(500, 0.15);
        vibrate(50);
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
        setStatus('Error stopping recording');
        playTone(200, 0.3);
      }
    }
  };

  // Send audio to server
  const sendAudio = (audioBlob, mimeType = 'audio/webm') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result;
      console.log('Sending audio:', 'Type:', mimeType, 'Size:', audioBlob.size);
      socketRef.current.emit('audio_message', {
        audio: base64Audio,
        mimeType: mimeType
      });
    };
    reader.onerror = () => {
      console.error('Error reading audio file');
      setIsProcessing(false);
      setStatus('Error reading audio');
      playTone(200, 0.5);
      speak('Error processing audio. Please try again.');
    };
    reader.readAsDataURL(audioBlob);
  };

  // Event handlers
  const handleButtonPress = () => {
    if (!isProcessing) {
      startRecording();
    }
  };

  const handleButtonRelease = () => {
    stopRecording();
  };

  const handleRequestPermission = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await requestMicPermission();
  };

  return (
    <div className="App">
      <div className="container">
        <h1 className="sr-only">Hear Me Out - Voice Assistant</h1>
        
        <div className="status-bar" aria-live="polite" aria-atomic="true">
          <span className="connection-status">{connectionStatus}</span>
          <span className="app-status">{status}</span>
        </div>
        
        <div className="button-container">
          <button
            className={`talk-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
            onMouseDown={handleButtonPress}
            onMouseUp={handleButtonRelease}
            onMouseLeave={handleButtonRelease}
            onTouchStart={handleButtonPress}
            onTouchEnd={handleButtonRelease}
            disabled={isProcessing}
            aria-label={isRecording ? 'Recording - Release to send' : isProcessing ? 'Processing your message' : 'Press and hold to speak'}
          >
            <span className="button-text">
              {isRecording ? 'LISTENING' : isProcessing ? 'THINKING' : 'PRESS & HOLD TO TALK'}
            </span>
          </button>
        </div>
        
        <div className="instructions" aria-live="polite">
          {micPermissionStatus === 'denied' && (
            <div className="permission-section">
              <p className="permission-warning">
                ⚠️ Microphone access denied. Please allow access in browser settings.
              </p>
              <button 
                className="permission-button"
                onClick={handleRequestPermission}
                aria-label="Request microphone permission"
              >
                Request Permission
              </button>
            </div>
          )}
          {(micPermissionStatus === 'prompt' || micPermissionStatus === 'unknown') && !micPermissionGranted && !isRecording && !isProcessing && (
            <p className="permission-info">
              Press and hold the button to allow microphone access and start recording.
            </p>
          )}
          {micPermissionStatus === 'granted' && !isRecording && !isProcessing && (
            <p>Press and hold the button to record your voice</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
