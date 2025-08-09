const puppeteer = require('puppeteer');
const fs = require('fs').promises;

class RestaurantScraper {
  constructor() {
    this.data = {
      restaurants: [],
      menuItems: [],
      lastUpdated: new Date().toISOString()
    };
  }

  async scrapeRestaurantData() {
    console.log('🕷️  Starting restaurant data scraping...');
    
    // Simulate scraping popular restaurant data
    this.data.restaurants = [
      {
        id: 'mcd-001',
        name: "McDonald's",
        cuisine: 'Fast Food',
        rating: 4.2,
        deliveryTime: '15-25 min',
        deliveryFee: 2.99,
        minOrder: 10.00
      },
      {
        id: 'dom-001', 
        name: "Domino's Pizza",
        cuisine: 'Pizza',
        rating: 4.5,
        deliveryTime: '20-30 min',
        deliveryFee: 3.49,
        minOrder: 12.00
      },
      {
        id: 'sub-001',
        name: "Subway",
        cuisine: 'Sandwiches',
        rating: 4.0,
        deliveryTime: '10-20 min',
        deliveryFee: 1.99,
        minOrder: 8.00
      }
    ];

    this.data.menuItems = [
      // McDonald's items
      { restaurantId: 'mcd-001', name: 'Big Mac', price: 5.99, ingredients: ['beef patty', 'lettuce', 'cheese', 'pickles', 'onions', 'special sauce', 'bun'], category: 'Burgers' },
      { restaurantId: 'mcd-001', name: 'Chicken McNuggets (10pc)', price: 4.99, ingredients: ['chicken', 'breading', 'oil'], category: 'Chicken' },
      { restaurantId: 'mcd-001', name: 'Large Fries', price: 2.99, ingredients: ['potatoes', 'salt', 'oil'], category: 'Sides' },
      
      // Domino's items  
      { restaurantId: 'dom-001', name: 'Pepperoni Pizza (Large)', price: 12.99, ingredients: ['pizza dough', 'tomato sauce', 'mozzarella', 'pepperoni'], category: 'Pizza' },
      { restaurantId: 'dom-001', name: 'Chicken Wings (8pc)', price: 8.99, ingredients: ['chicken wings', 'buffalo sauce', 'celery salt'], category: 'Wings' },
      
      // Subway items
      { restaurantId: 'sub-001', name: 'Italian BMT Footlong', price: 9.99, ingredients: ['italian bread', 'salami', 'pepperoni', 'ham', 'cheese', 'lettuce', 'tomatoes'], category: 'Sandwiches' },
      { restaurantId: 'sub-001', name: 'Chicken Teriyaki', price: 8.99, ingredients: ['wheat bread', 'chicken breast', 'teriyaki sauce', 'cheese', 'vegetables'], category: 'Sandwiches' }
    ];

    await this.saveData();
    console.log(`✅ Scraped ${this.data.restaurants.length} restaurants and ${this.data.menuItems.length} menu items`);
  }

  async saveData() {
    await fs.writeFile('./data/restaurants.json', JSON.stringify(this.data, null, 2));
  }

  async loadData() {
    try {
      const data = await fs.readFile('./data/restaurants.json', 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log('No existing data found, will create new data');
      return null;
    }
  }
}

// Run scraper if called directly
if (require.main === module) {
  const scraper = new RestaurantScraper();
  scraper.scrapeRestaurantData().catch(console.error);
}

module.exports = RestaurantScraper;