const axios = require('axios');

class NvidiaAIService {
  constructor() {
    this.apiKey = process.env.NVIDIA_API_KEY;
    this.baseURL = 'https://integrate.api.nvidia.com/v1';
  }

  async getFoodRecommendations(userPreferences, availableItems) {
    if (!this.apiKey) {
      return this.getMockRecommendations(userPreferences, availableItems);
    }

    try {
      const prompt = this.buildRecommendationPrompt(userPreferences, availableItems);
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a food recommendation AI. Provide personalized food suggestions based on user preferences and available menu items. Return recommendations in JSON format."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return this.parseAIResponse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('NVIDIA API Error:', error.message);
      return this.getMockRecommendations(userPreferences, availableItems);
    }
  }

  buildRecommendationPrompt(preferences, items) {
    return `
Based on these user preferences: ${JSON.stringify(preferences)}
And these available menu items: ${JSON.stringify(items)}

Recommend 3-5 food items that best match the user's preferences. Consider:
- Dietary restrictions
- Cuisine preferences  
- Price range
- Ingredients they like/dislike

Return recommendations as JSON array with: name, restaurant, price, matchReason
`;
  }

  parseAIResponse(content) {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }
    
    return this.getFallbackRecommendations();
  }

  getMockRecommendations(preferences, availableItems) {
    const recommendations = [];
    const sampleItems = availableItems.slice(0, 3);
    
    sampleItems.forEach(item => {
      recommendations.push({
        name: item.name,
        restaurant: item.restaurantId,
        price: item.price,
        matchReason: `Great ${item.category.toLowerCase()} option with ${item.ingredients.slice(0, 2).join(' and ')}`
      });
    });

    return recommendations;
  }

  getFallbackRecommendations() {
    return [
      {
        name: "Big Mac",
        restaurant: "mcd-001",
        price: 5.99,
        matchReason: "Classic American burger with special sauce"
      },
      {
        name: "Pepperoni Pizza (Large)",
        restaurant: "dom-001", 
        price: 12.99,
        matchReason: "Perfect for sharing, classic pizza choice"
      }
    ];
  }

  async analyzeIngredients(ingredients) {
    const prompt = `Analyze these food ingredients for nutritional value and dietary information: ${ingredients.join(', ')}`;
    
    return {
      calories: Math.floor(Math.random() * 500) + 200,
      protein: Math.floor(Math.random() * 30) + 10,
      carbs: Math.floor(Math.random() * 50) + 20,
      fat: Math.floor(Math.random() * 25) + 5,
      dietaryFlags: this.getDietaryFlags(ingredients)
    };
  }

  getDietaryFlags(ingredients) {
    const flags = [];
    const vegIngredients = ['lettuce', 'tomatoes', 'vegetables', 'bread', 'cheese'];
    const meatIngredients = ['beef', 'chicken', 'pepperoni', 'salami', 'ham'];
    
    if (ingredients.some(ing => meatIngredients.some(meat => ing.toLowerCase().includes(meat)))) {
      flags.push('contains-meat');
    }
    
    if (ingredients.some(ing => ing.toLowerCase().includes('cheese'))) {
      flags.push('contains-dairy');
    }
    
    if (ingredients.every(ing => vegIngredients.some(veg => ing.toLowerCase().includes(veg)))) {
      flags.push('vegetarian-friendly');
    }
    
    return flags;
  }

  async getChatResponse(message, history = []) {
    if (!this.apiKey) {
      return this.getMockChatResponse(message, history);
    }

    try {
      const chatPrompt = this.buildChatPrompt(message, history);
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: "nvidia/llama-3.1-nemotron-70b-instruct",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI food assistant. Help users discover food, find recipes, analyze ingredients, and guide them to restaurants or grocery stores. Be conversational, friendly, and provide practical food advice. You can reference the available restaurants (McDonald's, Domino's, Subway) and grocery stores (Walmart, Kroger, Whole Foods) in your responses.`
          },
          {
            role: "user",
            content: chatPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('NVIDIA Chat API Error:', error.message);
      return this.getMockChatResponse(message, history);
    }
  }

  buildChatPrompt(message, history) {
    let context = '';
    
    if (history.length > 0) {
      context = 'Previous conversation:\n';
      history.slice(-5).forEach(msg => {
        context += `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      context += '\n';
    }
    
    return `${context}Current message: ${message}

Available restaurants: McDonald's (fast food), Domino's (pizza), Subway (sandwiches)
Available grocery stores: Walmart (general groceries), Kroger (fresh ingredients), Whole Foods (organic/premium)

Please provide a helpful, conversational response about food, cooking, or dining options.`;
  }

  getMockChatResponse(message, history) {
    const msg = message.toLowerCase();
    
    // Context-aware responses
    if (history.length > 0) {
      const lastMessage = history[history.length - 1]?.content?.toLowerCase() || '';
      
      if (lastMessage.includes('recipe') && (msg.includes('ingredients') || msg.includes('what') || msg.includes('need'))) {
        return "For most recipes, you'll want to check what you have at home first. Common ingredients you might need from the grocery store include fresh vegetables, proteins like chicken or fish, cooking oils, and seasonings. Would you like me to suggest a specific recipe and shopping list?";
      }
    }
    
    // Standard responses based on keywords
    if (msg.includes('healthy') || msg.includes('salad') || msg.includes('nutrition')) {
      return "🥗 Great choice for healthy eating! For quick healthy options, Subway has fresh veggie subs with lots of nutrients. If you want to cook at home, Whole Foods has excellent organic produce - try making a colorful salad with spinach, tomatoes, cucumbers, and grilled chicken. What type of healthy flavors do you enjoy?";
    } else if (msg.includes('quick') || msg.includes('fast') || msg.includes('hurry')) {
      return "⚡ When you need something fast, McDonald's delivers in 15-25 minutes, or Domino's pizza in 20-30 minutes. For super quick home cooking, try scrambled eggs (5 min), instant oatmeal, or a simple sandwich. Are you looking to order out or cook something quick?";
    } else if (msg.includes('chicken')) {
      return "🍗 Chicken is so versatile! You could order Chicken McNuggets from McDonald's, get a Chicken Teriyaki sub from Subway, or grab fresh chicken from Kroger to make homemade dishes like chicken stir-fry, grilled chicken salad, or chicken pasta. What cooking method sounds good to you?";
    } else if (msg.includes('comfort') || msg.includes('cozy') || msg.includes('warm')) {
      return "🍲 Nothing beats comfort food! Domino's pizza is always cozy and satisfying. For homemade comfort, try making mac and cheese, chicken soup, or grilled cheese with tomato soup using ingredients from Walmart. What kind of comfort food makes you feel best?";
    } else if (msg.includes('vegetarian') || msg.includes('veggie') || msg.includes('plant')) {
      return "🌱 Lots of delicious vegetarian options! Subway has great veggie subs, and you can create amazing plant-based meals with fresh produce from Whole Foods - think vegetable stir-fry, caprese salad, pasta primavera, or veggie burgers. Any particular vegetables you love?";
    } else if (msg.includes('pizza') || msg.includes('domino')) {
      return "🍕 Pizza is always a great choice! Domino's has classic pepperoni, specialty pizzas, and sides like wings and breadsticks. They deliver in 20-30 minutes. What's your favorite pizza style - classic pepperoni, meat lovers, or maybe something with veggies?";
    } else if (msg.includes('breakfast') || msg.includes('morning')) {
      return "🌅 Good morning! For quick breakfast, McDonald's has Egg McMuffins and hash browns. For home cooking, you could get eggs, bread, and fresh fruit from Kroger to make scrambled eggs, toast, and fruit salad. What kind of breakfast gives you energy for the day?";
    } else if (msg.includes('dinner') || msg.includes('evening')) {
      return "🌆 For dinner, you have great options! Order a satisfying meal from Domino's or Subway, or cook something special with ingredients from the grocery stores. Popular dinner ideas include pasta dishes, grilled proteins with vegetables, or hearty soups. What sounds appealing for tonight?";
    } else if (msg.includes('ingredients') || msg.includes('cook') || msg.includes('recipe')) {
      return "👩‍🍳 I'd love to help you cook! First, what dish are you thinking about making? Once I know that, I can suggest the ingredients you'll need and which grocery store would be best for shopping - Kroger for everyday ingredients, Whole Foods for organic options, or Walmart for budget-friendly choices.";
    } else if (msg.includes('order') || msg.includes('delivery')) {
      return "🚚 Ready to order? You can get food delivered from McDonald's (15-25 min), Domino's (20-30 min), or Subway (10-20 min). Or if you want to cook, you can order groceries from Walmart, Kroger, or Whole Foods. What type of meal are you in the mood for?";
    } else {
      return "I'm here to help you with all things food! 🍴 Whether you want to order from restaurants like McDonald's, Domino's, or Subway, or cook at home with ingredients from Walmart, Kroger, or Whole Foods, I can guide you. What are you in the mood for today?";
    }
  }
}

module.exports = NvidiaAIService;