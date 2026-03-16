# Deploy Backend to Render

## Steps:

1. **Create Render Account**: Go to https://render.com
2. **Connect GitHub**: Link your repository
3. **Create Web Service**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   
4. **Add Environment Variables**:
   ```
   PORT=5000
   DATABASE_URL=postgresql://neondb_owner:npg_dpYUOXv5x6MF@ep-dawn-hat-a12j38x7-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=tcg_technology_secret_key_2024
   ```

5. **Get Backend URL**: Copy the deployed URL (e.g., `https://your-app.onrender.com`)

## Update Frontend for Production:

Update `src/api/axios.js` with your backend URL:

```javascript
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.onrender.com/api'
    : '/api'
})
```