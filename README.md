# AI Food Assistant 🍕🤖

A weekend project showcasing NVIDIA AI integration with food ordering simulation and web scraping. Perfect for demonstrating modern AI capabilities in a practical application.

## Features

- **🤖 NVIDIA AI Integration**: Uses NVIDIA's Llama models for food recommendations
- **🕷️ Web Scraping**: Simulates scraping restaurant data (expandable to real sources)
- **📦 Order Simulation**: Complete DoorDash-like ordering flow with status tracking
- **🎯 Smart Recommendations**: AI-powered food suggestions based on preferences
- **📊 Ingredient Analysis**: Nutritional analysis using AI

## Tech Stack

- **Backend**: Node.js, Express
- **AI**: NVIDIA NIM API (Llama 3.1 Nemotron)
- **Scraping**: Puppeteer, Cheerio
- **Frontend**: Vanilla HTML/CSS/JavaScript

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Add your NVIDIA API key to .env
   ```

3. **Initialize restaurant data**:
   ```bash
   npm run scrape
   ```

4. **Start the application**:
   ```bash
   npm run dev
   ```

5. **Open browser**: http://localhost:3000

## NVIDIA API Setup

1. Get API key from [NVIDIA Developer Portal](https://developer.nvidia.com/)
2. Add to `.env` file:
   ```
   NVIDIA_API_KEY=your_key_here
   ```

## Project Structure

```
src/
├── app.js              # Main Express server
├── scraper.js          # Restaurant data scraping
├── services/
│   └── nvidiaAI.js     # NVIDIA AI integration
└── routes/
    ├── restaurants.js  # Restaurant endpoints
    ├── orders.js       # Order simulation
    └── ai.js          # AI recommendation endpoints
public/
└── index.html         # Frontend interface
```

## Resume Highlights

This project demonstrates:
- **AI/ML Integration**: Real NVIDIA model usage
- **Web Scraping**: Data extraction and processing
- **Full-Stack Development**: Complete application architecture
- **API Design**: RESTful service creation
- **Real-time Features**: Order tracking simulation

## License

MIT