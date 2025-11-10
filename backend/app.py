import os
import base64
from flask import Flask, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Configure Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)

# System prompt for assisting blind users
SYSTEM_PROMPT = """You are a compassionate and helpful AI assistant specifically designed to assist blind individuals. 

Your communication style should be:
- Warm, patient, and empathetic
- Clear and concise (keep responses brief and to the point)
- Descriptive when needed, but not overly verbose
- Encouraging and supportive
- Always ready to help with daily tasks, information, or just friendly conversation

Remember:
- The user cannot see, so avoid visual references unless specifically asked
- Speak naturally as if having a friendly conversation
- Be respectful and treat the user with dignity
- Keep responses short (2-3 sentences max) unless more detail is specifically requested
- Always acknowledge their questions or requests before providing help

You are here to make their day easier and brighter."""

# Store conversation history per session
conversations = {}

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    # Initialize conversation for this session
    conversations[request.sid] = []
    emit('connected', {'data': 'Connected to Hear Me Out server'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')
    # Clean up conversation history
    if request.sid in conversations:
        del conversations[request.sid]

@socketio.on('audio_message')
def handle_audio_message(data):
    try:
        print(f"Received audio from {request.sid}")
        
        # Get audio data (base64 encoded)
        audio_data = data.get('audio')
        if not audio_data:
            emit('error', {'message': 'No audio data received'})
            return
        
        # Get MIME type from client, default to webm
        mime_type = data.get('mimeType', 'audio/webm')
        print(f"Audio MIME type: {mime_type}")
        
        # Remove data URL prefix if present
        if ',' in audio_data:
            audio_data = audio_data.split(',')[1]
        
        # Decode base64 audio
        audio_bytes = base64.b64decode(audio_data)
        print(f"Audio size: {len(audio_bytes)} bytes")
        
        # Map MIME types to Gemini-supported formats
        # Gemini supports: audio/mp3, audio/mpeg, audio/mp4, audio/wav, audio/webm, audio/aac, audio/ogg, audio/flac
        mime_type_lower = mime_type.lower()
        if 'm4a' in mime_type_lower or 'mp4' in mime_type_lower:
            gemini_mime_type = 'audio/mp4'
        elif 'ogg' in mime_type_lower:
            gemini_mime_type = 'audio/ogg'
        elif 'wav' in mime_type_lower:
            gemini_mime_type = 'audio/wav'
        elif 'webm' in mime_type_lower:
            gemini_mime_type = 'audio/webm'
        else:
            gemini_mime_type = 'audio/webm'  # Default fallback
        
        print(f"Using Gemini MIME type: {gemini_mime_type}")
        
        # Create a model that supports audio input
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Get conversation history for this session
        history = conversations.get(request.sid, [])
        
        # Prepare the prompt with system instructions
        if len(history) == 0:
            # First message - include system prompt
            prompt_parts = [
                SYSTEM_PROMPT,
                "\n\nUser's voice message:",
                {
                    "mime_type": gemini_mime_type,
                    "data": audio_bytes
                }
            ]
        else:
            # Subsequent messages - just the audio
            prompt_parts = [
                {
                    "mime_type": gemini_mime_type,
                    "data": audio_bytes
                }
            ]
        
        # Generate response
        print("Generating response from Gemini...")
        response = model.generate_content(prompt_parts)
        
        response_text = response.text
        print(f"Gemini response: {response_text[:100]}...")
        
        # Store in conversation history
        history.append({
            "role": "user",
            "type": "audio"
        })
        history.append({
            "role": "assistant",
            "content": response_text
        })
        conversations[request.sid] = history
        
        # Send text response back to client for TTS
        emit('text_response', {'text': response_text})
        
    except Exception as e:
        print(f"Error processing audio: {str(e)}")
        emit('error', {'message': f'Error processing your message: {str(e)}'})

@socketio.on('ping')
def handle_ping():
    emit('pong')

if __name__ == '__main__':
    print("Starting Hear Me Out server...")
    print("Make sure GEMINI_API_KEY is set in your .env file")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)

