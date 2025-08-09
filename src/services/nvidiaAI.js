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
}

module.exports = NvidiaAIService;