# Node.js Installation Guide for Zenvora AI Platform

## 🚀 Why Install Node.js?

Node.js enables **real backend functionality** for your Zenvora AI Platform:

- **Real AI code analysis** instead of simulated
- **Live API endpoints** for all tools
- **Professional backend server**
- **Database connectivity**
- **Real-time processing**

---

## **📦 Quick Installation (Recommended)**

### **Method 1: Automated Installer**
1. **Double-click:** `INSTALL_NODEJS.bat`
2. **Follow on-screen instructions**
3. **Restart computer** when prompted
4. **Run:** `FULL_SYSTEM.bat`

### **Method 2: Manual Installation**
1. **Visit:** https://nodejs.org/
2. **Download:** "Node.js LTS" (Long Term Support)
3. **Run:** The downloaded .msi installer
4. **Important:** ✅ Check "Add to PATH" during installation
5. **Restart:** Your computer
6. **Verify:** Open Command Prompt and run `node --version`

---

## **🔧 Installation Steps**

### **Step 1: Download Node.js**
- Go to: https://nodejs.org/
- Click: "Download Node.js LTS" (recommended version)
- Save the .msi file

### **Step 2: Install Node.js**
- Double-click the downloaded .msi file
- Click "Next" through the wizard
- **Important:** Leave "Add to PATH" checked ✅
- Click "Install" and wait for completion
- Click "Finish"

### **Step 3: Verify Installation**
1. **Open Command Prompt** (Win + R, type `cmd`, press Enter)
2. **Run:** `node --version`
3. **Should see:** `v18.x.x` or similar
4. **Also run:** `npm --version`
5. **Should see:** `9.x.x` or similar

### **Step 4: Start Backend**
1. **Double-click:** `FULL_SYSTEM.bat`
2. **Wait for:** Backend server startup
3. **Check for:** "Backend Server" window
4. **Visit:** http://localhost:3001/api/health

---

## **🎯 What Happens After Installation**

### **Backend Server Features:**
- **AI Code Analysis:** Real code processing
- **Code Generation:** Natural language to code
- **Security Scanning:** Vulnerability detection
- **Performance Optimization:** Code analysis
- **Project Management:** Save/load projects
- **User System:** Account management

### **API Endpoints Available:**
- `POST /api/analyze` - AI code analysis
- `POST /api/tools/generate-code` - Code generation
- `POST /api/tools/generate-tests` - Test generation
- `POST /api/tools/security-scan` - Security scanning
- `GET /api/projects` - Project management
- `GET /api/health` - Health check

### **Frontend Integration:**
- **All UI buttons** connect to real APIs
- **Real-time analysis** instead of simulated
- **Live data processing**
- **Professional response times**

---

## **🔍 Troubleshooting**

### **Issue: "node not found"**
**Solution:**
1. Restart your computer after installation
2. Try `node --version` in new Command Prompt
3. Reinstall Node.js if still not found

### **Issue: Backend won't start**
**Solution:**
1. Check Node.js version: `node --version`
2. Navigate to backend folder: `cd backend`
3. Install dependencies: `npm install`
4. Start server: `node server.js`

### **Issue: Port already in use**
**Solution:**
1. Close other applications using port 3001
2. Or change port in server.js file
3. Restart backend server

---

## **🚀 Quick Start After Installation**

1. **Install Node.js** from nodejs.org
2. **Restart computer**
3. **Double-click:** `FULL_SYSTEM.bat`
4. **Wait for:** Backend startup message
5. **Use:** All AI tools with real functionality

---

## **✅ Success Indicators**

When everything works, you'll see:
- ✅ `node --version` shows version number
- ✅ Backend server starts without errors
- ✅ Frontend connects to real APIs
- ✅ All UI buttons work with live data
- ✅ Health check shows: `{"status": "healthy"}`

---

## **🎉 Benefits**

With Node.js installed, your Zenvora AI Platform becomes:
- **Professional-grade** with real backend
- **Fully functional** AI tools
- **Production-ready** APIs
- **Scalable** architecture
- **Real-time** processing

**Install Node.js to unlock the full potential of your Zenvora AI Platform!**
