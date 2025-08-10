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

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    const response = await aiService.getChatResponse(message, history);
    res.json({ 
      response,
      suggestions: generateSuggestions(message, response)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get chat response' });
  }
});

router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    nvidia_api_configured: !!process.env.NVIDIA_API_KEY,
    timestamp: new Date().toISOString()
  });
});

function generateSuggestions(userMessage, aiResponse) {
  const msg = userMessage.toLowerCase();
  const resp = aiResponse.toLowerCase();
  
  if (resp.includes('recipe') || resp.includes('cook')) {
    return ['Show me the recipe', 'What ingredients do I need?', 'How long does it take?'];
  } else if (resp.includes('restaurant') || resp.includes('order')) {
    return ['Show me the menu', 'How much does delivery cost?', 'Place an order'];
  } else if (resp.includes('healthy') || resp.includes('nutrition')) {
    return ['Show nutritional info', 'Any other healthy options?', 'What about calories?'];
  } else {
    return ['Tell me more', 'Show me options', 'What else can you recommend?'];
  }
}

module.exports = router;