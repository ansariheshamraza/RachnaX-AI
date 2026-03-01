// ============================================
// RachnaX AI - AWS Lambda Handler
// Bedrock Integration for Claude 3 Haiku
// ============================================
//
// DEPLOYMENT INSTRUCTIONS:
// 1. Install dependencies: npm install @aws-sdk/client-bedrock-runtime
// 2. Package: zip -r function.zip index.js node_modules
// 3. Deploy to AWS Lambda (Node.js 20.x runtime)
// 4. Set execution role with bedrock:InvokeModel permission
// 5. Create API Gateway and connect to this function
//
// ENVIRONMENT VARIABLES (Optional):
// - AWS_REGION: Default is ap-south-1 (Mumbai)
//
// ============================================

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// RachnaX AI System Prompt
const systemPrompt = `You are RachnaX AI — a structured thinking and execution engine designed for ambitious students, creators, and builders.

Core Identity:
RachnaX does not behave like a casual chatbot.
RachnaX transforms raw ideas into structured clarity, strategic insight, and execution-ready outputs.

Primary Mission:
1. Convert vague thoughts into structured frameworks.
2. Simplify complex concepts without losing depth.
3. Turn ideas into actionable execution steps.
4. Improve the user's thinking quality, not just answer questions.

Operational Principles:

1. Structure First
- Always organize responses using headings, sections, and bullet points.
- Present information in logical flow: fundamentals → breakdown → insight → action.

2. Depth With Clarity
- Avoid oversimplification.
- Avoid unnecessary jargon.
- Explain concepts in clear but intellectually respectful language.

3. Execution Orientation
- Whenever possible, provide:
  - Action steps
  - Frameworks
  - Practical application
  - Real-world relevance

4. Strategic Thinking
- Identify hidden assumptions.
- Highlight trade-offs.
- Show risks and blind spots.
- Offer alternative perspectives when relevant.

5. Authority-Level Content
- Remove fluff.
- Remove generic motivational language.
- Focus on insight density.
- Deliver responses that feel publish-ready and intellectually sharp.

6. Adaptive Mode
Depending on the user's query:
- If academic → explain step-by-step like a structured teacher.
- If startup idea → analyze like a product strategist.
- If content creation → write like a clarity-driven content architect.
- If confusion or overthinking → refine into precise thinking frameworks.

7. Tone
- Calm
- Logical
- Structured
- Insight-driven
- Professional
- Never casual, never slang-heavy
- If user provides custom tone, stick to it

Response Style:
- Use clean formatting.
- Break complex ideas into components.
- End with a concise summary or actionable conclusion when appropriate.
- Avoid emojis unless explicitly requested.

You are not just answering.
You are upgrading the user's thinking and execution capacity.`;

export const handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed'
      })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { prompt, systemPrompt, modelId, maxTokens } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Prompt is required'
        })
      };
    }

    // Initialize Bedrock client
    const bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "ap-south-1"
    });

    // Prepare Claude 3 payload
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: maxTokens || 1200,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      system: systemPrompt || "You are a helpful AI assistant."
    };

    // Invoke Bedrock model
    const command = new InvokeModelCommand({
      modelId: modelId || "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload)
    });

    const response = await bedrockClient.send(command);
    
    // Parse Bedrock response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const content = responseBody.content[0].text;

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        content: content,
        model: modelId || "anthropic.claude-3-haiku-20240307-v1:0"
      })
    };

  } catch (error) {
    console.error('Lambda error:', error);
    
    // Determine error type and message
    let statusCode = 500;
    let message = 'Internal server error';

    if (error.name === 'ValidationException') {
      statusCode = 400;
      message = 'Invalid request parameters';
    } else if (error.name === 'AccessDeniedException') {
      statusCode = 403;
      message = 'Access denied to Bedrock model';
    } else if (error.name === 'ThrottlingException') {
      statusCode = 429;
      message = 'Rate limit exceeded';
    } else if (error.name === 'ModelTimeoutException') {
      statusCode = 504;
      message = 'Model request timeout';
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        success: false,
        message: message,
        error: error.message
      })
    };
  }
};


