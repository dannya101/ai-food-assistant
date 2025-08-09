# Brev.nvidia Integration Guide

## 🚀 Brev.nvidia Platform Overview
Brev.nvidia provides GPU-accelerated cloud infrastructure for AI model deployment and inference.

## 🔧 Integration Setup

### 1. Account Configuration
- Sign up at https://brev.nvidia.com/
- Navigate to your organization: `org-30AS46lRdM5QX5RH7pYEAjawlMQ`
- Access deployments dashboard
- Configure billing and resource limits

### 2. Model Deployment Options

#### Option A: Pre-trained Models
```python
# Deploy Llama 3.1 8B model
brev_client = BrevClient(api_key="your_api_key")
deployment = brev_client.deploy_model(
    model="meta-llama/Llama-3.1-8B-Instruct",
    instance_type="A10G",
    auto_scaling=True,
    min_replicas=1,
    max_replicas=3
)
```

#### Option B: Custom Fine-tuned Models
```python
# Deploy custom food-specific model
deployment = brev_client.deploy_custom_model(
    model_path="./models/food-assistant-llama-3.1",
    dockerfile="./docker/Dockerfile.inference",
    instance_type="A100",
    environment_vars={
        "MODEL_NAME": "food-assistant",
        "MAX_TOKENS": "4096"
    }
)
```

### 3. API Integration

#### Node.js Backend Integration
```typescript
// lib/brev-client.ts
import axios from 'axios';

export class BrevClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, deploymentUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = deploymentUrl;
  }

  async generateRecipeResponse(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/chat/completions`,
        {
          messages: [
            {
              role: "system",
              content: "You are a helpful AI food assistant..."
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Brev API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }
}
```

#### Environment Configuration
```bash
# .env
BREV_API_KEY=your_brev_api_key
BREV_DEPLOYMENT_URL=https://your-deployment.brev.nvidia.com
BREV_ORG_ID=org-30AS46lRdM5QX5RH7pYEAjawlMQ
```

## 🎯 Recommended Models for Food Assistant

### Primary Model: Llama 3.1 8B Instruct
- **Use Case**: General conversation and recipe recommendations
- **Benefits**: Good balance of performance and cost
- **Instance**: A10G (24GB VRAM)
- **Expected Latency**: 100-300ms

### Secondary Model: Code Llama 7B (Optional)
- **Use Case**: Recipe data parsing and structured output
- **Benefits**: Better at structured data generation
- **Instance**: A10G (24GB VRAM)

### Embedding Model: Sentence-BERT
- **Use Case**: Recipe and ingredient similarity matching
- **Benefits**: Fast inference for recommendations
- **Instance**: T4 (16GB VRAM)

## 💰 Cost Optimization Strategies

### 1. Auto-scaling Configuration
```yaml
# Auto-scaling based on request volume
auto_scaling:
  min_replicas: 1
  max_replicas: 5
  target_gpu_utilization: 70%
  scale_up_threshold: 80%
  scale_down_threshold: 30%
```

### 2. Request Batching
```typescript
// Batch multiple requests for efficiency
class RequestBatcher {
  private batch: any[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  addRequest(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.batch.push({ request, resolve, reject });
      
      if (this.batch.length >= 10) {
        this.processBatch();
      } else if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.processBatch(), 100);
      }
    });
  }

  private async processBatch() {
    const currentBatch = this.batch.splice(0);
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    try {
      const results = await this.sendBatchToBrev(currentBatch);
      currentBatch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      currentBatch.forEach(item => item.reject(error));
    }
  }
}
```

### 3. Caching Strategy
```typescript
// Redis caching for common responses
import Redis from 'ioredis';

class CachedBrevClient extends BrevClient {
  private redis = new Redis(process.env.REDIS_URL);

  async generateRecipeResponse(prompt: string): Promise<string> {
    const cacheKey = `recipe:${this.hashPrompt(prompt)}`;
    
    // Check cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Generate new response
    const response = await super.generateRecipeResponse(prompt);
    
    // Cache for 1 hour
    await this.redis.setex(cacheKey, 3600, response);
    
    return response;
  }
}
```

## 🔒 Security Best Practices

### 1. API Key Management
```typescript
// Use secure environment variables
const brevConfig = {
  apiKey: process.env.BREV_API_KEY,
  orgId: process.env.BREV_ORG_ID,
  deploymentUrl: process.env.BREV_DEPLOYMENT_URL
};

// Validate configuration on startup
if (!brevConfig.apiKey) {
  throw new Error('BREV_API_KEY is required');
}
```

### 2. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const brevRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many AI requests, please try again later.'
});
```

### 3. Input Sanitization
```typescript
function sanitizePrompt(prompt: string): string {
  // Remove potential injection attempts
  return prompt
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .substring(0, 2000); // Limit length
}
```

## 📊 Monitoring & Analytics

### 1. Request Logging
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'brev-requests.log' })
  ]
});

// Log all Brev API calls
brevClient.on('request', (requestData) => {
  logger.info('Brev API Request', {
    timestamp: new Date().toISOString(),
    prompt_length: requestData.prompt.length,
    user_id: requestData.userId,
    request_id: requestData.requestId
  });
});
```

### 2. Performance Metrics
```typescript
// Track response times and success rates
class BrevMetrics {
  private metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    averageResponseTime: 0,
    errors: []
  };

  recordRequest(startTime: number, success: boolean, error?: string) {
    const responseTime = Date.now() - startTime;
    
    this.metrics.totalRequests++;
    if (success) {
      this.metrics.successfulRequests++;
    } else if (error) {
      this.metrics.errors.push({ timestamp: Date.now(), error });
    }
    
    // Update rolling average
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + responseTime) / 2;
  }
}
```

## 🚀 Deployment Checklist

- [ ] Brev.nvidia account setup and billing configured
- [ ] Model deployment tested in staging environment
- [ ] API keys securely stored in environment variables
- [ ] Auto-scaling rules configured based on expected load
- [ ] Monitoring and alerting set up for API failures
- [ ] Caching layer implemented for cost optimization
- [ ] Rate limiting configured to prevent abuse
- [ ] Backup deployment strategy for high availability
- [ ] Load testing completed with expected traffic patterns
- [ ] Documentation updated for team onboarding

## 📞 Support & Troubleshooting

### Common Issues
1. **High Latency**: Increase instance size or enable auto-scaling
2. **Rate Limiting**: Implement request batching and caching
3. **Memory Errors**: Reduce max_tokens or upgrade instance type
4. **Connection Timeouts**: Add retry logic with exponential backoff

### Brev.nvidia Support
- Documentation: https://docs.brev.nvidia.com/
- Support Portal: Available through your organization dashboard
- Community Forum: For general questions and best practices