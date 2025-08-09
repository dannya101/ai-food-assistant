const express = require('express');
const RestaurantScraper = require('../scraper');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const scraper = new RestaurantScraper();
    const data = await scraper.loadData();
    
    if (!data) {
      await scraper.scrapeRestaurantData();
      const newData = await scraper.loadData();
      return res.json(newData.restaurants);
    }
    
    res.json(data.restaurants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

router.get('/:id/menu', async (req, res) => {
  try {
    const scraper = new RestaurantScraper();
    const data = await scraper.loadData();
    
    if (!data) {
      return res.status(404).json({ error: 'No restaurant data available' });
    }
    
    const menuItems = data.menuItems.filter(item => item.restaurantId === req.params.id);
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

router.post('/scrape', async (req, res) => {
  try {
    const scraper = new RestaurantScraper();
    await scraper.scrapeRestaurantData();
    res.json({ message: 'Restaurant data scraped successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape restaurant data' });
  }
});

module.exports = router;