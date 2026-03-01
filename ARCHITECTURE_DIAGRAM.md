# RachnaX AI - Architecture Diagrams

## System Architecture Overview

### Complete Request Flow

```mermaid
flowchart TD

%% ---------------- FRONTEND ----------------
subgraph FRONTEND["Frontend (workspace/index.js)"]
A[User Input<br/>Topic / Tone / Structure / Language<br/>Context / Brainstorm Mode]
end

%% ---------------- VERCEL API ----------------
subgraph VERCEL["Vercel API Layer"]
B[/api/token<br/>Fetch Access Token/]
C[/api/endpoint<br/>Fetch Endpoint Config (Obfuscated)/]
D[/api/generate<br/>Content Generation Endpoint<br/>Vercel Edge/]
end

%% ---------------- AWS CLOUD ----------------
subgraph AWS["AWS Cloud (ap-south-1)"]

subgraph APIG["AWS API Gateway"]
E[HTTPS Endpoint<br/>CORS Enabled<br/>Request Validation<br/>Rate Limiting<br/>API Key Auth]
end

subgraph LAMBDA["AWS Lambda (Node.js 20.x)"]
F[Parse Request]
G[Validate Input]
H[Format Prompt with System Instructions]
I[Invoke Bedrock API]
J[Process Model Response]
K[Return Formatted Output]
end

subgraph BEDROCK["AWS Bedrock"]
L[Model: Claude 3 Haiku<br/>anthropic.claude-3-haiku-20240307-v1:0<br/>NLU + Content Generation<br/>Multilingual + Structured Thinking]
end

subgraph CLOUDWATCH["AWS CloudWatch"]
M[Logs<br/>Metrics<br/>Error Tracking<br/>Cost Monitoring]
end

end

%% ---------------- FLOW ----------------
A -->|1 Fetch Token| B
B -->|2 Fetch Endpoint Config| C
C -->|3 POST Generate Request| D

D -->|HTTPS Request| E
E -->|Trigger Lambda| F

F --> G
G --> H
H --> I
I --> L
L --> J
J --> K

K --> E
E --> D
D --> N[Frontend Renders Markdown Output]

%% Monitoring
F -. Logs .-> M
E -. Metrics .-> M
```

---

## AWS Services Integration

### 1. AWS API Gateway
**Purpose**: HTTP API endpoint management

**Features**:
- RESTful API endpoint
- CORS configuration for web access
- Request/response transformation
- API key authentication
- Rate limiting and throttling
- Request validation
- CloudWatch integration

**Configuration**:
```
Endpoint: https://{api-id}.execute-api.ap-south-1.amazonaws.com/prod/generate
Method: POST
Region: ap-south-1 (Mumbai)
Stage: prod
```

### 2. AWS Lambda
**Purpose**: Serverless compute for business logic

**Specifications**:
- Runtime: Node.js 20.x
- Memory: 512 MB
- Timeout: 30 seconds
- Handler: bedrock-handler.handler
- Execution Role: IAM role with Bedrock permissions

**Responsibilities**:
- Parse and validate requests
- Format prompts with system instructions
- Invoke Bedrock API
- Handle errors gracefully
- Return formatted responses
- Log execution metrics

**IAM Permissions**:
```json
{
  "Effect": "Allow",
  "Action": ["bedrock:InvokeModel"],
  "Resource": "arn:aws:bedrock:ap-south-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
}
```

### 3. AWS Bedrock
**Purpose**: Foundation model access for AI generation

**Model Details**:
- Model ID: `anthropic.claude-3-haiku-20240307-v1:0`
- Provider: Anthropic
- Type: Large Language Model (LLM)
- Capabilities: Text generation, reasoning, multi-language

**Configuration**:
- Max Tokens: 16,000
- Temperature: Default (controlled by model)
- System Prompt: RachnaX AI structured thinking engine
- Anthropic Version: bedrock-2023-05-31

**Why Claude 3 Haiku?**
- Fast response times (< 3 seconds)
- Cost-effective ($0.25 per 1M input tokens)
- High-quality output
- Strong reasoning capabilities
- Multi-language support

### 4. AWS CloudWatch
**Purpose**: Monitoring and logging

**Metrics Tracked**:
- Lambda invocations
- Lambda errors and duration
- API Gateway requests
- API Gateway latency
- Bedrock API calls
- Cost tracking

**Logs**:
- Lambda execution logs
- API Gateway access logs
- Error traces
- Performance metrics

---


## File Structure

```
rachnax/
│
├── Frontend
│   ├── workspace/
│   │   ├── index.html      ← Workspace UI
│   │   ├── index.css       ← Styles
│   │   └── index.js        ← Logic (1618 lines)
│   │
│   └── index.html          ← Homepage
│
├── API (Current - Active)
│   ├── generate.js         ← Fetch
│   ├── endpoint.js         ← Obfuscation
│   ├── token.js            ← Authentication
│   └── health.js           ← Health check
│
│
├── Lambda (AWS - Ready)
│   ├── bedrock-handler.js  ← Lambda function
│   ├── package.json        ← Dependencies
│   ├── DEPLOYMENT_GUIDE.md ← Instructions
│   └── README.md           ← Quick reference
│
└── Documentation
    ├── API_FILES_REFERENCE.md
    ├── AWS_BEDROCK_SETUP.md
    ├── AWS_QUICK_START.md
    ├── AWS_DEPLOYMENT_CHECKLIST.md
    ├── PROJECT_STATUS.md
    ├── IMPLEMENTATION_COMPLETE.md
    ├── AWS_INTEGRATION_SUMMARY.md
    └── ARCHITECTURE_DIAGRAM.md (this file)
```

---

## Deployment Flow

### Current Setup
```
Local Development
    │
    ├─ Edit code
    ├─ Test locally
    └─ Commit to Git
    │
    ▼
Deployment
    │
    ├─ Auto-deploy on push
    ├─ Build project
    ├─ Set environment variables
    └─ Deploy to production
    │
    ▼
Production
    │
    └─ https://rachnax.vercel.app
```

---

## Cost Flow

### Current (Free)
```
10,000 requests/month
    │
    ├─ Vercel: $0 (hobby plan)
    │
    └─ Total: $0/month
```

### AWS Bedrock
```
10,000 requests/month
    │
    ├─ Bedrock (Claude 3 Haiku)
    │   ├─ Input (5M tokens): $1.25
    │   └─ Output (10M tokens): $12.50
    │
    ├─ Lambda
    │   ├─ Requests: $0.01
    │   └─ Compute: $0.01
    │
    ├─ API Gateway
    │   └─ Requests: $0.04
    │
    ├─ CloudWatch Logs: $0.02
    │
    └─ Total: ~$13.80/month
```

---

## Monitoring Flow (AWS)

```
Application
    │
    ▼
API Gateway
    │
    ├─ Access Logs → CloudWatch Logs
    ├─ Execution Logs → CloudWatch Logs
    └─ Metrics → CloudWatch Metrics
    │
    ▼
Lambda Function
    │
    ├─ Function Logs → CloudWatch Logs
    ├─ Invocations → CloudWatch Metrics
    ├─ Errors → CloudWatch Metrics
    ├─ Duration → CloudWatch Metrics
    └─ Throttles → CloudWatch Metrics
    │
    ▼
CloudWatch Alarms
    │
    ├─ Error Rate > 5%
    ├─ Duration > 10s
    └─ Throttles > 0
```

---

## Summary

| Architecture | Status | Cost | Performance |
|--------------|--------|------|-------------|
| **AWS Bedrock** | Active | ~$13.80 | Better |


