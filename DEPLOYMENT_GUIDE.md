# How to Deploy Your Project (Free) – Step by Step

Your app has a **Node backend**, **React frontend**, **MongoDB**, and **Cloudinary**. You will put backend and frontend on different free sites.

---

## What NOT to Upload

- **`.env`** – Has passwords and secret keys. Never upload. You will type the same values on the website where you deploy.
- **`node_modules`** – Don’t upload. The hosting site will run `npm install` and create it.
- **`frontend/dist`** – Don’t upload. The hosting site will run `npm run build` and create it.

Your `.gitignore` already hides these. Just don’t add `.env` to Git.

---

## Which Free Sites to Use

- **Backend (Node server):** Render.com  
- **Frontend (React):** Vercel.com  
- **Database:** You already use MongoDB Atlas (keep using it).  
- **Images/Videos:** You already use Cloudinary (keep using it).

---

# Step 1: Put Your Code on GitHub

1. Go to [github.com](https://github.com) and sign in.
2. Click **New** (or **+** → **New repository**).
3. Name the repo (e.g. `my-video-app`). Don’t add README or .gitignore (you already have them). Click **Create**.
4. On your PC, open the project folder in terminal and run:

   ```bash
   git init
   git add .
   git commit -m "First commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name.

5. Make sure `.env` is **not** in the list of files you added. If it is, add `.env` to `.gitignore` and run `git add .` and `git commit` again, then push.

---

# Step 2: Deploy the Backend on Render

1. Go to [render.com](https://render.com) and sign up (use GitHub to sign in).
2. Click **New +** → **Web Service**.
3. Connect your GitHub account if asked, then select the repo you just pushed.
4. Fill the form:
   - **Name:** any name (e.g. `my-app-backend`)
   - **Region:** choose one close to you
   - **Root Directory:** leave **blank**
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click **Advanced** and then **Add Environment Variable**. Add **every** variable from your `.env` file, one by one. For example:
   - `PORT` = `8000`
   - `MONGODB_URI` = (paste your MongoDB connection string)
   - `CORS_ORIGIN` = leave empty for now (you will set it in Step 4)
   - `ACCESS_TOKEN_SECRET` = (paste your secret)
   - `REFRESH_TOKEN_SECRET` = (paste your secret)
   - `ACCESS_TOKEN_EXPIRY` = `1d`
   - `REFRESH_TOKEN_EXPIRY` = `10d`
   - `CLOUDINARY_CLOUD_NAME` = (your value)
   - `CLOUDINARY_API_KEY` = (your value)
   - `CLOUDINARY_API_SECRET` = (your value)
6. Click **Create Web Service**. Wait until the deploy finishes (green “Live”).
7. Copy your backend URL from the top of the page (e.g. `https://my-app-backend.onrender.com`). You will need it for the frontend.

---

# Step 3: Deploy the Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (use GitHub to sign in).
2. Click **Add New** → **Project**.
3. Import the **same** GitHub repo you used for the backend.
4. Before clicking Deploy, set these:
   - **Root Directory:** click **Edit**, then type `frontend` and confirm.
   - **Build Command:** `npm run build` (should be already set).
   - **Output Directory:** `dist` (should be already set).
5. Go to **Environment Variables** and add one variable:
   - **Name:** `VITE_API_URL`  
   - **Value:** your backend URL from Step 2 (e.g. `https://my-app-backend.onrender.com`)  
   Do **not** add a slash at the end.
6. Click **Deploy**. Wait until it finishes.
7. Copy your frontend URL (e.g. `https://your-project.vercel.app`). You will need it for the next step.

---

# Step 4: Connect Frontend and Backend

1. Go back to **Render** → your backend service → **Environment**.
2. Find **CORS_ORIGIN**. Set it to your **frontend URL** from Step 3 (e.g. `https://your-project.vercel.app`). Save.
3. Render will redeploy once. When it’s done, your app should work: open the frontend URL in the browser and use the app.

---

# Quick Checklist

- [ ] Code is on GitHub and `.env` is not in the repo.
- [ ] Backend on Render: Build = `npm install`, Start = `npm start`, all env vars added.
- [ ] Frontend on Vercel: Root = `frontend`, env var `VITE_API_URL` = backend URL.
- [ ] On Render, `CORS_ORIGIN` = your Vercel frontend URL.

---

# If Something Broke

- **Backend not starting:** Check Render **Logs**. Make sure every variable from `.env` is added in Render **Environment**.
- **Frontend can’t reach backend:** Check that `VITE_API_URL` on Vercel is exactly your Render URL (no slash at end) and that `CORS_ORIGIN` on Render is exactly your Vercel URL.
- **Database error:** Check `MONGODB_URI` on Render. In MongoDB Atlas, make sure your IP is allowed (or use “Allow access from anywhere” for testing).

---

# Security Note

If your `.env` was ever shared or committed by mistake, change these:

- MongoDB Atlas: Database Access → your user → Edit → new password.
- Create new random strings for `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` and put them in Render Environment.
- Cloudinary: regenerate API secret and update it in Render Environment.
