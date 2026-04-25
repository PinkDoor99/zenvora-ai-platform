# Python Setup Guide for Zenvora AI Platform

## 🐍 Configure Python for Your Web URL

Your system shows Python is not properly configured. Here's how to fix it:

---

## **Step 1: Install Python 3**

### **Option A: Microsoft Store (Easiest)**
1. Click the Windows Start button
2. Type "Python" and press Enter
3. Click "Python 3.x" from Microsoft Store
4. Click "Install" or "Get"
5. Wait for installation to complete

### **Option B: Official Download (Recommended)**
1. Go to: https://python.org/downloads/
2. Click "Download Python 3.x.x"
3. Run the installer
4. **IMPORTANT:** Check "Add Python to PATH" during installation
5. Click "Install Now"

---

## **Step 2: Verify Python Installation**

1. **Open Command Prompt** (Win + R, type `cmd`, press Enter)
2. **Type:** `python --version`
3. **You should see:** `Python 3.x.x`

If you see "Python was not found", restart your computer and try again.

---

## **Step 3: Test Your Web Server**

1. **Navigate to your project folder:**
   ```
   cd c:\Users\johnt\Downloads\Zenvora_AI_Platform_Enhanced
   ```

2. **Start the web server:**
   ```
   python -m http.server 8080
   ```

3. **You should see:**
   ```
   Serving HTTP on 0.0.0.0 port 8080 (http://localhost:8080/) ...
   ```

4. **Open your browser and go to:**
   ```
   http://localhost:8080
   ```

---

## **Step 4: Use the Easy Launcher**

Once Python is working, double-click:
```
START_WEBSITE.bat
```

This will automatically start your server and show you the URLs.

---

## **Troubleshooting Python Issues:**

### **Issue: "Python was not found"**
**Solution:**
1. Restart your computer after installing Python
2. Try `py --version` instead of `python --version`
3. Or use `python3 --version`

### **Issue: "Access denied"**
**Solution:**
1. Run Command Prompt as Administrator
2. Try the server command again

### **Issue: "Port already in use"**
**Solution:**
1. Use a different port: `python -m http.server 8081`
2. Or close other applications using port 8080

---

## **Quick Test Commands:**

Try these in Command Prompt:

```cmd
# Check Python version
python --version

# Alternative commands if above doesn't work
py --version
python3 --version

# Start web server
cd c:\Users\johnt\Downloads\Zenvora_AI_Platform_Enhanced
python -m http.server 8080
```

---

## **Expected Results:**

When everything works, you'll see:
- ✅ Python version displayed
- ✅ Server starts successfully
- ✅ Website loads at `http://localhost:8080`
- ✅ All applications accessible

---

## **Alternative: Use Built-in Python**

If you can't install Python, try:
```cmd
py -m http.server 8080
```

Windows 10/11 often has Python built-in with the `py` launcher.

---

## **Next Steps:**

1. **Install Python** using the steps above
2. **Restart your computer**
3. **Double-click `START_WEBSITE.bat`**
4. **Visit `http://localhost:8080`**

**Your Zenvora AI Platform will be live with a proper web URL!**
