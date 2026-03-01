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

See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for complete step-by-step instructions including:
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

See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for detailed cost breakdown.

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

## 📖 Documentation

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[../AWS_QUICK_START.md](../AWS_QUICK_START.md)** - Quick start guide
- **[../AWS_DEPLOYMENT_CHECKLIST.md](../AWS_DEPLOYMENT_CHECKLIST.md)** - Deployment checklist

## 🔗 Related Files

- **[../api/generate-aws-bedrock.js](../api/generate-aws-bedrock.js)** - API file that calls this Lambda
- **[../API_FILES_REFERENCE.md](../API_FILES_REFERENCE.md)** - API documentation
- **[../ARCHITECTURE_DIAGRAM.md](../ARCHITECTURE_DIAGRAM.md)** - Architecture diagrams

## ⚠️ Important Notes

1. This Lambda function is **NOT currently deployed** - it's ready when you need it
2. The application currently uses GitHub Models + Gemini (free tier)
3. Deploy this Lambda when you want to switch to AWS Bedrock
4. See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for complete instructions

## 🎯 Next Steps

1. Read **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**
2. Follow the deployment steps
3. Test the Lambda function
4. Update the application to use AWS Bedrock

---

**Status**: ✅ Ready to deploy
**Region**: ap-south-1 (Mumbai)
**Model**: Claude 3 Haiku (anthropic.claude-3-haiku-20240307-v1:0)
