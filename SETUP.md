# Quick Setup Guide 🚀

## Step-by-Step Setup

### 1. Get Your Gemini API Key
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"
3. Create a new API key
4. Copy the key

### 2. Backend Setup

Open a terminal in the project folder:

```bash
# Go to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Activate it (Mac/Linux)
source venv/bin/activate

# Install packages
pip install -r requirements.txt

# Create .env file
copy .env.example .env     # Windows
cp .env.example .env       # Mac/Linux

# Edit .env and paste your API key
notepad .env               # Windows
nano .env                  # Mac/Linux
```

In the `.env` file, replace `your_gemini_api_key_here` with your actual API key.

### 3. Frontend Setup

Open a NEW terminal in the project folder:

```bash
# Go to frontend folder
cd frontend

# Install packages
npm install
```

### 4. Run the App

**Terminal 1 (Backend):**
```bash
cd backend
venv\Scripts\activate      # Windows (if not activated)
source venv/bin/activate   # Mac/Linux (if not activated)
python app.py
```

You should see: "Starting Hear Me Out server..."

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

Browser will open automatically at `http://localhost:3000`

### 5. Use the App

1. Click "Allow" when asked for microphone permission
2. Wait to hear "Connected"
3. Press and HOLD the big button
4. Speak your message
5. Release the button
6. Listen to the response!

## Troubleshooting

**"GEMINI_API_KEY not found"**
- Make sure you created the `.env` file in the `backend` folder
- Check that you saved the file after editing
- Restart the backend server

**"Cannot access microphone"**
- Click the lock icon in browser address bar
- Allow microphone permissions
- Refresh the page

**"Connection failed"**
- Make sure backend is running first
- Check that port 5000 is not used by another app
- Try restarting both servers

## Quick Commands

```bash
# Start backend (from backend folder)
python app.py

# Start frontend (from frontend folder)
npm start

# Stop any server
Press Ctrl+C
```

Need help? Check the main README.md or open an issue!






