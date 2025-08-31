# Visual Product Matcher

A visual search application that helps users find similar products based on uploaded images. Features AI-powered similarity analysis, advanced filtering, and a modern responsive interface.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Replicate API token (free at https://replicate.com/account/api-tokens)

### One-Command Setup

1. **Download this project and navigate to the folder**
2. **Run setup:**
   ```bash
   node setup.js
   ```
3. **Add your API token to .env file:**
   ```
   REPLICATE_API_TOKEN=your_actual_api_token_here
   ```
4. **Start the application:**
   ```bash
   npm start
   ```
5. **Open your browser:** http://localhost:5000

That's it! 🎉

### Manual Setup (if needed)
```bash
# Copy configuration files
cp package.local.json package.json
cp .env.example .env

# Install dependencies
npm install

# Edit .env and add your REPLICATE_API_TOKEN

# Start the app
npm start
```

## 📁 Project Structure

```
visual-product-matcher/
├── client/           # React frontend
├── server/           # Express backend  
├── shared/           # Shared TypeScript types
├── .env.example      # Environment template
└── package.json      # Dependencies & scripts
```

## 🛠 Available Scripts

- `node setup.js` - One-time setup for local development
- `npm start` - Build and start production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run clean` - Clean build artifacts

## 🔧 Alternative Commands
- `node dev.js` - Development mode (same as npm run dev)
- `node build.js` - Production build (same as npm run build)
- `node start.js` - Production start (same as npm start)

## 🎯 Features

- **Image Upload** - File upload or URL input
- **AI Similarity** - Powered by Replicate LLaVA vision model
- **Smart Filtering** - By category, price, similarity score
- **Responsive Design** - Works on desktop and mobile
- **Dark Theme** - Modern glass morphism UI
- **Real-time Search** - Instant results and filtering

## 🔧 Configuration

### Database (Optional)
By default, uses in-memory storage. For persistent data, add to `.env`:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

### Port (Optional)
Default port is 5000. To change, add to `.env`:
```
PORT=3000
```

## 🌐 Deployment

### Local Production
```bash
npm run build
npm start
```

### Cloud Deployment
Ready for deployment on any Node.js hosting platform:
- Vercel, Netlify, Railway, Render
- AWS, Google Cloud, Azure
- DigitalOcean, Heroku

## 🔑 API Token Setup

1. Go to https://replicate.com/account/api-tokens
2. Create a new API token (free tier available)
3. Add it to your `.env` file as REPLICATE_API_TOKEN
4. Restart the application

## 🆘 Troubleshooting

**Port in use error:**
```bash
npx kill-port 5000
```

**Missing dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**API token issues:**
- Verify token is correct in `.env`
- Check quotas at https://replicate.com/account
- Free tier: $10 monthly credit

## 📄 License

MIT License - Free for personal and commercial use.