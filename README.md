# Hear Me Out 🎤

A voice-only chatbot application designed specifically for blind users, powered by Google Gemini AI. Users can simply press and hold a large button to speak, and receive spoken responses.

## Features ✨

- **Voice-Only Interface**: Large push-to-talk button (press & hold)
- **Accessibility First**: Designed for blind users with:
  - Audio feedback (tones for different actions)
  - Haptic feedback (vibrations on mobile devices)
  - Screen reader support
  - Text-to-speech responses
- **Real-time Communication**: WebSocket connection for fast responses
- **AI-Powered**: Google Gemini AI with custom prompt for empathetic assistance
- **Simple & Clean**: Minimal, distraction-free interface

## Tech Stack 🛠

- **Frontend**: React.js
- **Backend**: Flask + Flask-SocketIO
- **AI**: Google Gemini 1.5 Flash
- **Communication**: WebSocket (Socket.IO)
- **Audio**: Web Audio API, MediaRecorder API, Speech Synthesis API

## Prerequisites 📋

- Python 3.8+
- Node.js 16+
- Google Gemini API Key ([Get one here](https://ai.google.dev/))

## Setup Instructions 🚀

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Hear-Me-Out
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file (optional - default is localhost:5000)
cp .env.example .env
```

### 4. Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
# Activate venv if not already activated
python app.py
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

### 5. Using the Application

**On Your Computer:**
1. Open `http://localhost:3000` in your browser
2. Allow microphone permissions when prompted
3. Wait for the "Connected" announcement
4. **Press and hold** the large button
5. Speak your message
6. **Release** the button to send
7. Listen to the AI's response

**On Your Phone (Same WiFi Network):**
1. Find your computer's IP address:
   - **Windows**: Run `get-ip.bat` or `get-ip.ps1` in the project folder
   - **Mac/Linux**: Run `node get-ip.js` or check `ifconfig`
   - Look for an IP like `192.168.1.105`
2. Make sure both servers are running (backend + frontend)
3. On your phone's browser, go to: `http://YOUR_IP:3000`
   - Example: `http://192.168.1.105:3000`
4. Allow microphone permissions
5. Use the app just like on desktop!

📱 **See `MOBILE_ACCESS.md` for detailed mobile setup instructions and troubleshooting.**

## Audio & Haptic Feedback 🔊

- **Connection**: High beep (440 Hz) + single vibration
- **Recording Start**: Medium beep (550 Hz) + short vibration
- **Recording Stop**: Medium beep (500 Hz) + short vibration
- **Response Ready**: Higher beep (660 Hz) + double vibration
- **Error**: Low beep (200 Hz) + long vibration pattern

## Project Structure 📁

```
Hear-Me-Out/
├── backend/
│   ├── app.py              # Flask server with WebSocket
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styles
│   │   ├── index.js       # Entry point
│   │   └── index.css      # Global styles
│   └── package.json       # Node dependencies
├── get-ip.bat             # Windows IP finder script
├── get-ip.ps1             # PowerShell IP finder script
├── get-ip.js              # Node.js IP finder script
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── MOBILE_ACCESS.md      # Mobile access guide
└── README.md             # This file
```

## Accessibility Features ♿

- Large, easy-to-target button (90% of viewport)
- High contrast visual design
- Audio tones for state changes
- Haptic feedback on mobile devices
- Screen reader ARIA labels
- Reduced motion support
- Text-to-speech for all responses
- Voice-first interaction model

## Troubleshooting 🔧

**Microphone not working:**
- Check browser permissions
- Ensure you're using HTTPS (or localhost)
- Try a different browser (Chrome/Edge recommended)

**Connection issues:**
- Verify backend is running on port 5000
- Check firewall settings
- Ensure no other service is using port 5000

**No audio playback:**
- Check system volume
- Enable browser audio permissions
- Try clicking the page first (browser autoplay policy)

**Gemini API errors:**
- Verify API key is correct in `.env`
- Check API quota and billing
- Ensure API is enabled in Google Cloud Console

## API Rate Limits ⚠️

Google Gemini API has rate limits. For production use:
- Consider implementing request queuing
- Add rate limiting on the backend
- Monitor API usage
- Upgrade to paid tier if needed

## Future Enhancements 💡

- Conversation history
- User profiles and preferences
- Multi-language support
- Offline mode with local TTS
- Emergency contact features
- Integration with smart home devices

## License 📄

MIT License - Feel free to use and modify for your needs.

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## Support 💬

For issues and questions, please open an issue on GitHub.

---

