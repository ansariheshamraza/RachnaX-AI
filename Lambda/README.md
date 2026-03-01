# RachnaX AI - AWS Lambda Function

This directory contains the AWS Lambda function for Bedrock integration.

## 📁 Files

| File | Purpose | Status |
|------|---------|--------|
| `bedrock-handler.js` | Lambda function code | ✅ Ready |
| `package.json` | Dependencies and scripts | ✅ Ready |
| `DEPLOYMENT_GUIDE.md` | Complete deployment instructions | ✅ Ready |
| `README.md` | This file | ✅ Ready |

## 🚀 Quick Deploy

```bash
# 1. Install dependencies
npm install

# 2. Package function
npm run package

# 3. Deploy to AWS (requires AWS CLI configured)
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

## 🔄 Update Existing Function

```bash
npm run package
npm run deploy
```

## 📚 Full Instructions

See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT.md)** for complete step-by-step instructions including:
- IAM role creation
- API Gateway setup
- Bedrock model access
- Testing and monitoring
- Troubleshooting

## 🏗️ Architecture

```
Client → API Gateway → Lambda → Bedrock (Claude 3 Haiku)
```

**Pure AWS implementation - no fallback providers**

## 🔧 Environment Variables

The Lambda function uses these environment variables (optional):

- `AWS_REGION` - Default: ap-south-1 (Mumbai)

## ✅ Requirements

- Node.js 20.x runtime
- IAM role with `bedrock:InvokeModel` permission
- Bedrock model access enabled for Claude 3 Haiku
- AWS CLI configured

## 💰 Cost

Estimated cost for 10,000 requests/month: **~$13.80**

Breakdown:
- Bedrock (Claude 3 Haiku): ~$13.75
- Lambda: ~$0.02
- API Gateway: ~$0.04

See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT.md)** for detailed cost breakdown.

## 🧪 Testing

### Test Locally (Before Deployment)
```bash
# Install dependencies
npm install

# Run tests (if available)
npm test
```

### Test After Deployment
```bash
# Test Lambda directly
aws lambda invoke \
  --function-name rachnax-bedrock-handler \
  --payload '{"httpMethod":"POST","body":"{\"prompt\":\"Hello\",\"systemPrompt\":\"You are helpful\",\"maxTokens\":100}"}' \
  --region ap-south-1 \
  response.json

# View response
cat response.json
```

---

**Status**: ✅ Ready to deploy
**Region**: ap-south-1 (Mumbai)
**Model**: Claude 3 Haiku (anthropic.claude-3-haiku-20240307-v1:0)
