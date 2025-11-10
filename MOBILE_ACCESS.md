# 📱 Accessing from Your Phone

## Quick Setup Guide

### Step 1: Find Your Computer's IP Address

**Windows:**
- Double-click `get-ip.bat` in the project folder, OR
- Open Command Prompt and type: `ipconfig`
- Look for "IPv4 Address" (usually starts with 192.168.x.x or 10.x.x.x)

**Mac/Linux:**
- Run: `node get-ip.js` in the project folder, OR
- Open Terminal and type: `ifconfig` or `ip addr`
- Look for your WiFi adapter's IP address

**Example:** Your IP might be something like `192.168.1.105`

### Step 2: Make Sure Both Devices Are on Same Network

- Your computer and phone must be connected to the **same WiFi network**
- They cannot be on different networks

### Step 3: Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```
You should see: "Starting Hear Me Out server..."

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
The React app will start. You'll see a message like:
```
On Your Network:  http://192.168.1.105:3000
```

### Step 4: Open on Your Phone

1. On your phone, open a web browser (Chrome, Safari, etc.)
2. Type in the address bar: `http://YOUR_IP:3000`
   - Replace `YOUR_IP` with the IP address you found in Step 1
   - Example: `http://192.168.1.105:3000`
3. The app should load!

### Step 5: Allow Microphone Permission

**Important**: Microphone permission is requested when you **first press the button** (not on page load).

1. Wait for the "Connected" message
2. **Press and hold the button** - this will trigger the permission request
3. Click **"Allow"** or **"OK"** when your browser asks for microphone access
4. After allowing, the button will work normally

📱 **See `MOBILE_MIC_PERMISSIONS.md` for detailed microphone permission troubleshooting.**

## Troubleshooting 🔧

### "Can't connect" or "Connection failed"

1. **Check Windows Firewall:**
   - Windows might be blocking the connection
   - Go to Windows Defender Firewall → Allow an app
   - Make sure Python and Node.js are allowed
   - Or temporarily disable firewall to test

2. **Verify IP Address:**
   - Make sure you're using the correct IP
   - Run `ipconfig` again to double-check
   - The IP might have changed if you reconnected to WiFi

3. **Check Network:**
   - Both devices must be on the same WiFi
   - Try disconnecting and reconnecting both devices
   - Some public WiFi networks block device-to-device communication

4. **Check Ports:**
   - Make sure nothing else is using ports 3000 or 5000
   - Close other apps that might be using these ports

5. **Try Different Browser:**
   - Some browsers block local network access
   - Try Chrome or Firefox on your phone

### "Microphone not working"

- Make sure you clicked "Allow" when asked for permission
- Check your phone's settings → Apps → Browser → Permissions → Microphone
- Try refreshing the page
- Some browsers require HTTPS for microphone (this won't work on local network)

### Backend Connection Issues

- The frontend automatically detects the server URL
- If you're on your phone at `192.168.1.105:3000`, it will connect to `192.168.1.105:5000`
- Make sure the backend is running and accessible

## Alternative: Use Environment Variable

If auto-detection doesn't work, you can set the backend URL manually:

1. Create `frontend/.env` file:
```
REACT_APP_BACKEND_URL=http://YOUR_IP:5000
```

2. Replace `YOUR_IP` with your computer's IP address

3. Restart the frontend server

## Security Note ⚠️

- This setup is for **local network use only**
- Don't expose these ports to the internet
- Only use on trusted WiFi networks
- For production, use proper security measures

## Quick Commands Reference

```bash
# Find IP (Windows)
ipconfig

# Find IP (Mac/Linux)
ifconfig
# or
ip addr

# Start backend
cd backend
python app.py

# Start frontend (accessible on network)
cd frontend
npm start
```

## Need Help?

- Check that both servers are running
- Verify IP addresses match
- Ensure same WiFi network
- Check firewall settings
- Try restarting both servers

Happy chatting! 🎤

