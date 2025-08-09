const express = require('express');
const NvidiaAIService = require('../services/nvidiaAI');
const RestaurantScraper = require('../scraper');
const router = express.Router();

const aiService = new NvidiaAIService();

router.post('/recommend', async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const scraper = new RestaurantScraper();
    const data = await scraper.loadData();
    
    if (!data) {
      return res.status(404).json({ error: 'No restaurant data available' });
    }
    
    const recommendations = await aiService.getFoodRecommendations(preferences, data.menuItems);
    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get AI recommendations' });
  }
});

router.post('/analyze-ingredients', async (req, res) => {
  try {
    const { ingredients } = req.body;
    const analysis = await aiService.analyzeIngredients(ingredients);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze ingredients' });
  }
});

router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    nvidia_api_configured: !!process.env.NVIDIA_API_KEY,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;