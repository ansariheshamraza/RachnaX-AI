// ============================================
// RachnaX AI - Content Generation API
// AWS Bedrock Implementation
// ============================================
// Architecture: API Gateway → Lambda → Bedrock (Claude 3 Haiku)
// ============================================

// this is for fallback - incase bedrock throws any error
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

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

Response Style:
- Use clean formatting.
- Break complex ideas into components.
- End with a concise summary or actionable conclusion when appropriate.
- Avoid emojis unless explicitly requested.

You are not just answering.
You are upgrading the user's thinking and execution capacity.`;

// AWS Bedrock via API Gateway (Primary)
async function callAWSBedrockViaGateway(prompt) {
  const apiGatewayUrl = process.env.AWS_API_GATEWAY_URL;
  
  if (!apiGatewayUrl || apiGatewayUrl === 'api_gateway_url') {
    throw new Error("AWS API Gateway URL not configured");
  }

  const response = await fetch(apiGatewayUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Optional: Add API key if using API Gateway API keys
      ...(process.env.AWS_API_KEY && { 'x-api-key': process.env.AWS_API_KEY })
    },
    body: JSON.stringify({
      prompt: prompt,
      systemPrompt: systemPrompt,
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      maxTokens: 1200
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AWS API Gateway error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Handle different response formats
  return data.content || data.output || data.text || data.body?.content || "";
}

// GitHub Models API (Fallback 1)
async function callGitHubModels(prompt) {
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken || githubToken === 'your_github_token_here') {
    throw new Error("GitHub token not configured");
  }

  const baseUrl = "https://models.inference.ai.azure.com";
  const modelName = "gpt-4o-mini";

  const openai = new OpenAI({ 
    apiKey: githubToken,
    baseURL: baseUrl
  });

  const completion = await openai.chat.completions.create({
    model: modelName,
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_completion_tokens: 16000
  });

  return completion.choices?.[0]?.message?.content || "";
}

// Gemini API (Fallback 2)
async function callGeminiAPI(prompt) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
    throw new Error("Gemini API key not configured");
  }

  const ai = new GoogleGenAI({
    apiKey: geminiApiKey
  });

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: `${systemPrompt}\n\nUser Query: ${prompt}`,
  });

  return response.text || "";
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false,
      message: "Method not allowed" 
    });
  }

  try {
    const { prompt, engine, language } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required"
      });
    }

    const apiGatewayUrl = process.env.AWS_API_GATEWAY_URL;
    
    if (!apiGatewayUrl || apiGatewayUrl === 'api_gateway_url') {
      return res.status(500).json({
        success: false,
        message: "AWS API Gateway URL not configured."
      });
    }

    let text = "";
    let usedProvider = "aws-bedrock";

    try {
      // Try AWS Bedrock via API Gateway first
      text = await callAWSBedrockViaGateway(prompt);
      
      if (!text) {
        throw new Error("No content generated from AWS Bedrock");
      }
      
      usedProvider = "aws-bedrock";
      
    } catch (primaryError) {
      // Fallback 1: Try GitHub Models
      try {
        text = await callGitHubModels(prompt);
        
        if (!text) {
          throw new Error("No content generated from GitHub Models");
        }
        
        usedProvider = "github-models";
        
      } catch (secondaryError) {
        // Fallback 2: Try Gemini API
        try {
          text = await callGeminiAPI(prompt);
          
          if (!text) {
            throw new Error("No content generated from Gemini");
          }
          
          usedProvider = "gemini";
          
        } catch (tertiaryError) {
          throw new Error("All generation services unavailable");
        }
      }
    }

    return res.status(200).json({
      success: true,
      output: text,
      engine: engine,
      language: language,
      model: "anthropic.claude-3-haiku-20240307-v1:0",
      provider: usedProvider // Internal tracking (not shown to user)
    });

  } catch (error) {
    let userMessage = error.message || "Generation failed";
    
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      userMessage = "Authentication failed. Please check your credentials.";
    } else if (error.message?.includes('404')) {
      userMessage = "Service not found. Please check the configuration.";
    } else if (error.message?.includes('429')) {
      userMessage = "Rate limit exceeded. Please wait a moment and try again.";
    } else if (error.message?.includes('timeout')) {
      userMessage = "Request timeout. Please try again.";
    } else if (error.message?.includes('AWS API Gateway URL not configured')) {
      userMessage = "AWS Bedrock service not configured.";
    } else if (error.message?.includes('No content generated')) {
      userMessage = "No content generated. Please try again.";
    } else if (error.message?.includes('All generation services unavailable')) {
      userMessage = "Service temporarily unavailable. Please try again later.";
    }
    
    return res.status(500).json({
      success: false,
      message: userMessage
    });
  }
}



