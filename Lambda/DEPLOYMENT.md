# AWS Lambda Deployment Guide
## RachnaX AI - Bedrock Integration

Complete guide for deploying RachnaX AI on AWS infrastructure using Lambda and Bedrock.

## Prerequisites

- AWS Account with Bedrock access
- AWS CLI installed and configured
- Node.js 20.x or later
- Basic understanding of AWS services

## Quick Start (5 Steps)

### Step 1: Prepare Lambda Package

```bash
# Navigate to Lambda directory
cd Lambda

# Install dependencies
npm init -y
npm install @aws-sdk/client-bedrock-runtime

# Package the function
zip -r function.zip bedrock-handler.js node_modules package.json
```

### Step 2: Create IAM Role

Create a file `trust-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Create the role:

```bash
aws iam create-role \
  --role-name rachnax-lambda-bedrock-role \
  --assume-role-policy-document file://trust-policy.json
```

Create a file `bedrock-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:ap-south-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:ap-south-1:*:*"
    }
  ]
}
```

Attach the policy:

```bash
aws iam put-role-policy \
  --role-name rachnax-lambda-bedrock-role \
  --policy-name BedrockInvokePolicy \
  --policy-document file://bedrock-policy.json
```

### Step 3: Deploy Lambda Function

```bash
aws lambda create-function \
  --function-name rachnax-bedrock-handler \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/rachnax-lambda-bedrock-role \
  --handler bedrock-handler.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512 \
  --region ap-south-1
```

Replace `YOUR_ACCOUNT_ID` with your AWS account ID.

### Step 4: Enable Bedrock Model Access

1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Navigate to "Model access" in the left sidebar
3. Click "Manage model access"
4. Find "Claude 3 Haiku" and enable it
5. Click "Save changes"
6. Wait for approval (usually instant)

### Step 5: Create API Gateway

```bash
# Create REST API
aws apigateway create-rest-api \
  --name rachnax-bedrock-api \
  --region ap-south-1

# Note the API ID from the response
API_ID="your-api-id"

# Get root resource ID
aws apigateway get-resources \
  --rest-api-id $API_ID \
  --region ap-south-1

# Note the root resource ID
ROOT_ID="your-root-id"

# Create /generate resource
aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part generate \
  --region ap-south-1

# Note the resource ID
RESOURCE_ID="your-resource-id"

# Create POST method
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --authorization-type NONE \
  --region ap-south-1

# Integrate with Lambda
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:ap-south-1:lambda:path/2015-03-31/functions/arn:aws:lambda:ap-south-1:YOUR_ACCOUNT_ID:function:rachnax-bedrock-handler/invocations \
  --region ap-south-1

# Add Lambda permission for API Gateway
aws lambda add-permission \
  --function-name rachnax-bedrock-handler \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:ap-south-1:YOUR_ACCOUNT_ID:$API_ID/*/*" \
  --region ap-south-1

# Enable CORS - Create OPTIONS method
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --authorization-type NONE \
  --region ap-south-1

# Deploy API
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod \
  --region ap-south-1
```

Your API Gateway URL will be:
```
https://{API_ID}.execute-api.ap-south-1.amazonaws.com/prod/generate
```

## Deploy Application

### 1. Set Environment Variables

Add to your deployment platform (Vercel/AWS):

```env
AWS_API_GATEWAY_URL=https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod/generate
AWS_API_KEY=your_api_key (optional)
```

### 2. Deploy to Production

```bash
# Deploy to Vercel
vercel --prod

# Or deploy to your preferred platform
```

## Testing

### Test Lambda Function Directly

```bash
aws lambda invoke \
  --function-name rachnax-bedrock-handler \
  --payload '{"httpMethod":"POST","body":"{\"prompt\":\"Hello, how are you?\",\"systemPrompt\":\"You are a helpful assistant.\",\"maxTokens\":100}"}' \
  --region ap-south-1 \
  response.json

cat response.json
```

### Test API Gateway

```bash
curl -X POST https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain AI in simple terms",
    "systemPrompt": "You are RachnaX AI",
    "maxTokens": 1000
  }'
```

### Test from Application

1. Deploy with `AWS_API_GATEWAY_URL` configured
2. Open your application workspace
3. Enter a prompt and generate content
4. Verify response is generated successfully

## Monitoring

### View Lambda Logs

```bash
# View recent logs
aws logs tail /aws/lambda/rachnax-bedrock-handler --follow --region ap-south-1

# View logs from last hour
aws logs tail /aws/lambda/rachnax-bedrock-handler --since 1h --region ap-south-1
```

### CloudWatch Metrics

Monitor these metrics in CloudWatch:

- **Lambda Invocations**: Total number of requests
- **Lambda Errors**: Failed requests
- **Lambda Duration**: Response time
- **Lambda Throttles**: Rate-limited requests
- **API Gateway 4xx/5xx**: Client/server errors

### Set Up Alarms

```bash
# Alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name rachnax-lambda-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=rachnax-bedrock-handler \
  --region ap-south-1

# Alarm for high duration
aws cloudwatch put-metric-alarm \
  --alarm-name rachnax-lambda-slow \
  --alarm-description "Alert on slow Lambda responses" \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --threshold 10000 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=rachnax-bedrock-handler \
  --region ap-south-1
```

## Cost Estimation

### AWS Bedrock (Claude 3 Haiku)
- Input: $0.25 per 1M tokens
- Output: $1.25 per 1M tokens

### Lambda
- Requests: $0.20 per 1M requests
- Compute: $0.0000166667 per GB-second
- Free tier: 1M requests/month + 400,000 GB-seconds/month

### API Gateway
- Requests: $3.50 per 1M requests
- Free tier: 1M requests/month (first 12 months)

### Example: 10,000 requests/month
- Average prompt: 500 tokens
- Average response: 1000 tokens
- Total input: 5M tokens = $1.25
- Total output: 10M tokens = $12.50
- Lambda: ~$0.01
- API Gateway: ~$0.04
- **Total: ~$13.80/month**

## Troubleshooting

### Error: "Access denied to Bedrock model"

**Solution**: Enable model access in Bedrock console

```bash
# Check if model is enabled
aws bedrock list-foundation-models --region ap-south-1 | grep claude-3-haiku
```

### Error: "Lambda timeout"

**Solution**: Increase timeout

```bash
aws lambda update-function-configuration \
  --function-name rachnax-bedrock-handler \
  --timeout 60 \
  --region ap-south-1
```

### Error: "CORS error in browser"

**Solution**: Verify OPTIONS method is configured

```bash
# Check methods
aws apigateway get-method \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --region ap-south-1
```

### Error: "Rate limit exceeded"

**Solution**: Increase API Gateway throttling limits

```bash
aws apigateway update-stage \
  --rest-api-id $API_ID \
  --stage-name prod \
  --patch-operations op=replace,path=/throttle/rateLimit,value=100 \
  --region ap-south-1
```

## Updating Lambda Function

When you need to update the code:

```bash
# Make changes to bedrock-handler.js
# Re-package
zip -r function.zip bedrock-handler.js node_modules package.json

# Update function
aws lambda update-function-code \
  --function-name rachnax-bedrock-handler \
  --zip-file fileb://function.zip \
  --region ap-south-1
```

## Troubleshooting Deployment

If you encounter issues:

```bash
# Check Lambda logs
aws logs tail /aws/lambda/rachnax-bedrock-handler --follow

# Verify API Gateway
curl -X POST https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod/generate

# Test application endpoint
curl -X POST https://your-app.com/api/generate
```

## Security Best Practices

1. **Use API Keys**: Add API Gateway API keys for additional security
2. **Enable WAF**: Use AWS WAF to protect against common attacks
3. **VPC**: Deploy Lambda in VPC for additional isolation
4. **Encryption**: Enable encryption at rest for CloudWatch Logs
5. **Least Privilege**: IAM role should only have necessary permissions
6. **Rate Limiting**: Configure throttling in API Gateway
7. **Monitoring**: Set up CloudWatch alarms for anomalies

## Support

For issues or questions:
- Check CloudWatch Logs for Lambda errors
- Review API Gateway execution logs
- Verify Bedrock model access is enabled
- Ensure IAM permissions are correct

## Next Steps

1. ✅ Deploy Lambda function
2. ✅ Create API Gateway
3. ✅ Enable Bedrock access
4. ✅ Test thoroughly
5. ✅ Update application code
6. ✅ Monitor costs and performance
7. ✅ Set up alarms

---

**Last Updated**: March 2026
**Region**: ap-south-1 (Mumbai)
**Model**: Claude 3 Haiku (anthropic.claude-3-haiku-20240307-v1:0)
