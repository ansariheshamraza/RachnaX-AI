// ═══════════════════════════════════════════════════════════
// RACHNAX AI WORKSPACE - CORE SCRIPT
// ═══════════════════════════════════════════════════════════
// Structure: Workspace core → UI components → Utilities
// ═══════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════
// SECTION 1: WORKSPACE CORE FUNCTIONALITY
// ═══════════════════════════════════════════════════════════
// This section contains the core workspace logic that handles
// content generation, data collection, and API communication.
// ═══════════════════════════════════════════════════════════


// ───────────────────────────────────────────────────────────
// 1.1 GLOBAL VARIABLES & CONFIGURATION
// ───────────────────────────────────────────────────────────

let currentDisplayedContent = '';

const structureOptions = {
  "Blog Post": ["Introduction", "Key Points", "Conclusion", "Examples", "Summary"],
  "Instagram Script": ["Hook", "Story Arc", "Call to Action", "Hashtags"],
  "YouTube Script": ["Hook", "Main Content", "Transitions", "Outro"],
  "Academic Assignment": ["Introduction", "Body", "Conclusion", "References"],
  "Article": ["Headline", "Introduction", "Background", "Main Discussion", "Expert Insight", "Conclusion"],
  "SEO Article": ["Meta Title", "Meta Description", "Introduction", "Subheadings", "FAQs", "Conclusion"],
  "Instagram Caption": ["Hook Line", "Story/Value", "Engagement Question", "Call to Action", "Hashtags"],
  "Podcast Script": ["Opening Hook", "Introduction", "Main Discussion", "Guest Segment", "Key Takeaways", "Closing"],
  "Cold Email": ["Subject Line", "Personalization", "Problem", "Solution", "Call to Action", "Closing"],
  "Sales Page": ["Headline", "Subheadline", "Problem", "Solution", "Benefits", "Testimonials", "Offer", "CTA"],
  "Landing Page": ["Hero Section", "Problem", "Solution", "Features", "Benefits", "Social Proof", "CTA"],
  "Topic Explanation": ["Definition", "Core Concept", "Examples", "Applications", "Summary"],
  "Research Paper": ["Abstract", "Introduction", "Methodology", "Results", "Discussion", "Conclusion", "References"],
  "Debate Speech": ["Opening Statement", "Arguments", "Supportive Pointas", "Against Points", "Rebuttal", "Conclusion"],
  "Startup Pitch": ["Problem", "Solution", "Market Opportunity", "Product", "Business Model", "Traction", "Ask"],
  "Storytelling Post": ["Hook", "Setup", "Conflict", "Turning Point", "Resolution", "Lesson"],
  "Exam Answer": ["Direct Answer", "Explanation", "Examples", "Summary"]
};


// ───────────────────────────────────────────────────────────
// 1.2 DOM INITIALIZATION
// ───────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  console.log('🎯 DOM Content Loaded - Initializing AI Workspace');
  
  // Initialize workspace core features first
  initializeGenerateButton();
  console.log('✓ Generate button initialized');
  
  initializeStructureGridDelegation();
  console.log('✓ Structure grid delegation initialized');
  
  initializeOutputAreaDelegation();
  console.log('✓ Output area delegation initialized');
  
  initializeContextRefinementToggle();
  console.log('✓ Context refinement toggle initialized');
  
  // Initialize UI enhancements
  initializeAutocomplete();
  console.log('✓ Autocomplete initialized');
  
  initGreetingAnimation();
  console.log('✓ Greeting animation initialized');
  
  initializeSmoothScroll();
  console.log('✓ Smooth scroll initialized');
  
  console.log('✅ AI Workspace fully initialized');
});



// ───────────────────────────────────────────────────────────
// 1.3 GENERATE BUTTON & CORE GENERATION FLOW
// ───────────────────────────────────────────────────────────

function initializeGenerateButton() {
  const generateButton = document.getElementById('generate-button');
  
  if (generateButton) {
    console.log('✅ Generate button found, attaching event listener');
    generateButton.addEventListener('click', handleGenerate);
  } else {
    console.error('❌ Generate button NOT found! Check HTML for id="generate-button"');
  }
}

function handleGenerate() {
  console.log('🚀 Generation triggered');
  
  const workspaceData = collectWorkspaceData();
  
  if (!workspaceData) {
    console.warn('⚠️ Generation aborted: Validation failed');
    return;
  }
  
  const engineId = selectEngine(workspaceData);
  
  if (!engineId) {
    console.error('❌ Generation aborted: Engine selection failed');
    showGenerationError('Something went wrong with engine selection. Let\'s try that again.', workspaceData);
    return;
  }
  
  const formattedPrompt = buildPrompt(workspaceData, engineId);
  
  logGenerationDetails(workspaceData, engineId, formattedPrompt);
  
  showSkeletonLoader();
  
  callAIBackend(formattedPrompt, engineId)
    .then(content => {
      hideSkeletonLoader();
      displayMarkdownContent(content);
    })
    .catch(error => {
      console.error('Error details:', error.message, error.stack);
      hideSkeletonLoader();
      showGenerationError('Something went wrong. Let\'s try that again.', workspaceData);
    });
}



// ───────────────────────────────────────────────────────────
// 1.4 DATA COLLECTION & VALIDATION
// ───────────────────────────────────────────────────────────

function collectWorkspaceData() {
  const identitySelector = document.getElementById('identity-selector');
  const creationIntentSelector = document.getElementById('creation-intent-selector');
  const rawIdeaCanvas = document.getElementById('raw-idea-canvas');
  
  const identity = identitySelector ? identitySelector.value : '';
  const creationIntent = creationIntentSelector ? creationIntentSelector.value : '';
  const rawIdea = rawIdeaCanvas ? rawIdeaCanvas.value : '';
  
  // Validation
  const errors = [];
  
  if (!identity || identity.trim() === '') {
    errors.push({ field: 'identity-selector', message: 'Tell us who you are' });
  }
  
  if (!creationIntent || creationIntent.trim() === '') {
    errors.push({ field: 'creation-intent-selector', message: 'What would you like to create?' });
  }
  
  if (!rawIdea || rawIdea.trim() === '') {
    errors.push({ field: 'raw-idea-canvas', message: 'Share your idea to get started' });
  }
  
  if (errors.length > 0) {
    displayInlineErrors(errors);
    return null;
  }
  
  clearInlineErrors();
  
  const targetAudienceInput = document.getElementById('target-audience');
  const platformInput = document.getElementById('platform');
  const toneSelect = document.getElementById('tone');
  const languageComplexitySelect = document.getElementById('language-complexity');
  const outputLengthSelect = document.getElementById('output-length');
  const outputLanguageSelect = document.getElementById('output-language');
  
  const contextRefinement = {
    audience: targetAudienceInput && targetAudienceInput.value.trim() ? targetAudienceInput.value.trim() : null,
    platform: platformInput && platformInput.value.trim() ? platformInput.value.trim() : null,
    tone: toneSelect && toneSelect.value ? toneSelect.value : null,
    languageComplexity: languageComplexitySelect && languageComplexitySelect.value ? languageComplexitySelect.value : null,
    length: outputLengthSelect && outputLengthSelect.value ? outputLengthSelect.value : null,
    language: outputLanguageSelect && outputLanguageSelect.value ? outputLanguageSelect.value : 'English'
  };
  
  const structureButtons = document.querySelectorAll('.structure-pill[aria-pressed="true"]');
  const structureCustomization = Array.from(structureButtons).map(button => 
    button.getAttribute('data-structure')
  );
  
  const brainstormCheckbox = document.getElementById('brainstorm-mode-checkbox');
  const brainstormMode = brainstormCheckbox ? brainstormCheckbox.checked : false;
  
  return {
    identity: identity,
    creationIntent: creationIntent,
    rawIdea: rawIdea,
    contextRefinement: contextRefinement,
    structureCustomization: structureCustomization,
    brainstormMode: brainstormMode
  };
}



// ───────────────────────────────────────────────────────────
// 1.5 ENGINE ROUTING
// ───────────────────────────────────────────────────────────

function selectEngine(workspaceData) {
  if (!workspaceData || !workspaceData.creationIntent || !workspaceData.identity) {
    console.warn('Invalid workspace data provided to selectEngine');
    return '';
  }

  const identity = workspaceData.identity;
  const creationIntent = workspaceData.creationIntent;

  // Academic pattern
  const isAcademicIdentity = identity === 'Student' || identity === 'Teacher' || identity === 'Competitive Aspirant';
  const isAcademicIntent = ['Academic Assignment', 'Exam Answer', 'Topic Explanation', 'Research Paper', 'Debate Speech'].includes(creationIntent);

  if (isAcademicIdentity && isAcademicIntent) {
    console.log(`Engine routing: identity="${identity}", creationIntent="${creationIntent}", engine="academic_engine"`);
    return 'academic_engine';
  }

  // Business pattern
  const isBusinessIdentity = identity === 'Entrepreneur' || identity === 'Business Professional' || identity === 'Marketer';
  const isBusinessIntent = ['SEO Article', 'Cold Email', 'Sales Page', 'Landing Page', 'Startup Pitch'].includes(creationIntent);

  if (isBusinessIdentity && isBusinessIntent) {
    console.log(`Engine routing: identity="${identity}", creationIntent="${creationIntent}", engine="business_engine"`);
    return 'business_engine';
  }

  // Creator pattern
  const isCreatorIdentity = identity === 'Content Creator' || identity === 'Influencer';
  const isCreatorIntent = ['Blog Post', 'Instagram Script', 'Instagram Caption', 'YouTube Script', 'Storytelling Post', 'Podcast Script', 'Article'].includes(creationIntent);

  if (isCreatorIdentity && isCreatorIntent) {
    console.log(`Engine routing: identity="${identity}", creationIntent="${creationIntent}", engine="creator_engine"`);
    return 'creator_engine';
  }

  // Default to hybrid engine
  console.log(`Engine routing: identity="${identity}", creationIntent="${creationIntent}", engine="hybrid_engine"`);
  return 'hybrid_engine';
}



// ───────────────────────────────────────────────────────────
// 1.6 PROMPT ENGINE
// ───────────────────────────────────────────────────────────

function academicEngineTemplate(workspaceData) {
  if (!workspaceData) return '';

  const context = workspaceData.contextRefinement || {};
  const structureElements = workspaceData.structureCustomization?.length
    ? workspaceData.structureCustomization.map(el => `- ${el}`).join('\n')
    : 'Follow standard academic structure';

  const language = context.language || 'English';
  const brainstormMode = workspaceData.brainstormMode || false;

  let prompt = `You are RachnaX AI Academic Engine.
Generate logically structured, analytically strong academic content.

User:
- Identity: ${workspaceData.identity}
- Type: ${workspaceData.creationIntent}
- Audience: ${context.audience || 'General'}
- Tone: ${context.tone || 'Formal'}
- Complexity: ${context.languageComplexity || 'Intermediate'}
- Length: ${context.length || 'Medium'}
- Language: ${language}

Topic:
${workspaceData.rawIdea}

Structure:
${structureElements}

Rules:
- Strong logical flow.
- Deep reasoning with examples where useful.
- Follow structure exactly.
- Respect length and complexity.
- Whole Ouput from start to end fully in ${language}.
`;

  if (brainstormMode) {
    prompt += `
Before writing, provide:

## Academic Insights (max 120 words)
- Refined thesis
- 3 argument pillars
- 1 counterpoint
- Depth improvement tip
- Structure refinement tip

Then:

## Final Academic Output
`;
  }

  prompt += `
Formatting:
- Markdown headings
- Bold key concepts
- Clear sections only
`;

  return prompt;
}

function creatorEngineTemplate(workspaceData) {
  if (!workspaceData) return '';

  const context = workspaceData.contextRefinement || {};
  const structureElements = workspaceData.structureCustomization?.length
    ? workspaceData.structureCustomization.map(el => `- ${el}`).join('\n')
    : 'Platform-optimized structure';

  const language = context.language || 'English';
  const brainstormMode = workspaceData.brainstormMode || false;

  let prompt = `You are RachnaX AI Creator Engine.
Create high-engagement, platform-native content.

User:
- Type: ${workspaceData.creationIntent}
- Platform: ${context.platform || 'General'}
- Audience: ${context.audience || 'General'}
- Tone: ${context.tone || 'Casual'}
- Complexity: ${context.languageComplexity || 'Intermediate'}
- Length: ${context.length || 'Medium'}
- Language: ${language}

Idea:
${workspaceData.rawIdea}

Structure:
${structureElements}

Rules:
- Start with strong hook.
- Maintain emotional/value flow.
- Adapt to platform behavior.
- Include CTA if relevant.
- Follow structure strictly.
- Respect length.
- Whole Ouput from start to end fully in ${language}.
`;

  if (brainstormMode) {
    prompt += `
Before writing, provide:

## Idea Breakdown (max 130 words)
1. Power (2 bullets)
2. Risks (2 bullets)
3. Improvement (2 bullets)
4. Flow roadmap (4 steps max)
5. Platform fit (hook + retention + CTA)

Then:

## Platform-Ready Content
`;
  }

  prompt += `
Formatting:
- Markdown headings
- Bold impactful lines
- Scannable layout
`;

  return prompt;
}

function businessEngineTemplate(workspaceData) {
  if (!workspaceData) return '';

  const context = workspaceData.contextRefinement || {};
  const structureElements = workspaceData.structureCustomization?.length
    ? workspaceData.structureCustomization.map(el => `- ${el}`).join('\n')
    : 'Business-optimized structure';

  const language = context.language || 'English';
  const brainstormMode = workspaceData.brainstormMode || false;

  let prompt = `You are RachnaX AI Business Engine.
Create persuasive, conversion-focused business content.

User:
- Identity: ${workspaceData.identity}
- Type: ${workspaceData.creationIntent}
- Audience: ${context.audience || 'General'}
- Platform: ${context.platform || 'General'}
- Tone: ${context.tone || 'Professional'}
- Complexity: ${context.languageComplexity || 'Intermediate'}
- Length: ${context.length || 'Medium'}
- Language: ${language}

Idea:
${workspaceData.rawIdea}

Structure:
${structureElements}

Rules:
- Lead with value proposition.
- Address pain points.
- Focus on benefits.
- Follow structure.
- Respect length.
- Whole Ouput from start to end fully in ${language}.
`;

  if (brainstormMode) {
    prompt += `
Before writing, provide:

## Strategic Snapshot (max 120 words)
1. Market angle
2. Key risk
3. Value refinement
4. Conversion path

Then:

## Conversion-Optimized Output
`;
  }

  prompt += `
Formatting:
- Markdown headings
- Bold benefits & CTAs
- Clear sections
`;

  return prompt;
}

function hybridEngineTemplate(workspaceData) {
  if (!workspaceData) return '';

  const context = workspaceData.contextRefinement || {};
  const structureElements = workspaceData.structureCustomization?.length
    ? workspaceData.structureCustomization.map(el => `- ${el}`).join('\n')
    : 'Balanced structured flow';

  const language = context.language || 'English';
  const brainstormMode = workspaceData.brainstormMode || false;

  let prompt = `You are RachnaX AI Hybrid Engine.
Blend clarity with engagement.

User:
- Identity: ${workspaceData.identity}
- Type: ${workspaceData.creationIntent}
- Platform: ${context.platform || 'General'}
- Audience: ${context.audience || 'General'}
- Tone: ${context.tone || 'Balanced'}
- Complexity: ${context.languageComplexity || 'Intermediate'}
- Length: ${context.length || 'Medium'}
- Language: ${language}

Idea:
${workspaceData.rawIdea}

Structure:
${structureElements}

Rules:
- Clear structure + engaging flow.
- Simplify complex ideas.
- Maintain authority.
- Follow structure.
- Respect length.
- Whole Ouput from start to end fully in ${language}.
`;

  if (brainstormMode) {
    prompt += `
Before writing, provide:

## Refinement Notes (max 100 words)
- Idea strengthening
- Structure improvement
- Engagement boost
- Tone calibration
- Audience alignment

Then:

## Balanced Output
`;
  }

  prompt += `
Formatting:
- Markdown headings
- Bold key ideas
- Clean sections
`;

  return prompt;
}



// ───────────────────────────────────────────────────────────
// 1.7 PROMPT BUILDER
// ───────────────────────────────────────────────────────────

function buildPrompt(workspaceData, engineId) {
  if (!workspaceData) {
    console.warn('Invalid workspace data provided to buildPrompt');
    return '';
  }
  
  let templateFunction;
  
  switch (engineId) {
    case 'academic_engine':
      templateFunction = academicEngineTemplate;
      break;
    case 'creator_engine':
      templateFunction = creatorEngineTemplate;
      break;
    case 'business_engine':
      templateFunction = businessEngineTemplate;
      break;
    case 'hybrid_engine':
      templateFunction = hybridEngineTemplate;
      break;
    default:
      console.warn(`Unknown engineId "${engineId}", defaulting to hybridEngineTemplate`);
      templateFunction = hybridEngineTemplate;
      break;
  }
  
  return templateFunction(workspaceData);
}


// ───────────────────────────────────────────────────────────
// 1.8 API COMMUNICATION
// ───────────────────────────────────────────────────────────

async function callAIBackend(prompt, engineId, language = 'en') {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const payload = {
    prompt: prompt,
    engine: engineId,
    language: language,
    timestamp: new Date().toISOString(),
    requestId: requestId
  };
  
  try {
    const tokenRes = await fetch('/api/token');
    const { t } = await tokenRes.json();
    const _t = atob(t);
    
    const configRes = await fetch('/api/endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Token': _t
      },
      body: JSON.stringify({ v: 'v1' })
    });
    const { d } = await configRes.json();
    const config = JSON.parse(atob(d));
    
    const response = await fetch(config.e, {
      method: config.m,
      headers: config.h,
      body: JSON.stringify({
        prompt: payload.prompt,
        engine: payload.engine,
        language: payload.language
      })
    });

    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorMessage = 'Generation failed';
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // Silent error handling
        }
      } else {
        errorMessage = `Request failed: ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }

    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Generation failed');
    }

    return data.output;

  } catch (error) {
    throw error;
  }
}



// ───────────────────────────────────────────────────────────
// 1.9 OUTPUT RENDERING
// ───────────────────────────────────────────────────────────

function renderMarkdown(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  let html = content;
  
  // Escape HTML to prevent XSS
  html = html.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');
  
  // Code blocks (must be processed before inline code)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, language, code) {
    const lang = language ? ` data-language="${language}"` : '';
    return `<pre class="markdown-code-block"${lang}><code>${code.trim()}</code></pre>`;
  });
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="markdown-inline-code">$1</code>');
  
  // Headings (h1-h6)
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="markdown-h6">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="markdown-h5">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="markdown-h4">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="markdown-h3">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="markdown-h2">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="markdown-h1">$1</h1>');
  
  // Bold (must be processed before italic)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="markdown-bold">$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong class="markdown-bold">$1</strong>');
  
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em class="markdown-italic">$1</em>');
  html = html.replace(/_(.+?)_/g, '<em class="markdown-italic">$1</em>');
  
  // Unordered lists
  html = html.replace(/^\s*[-*+]\s+(.+)$/gm, '<li class="markdown-list-item">$1</li>');
  html = html.replace(/(<li class="markdown-list-item">.*<\/li>)/s, function(match) {
    return '<ul class="markdown-ul">' + match + '</ul>';
  });
  
  // Ordered lists
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li class="markdown-list-item">$1</li>');
  html = html.replace(/(<li class="markdown-list-item">.*?<\/li>)(?=\n(?!<li))/gs, function(match) {
    if (!match.includes('<ul') && !match.includes('<ol')) {
      return '<ol class="markdown-ol">' + match + '</ol>';
    }
    return match;
  });
  
  // Paragraphs
  const lines = html.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('<') || trimmed.startsWith('</')) {
      return line;
    }
    return `<p class="markdown-paragraph">${trimmed}</p>`;
  });
  html = processedLines.join('\n');
  
  return html;
}

function displayMarkdownContent(content) {
  currentDisplayedContent = content;
  
  const outputPlaceholder = document.getElementById('output-placeholder');
  const skeletonLoader = document.getElementById('skeleton-loader');
  const outputAreaPanel = document.querySelector('.output-area-panel');
  
  if (outputPlaceholder) {
    outputPlaceholder.style.display = 'none';
  }
  if (skeletonLoader) {
    skeletonLoader.style.display = 'none';
  }
  
  let outputContent = document.getElementById('output-content');
  
  if (!outputContent) {
    outputContent = document.createElement('div');
    outputContent.id = 'output-content';
    outputContent.className = 'output-content';
    outputAreaPanel.appendChild(outputContent);
  }
  
  const htmlContent = renderMarkdown(content);
  
  outputContent.innerHTML = `
    <button type="button" class="copy-button" id="copy-button" aria-label="Copy content to clipboard">
      <span class="copy-icon" aria-hidden="true">📋</span>
      <span class="copy-text">Copy</span>
    </button>
    <div class="markdown-content" id="markdown-content">
      ${htmlContent}
    </div>
  `;
}



// ═══════════════════════════════════════════════════════════
// SECTION 2: WORKSPACE UI COMPONENTS
// ═══════════════════════════════════════════════════════════
// This section contains UI components specific to the workspace
// interface including structure grid, loaders, and error states.
// ═══════════════════════════════════════════════════════════


// ───────────────────────────────────────────────────────────
// 2.1 STRUCTURE GRID MANAGEMENT
// ───────────────────────────────────────────────────────────

function initializeStructureGridDelegation() {
  const structureGrid = document.getElementById('structure-grid');
  
  if (structureGrid) {
    structureGrid.addEventListener('click', function(event) {
      if (event.target.classList.contains('structure-pill')) {
        toggleStructureButton(event.target);
      }
    });
  }
}

function initializeOutputAreaDelegation() {
  const outputAreaPanel = document.querySelector('.output-area-panel');
  
  if (outputAreaPanel) {
    outputAreaPanel.addEventListener('click', function(event) {
      if (event.target.classList.contains('copy-button') || 
          event.target.closest('.copy-button')) {
        copyToClipboard(currentDisplayedContent);
      }
      
      if (event.target.classList.contains('refinement-button')) {
        const refinementType = event.target.getAttribute('data-refinement');
        if (refinementType) {
          handleRefinement(refinementType, currentDisplayedContent);
        }
      }
    });
  }
}

function updateStructureGrid(creationIntent) {
  const structureGrid = document.getElementById('structure-grid');
  
  if (!structureGrid) {
    console.warn('Structure grid element not found');
    return;
  }
  
  structureGrid.innerHTML = '';
  
  const options = structureOptions[creationIntent];
  
  if (!options || options.length === 0) {
    structureGrid.innerHTML = '<p class="structure-placeholder">Select a content type to see structure options</p>';
    return;
  }
  
  options.forEach(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'structure-pill';
    button.textContent = option;
    button.setAttribute('data-structure', option);
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('role', 'button');
    
    structureGrid.appendChild(button);
  });
}

function toggleStructureButton(button) {
  const isPressed = button.getAttribute('aria-pressed') === 'true';
  button.setAttribute('aria-pressed', !isPressed);
  button.classList.toggle('selected');
}

const debouncedUpdateStructureGrid = debounce(updateStructureGrid, 300);



// ───────────────────────────────────────────────────────────
// 2.2 SKELETON LOADER
// ───────────────────────────────────────────────────────────

let skeletonAnimationInterval = null;
let currentSkeletonStep = 0;

const skeletonSteps = [
  { icon: '🔍', message: 'Analyzing your input...' },
  { icon: '🎨', message: 'Refining your prompt...' },
  { icon: '🧠', message: 'Understanding your objective...' },
  { icon: '🎯', message: 'Mapping intent and audience...' },
  { icon: '✨', message: 'Crafting personalized content...' },
  { icon: '📝', message: 'Structuring your output...' },
  { icon: '🚀', message: 'Almost there...' }
];

function showSkeletonLoader() {
  const placeholder = document.getElementById('output-placeholder');
  const skeletonLoader = document.getElementById('skeleton-loader');
  
  if (placeholder) {
    placeholder.style.display = 'none';
  }
  
  if (skeletonLoader) {
    skeletonLoader.style.display = 'block';
    skeletonLoader.setAttribute('aria-busy', 'true');
    startSkeletonAnimation();
  }
}

function hideSkeletonLoader() {
  const skeletonLoader = document.getElementById('skeleton-loader');
  
  if (skeletonLoader) {
    skeletonLoader.style.display = 'none';
    skeletonLoader.setAttribute('aria-busy', 'false');
    stopSkeletonAnimation();
  }
}

function startSkeletonAnimation() {
  const iconElement = document.getElementById('skeleton-icon');
  const textElement = document.getElementById('skeleton-status-text');
  
  if (!iconElement || !textElement) return;
  
  currentSkeletonStep = 0;
  
  iconElement.textContent = skeletonSteps[0].icon;
  textElement.textContent = skeletonSteps[0].message;
  
  if (skeletonAnimationInterval) {
    clearInterval(skeletonAnimationInterval);
  }
  
  skeletonAnimationInterval = setInterval(() => {
    currentSkeletonStep = (currentSkeletonStep + 1) % skeletonSteps.length;
    
    const step = skeletonSteps[currentSkeletonStep];
    
    iconElement.style.opacity = '0';
    textElement.style.opacity = '0';
    
    setTimeout(() => {
      iconElement.textContent = step.icon;
      textElement.textContent = step.message;
      
      iconElement.style.opacity = '1';
      textElement.style.opacity = '1';
    }, 300);
    
  }, 2500);
}

function stopSkeletonAnimation() {
  if (skeletonAnimationInterval) {
    clearInterval(skeletonAnimationInterval);
    skeletonAnimationInterval = null;
  }
  currentSkeletonStep = 0;
}

function showPlaceholder() {
  const placeholder = document.getElementById('output-placeholder');
  const skeletonLoader = document.getElementById('skeleton-loader');
  
  if (skeletonLoader) {
    skeletonLoader.style.display = 'none';
    skeletonLoader.setAttribute('aria-busy', 'false');
    stopSkeletonAnimation();
  }
  
  if (placeholder) {
    placeholder.style.display = 'flex';
  }
}



// ───────────────────────────────────────────────────────────
// 2.3 ERROR HANDLING & VALIDATION
// ───────────────────────────────────────────────────────────

function showGenerationError(message, workspaceData) {
  const outputPlaceholder = document.getElementById('output-placeholder');
  const skeletonLoader = document.getElementById('skeleton-loader');
  const outputAreaPanel = document.querySelector('.output-area-panel');
  
  if (outputPlaceholder) {
    outputPlaceholder.style.display = 'none';
  }
  if (skeletonLoader) {
    skeletonLoader.style.display = 'none';
  }
  
  let errorState = document.getElementById('generation-error-state');
  
  if (!errorState) {
    errorState = document.createElement('div');
    errorState.id = 'generation-error-state';
    errorState.className = 'generation-error-state';
    outputAreaPanel.appendChild(errorState);
  }
  
  errorState.innerHTML = `
    <div class="error-icon" aria-hidden="true">⚠️</div>
    <p class="error-message" role="alert" aria-live="assertive">${message}</p>
    <button type="button" class="retry-button" id="retry-generation-button" aria-label="Retry content generation">
      Regenerate
    </button>
  `;
  
  errorState.style.display = 'flex';
  
  const retryButton = document.getElementById('retry-generation-button');
  if (retryButton) {
    retryButton.addEventListener('click', function() {
      errorState.style.display = 'none';
      handleGenerate();
    });
  }
  
  console.error('Generation error displayed:', {
    message: message,
    workspaceData: workspaceData,
    timestamp: new Date().toISOString()
  });
}

function hideGenerationError() {
  const errorState = document.getElementById('generation-error-state');
  
  if (errorState) {
    errorState.style.display = 'none';
  }
}

function displayInlineErrors(errors) {
  clearInlineErrors();
  
  if (!errors || errors.length === 0) {
    return;
  }
  
  errors.forEach((error, index) => {
    const fieldElement = document.getElementById(error.field);
    
    if (!fieldElement) {
      console.warn(`Field element not found: ${error.field}`);
      return;
    }
    
    const errorElement = document.createElement('div');
    errorElement.className = 'inline-error-message';
    errorElement.textContent = error.message;
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');
    errorElement.setAttribute('data-error-for', error.field);
    
    fieldElement.classList.add('field-error');
    fieldElement.setAttribute('aria-invalid', 'true');
    
    fieldElement.parentElement.appendChild(errorElement);
    
    if (index === 0) {
      fieldElement.focus();
    }
  });
  
  attachErrorClearListeners();
}

function clearInlineErrors() {
  const errorMessages = document.querySelectorAll('.inline-error-message');
  errorMessages.forEach(msg => msg.remove());
  
  const errorFields = document.querySelectorAll('.field-error');
  errorFields.forEach(field => {
    field.classList.remove('field-error');
    field.removeAttribute('aria-invalid');
  });
}

function attachErrorClearListeners() {
  const identitySelector = document.getElementById('identity-selector');
  const creationIntentSelector = document.getElementById('creation-intent-selector');
  const rawIdeaCanvas = document.getElementById('raw-idea-canvas');
  
  if (identitySelector) {
    identitySelector.addEventListener('change', function clearIdentityError() {
      if (this.value && this.value.trim() !== '') {
        clearFieldError('identity-selector');
      }
    }, { once: true });
  }
  
  if (creationIntentSelector) {
    creationIntentSelector.addEventListener('change', function clearIntentError() {
      if (this.value && this.value.trim() !== '') {
        clearFieldError('creation-intent-selector');
      }
    }, { once: true });
  }
  
  if (rawIdeaCanvas) {
    rawIdeaCanvas.addEventListener('input', function clearIdeaError() {
      if (this.value && this.value.trim() !== '') {
        clearFieldError('raw-idea-canvas');
      }
    }, { once: true });
  }
}

function clearFieldError(fieldId) {
  const fieldElement = document.getElementById(fieldId);
  
  if (!fieldElement) {
    return;
  }
  
  fieldElement.classList.remove('field-error');
  fieldElement.removeAttribute('aria-invalid');
  
  const errorMessage = document.querySelector(`.inline-error-message[data-error-for="${fieldId}"]`);
  if (errorMessage) {
    errorMessage.remove();
  }
}



// ═══════════════════════════════════════════════════════════
// SECTION 3: UI ENHANCEMENTS
// ═══════════════════════════════════════════════════════════
// This section contains UI enhancements that improve user
// experience including autocomplete and animations.
// ═══════════════════════════════════════════════════════════


// ───────────────────────────────────────────────────────────
// 3.1 AUTOCOMPLETE FUNCTIONALITY
// ───────────────────────────────────────────────────────────

const autocompleteSuggestions = {
  'identity-selector': [
    'Student',
    'Content Creator',
    'Student + Content Creator',
    'Competitive Aspirant',
    'Teacher',
    'Entrepreneur',
    'Business Professional',
    'Freelancer',
    'Marketer'
  ],
  'creation-intent-selector': [
    'Academic Assignment',
    'Exam Answer',
    'Topic Explanation',
    'Research Paper',
    'Debate Speech',
    'Blog Post',
    'Instagram Script',
    'Instagram Caption',
    'YouTube Script',
    'Storytelling Post',
    'Podcast Script',
    'Article',
    'SEO Article',
    'Cold Email',
    'Sales Page',
    'Landing Page',
    'Startup Pitch'
  ],
  'target-audience': [
    'Students',
    'Teenagers',
    'Professionals',
    'Instagram audience',
    'Youtube audience',
    'Medium users',
    'LinkedIn users',
    'Founders',
    'Entrepreneurs',
    'Content creators',
    'Beginners',
    'Advanced learners',
    'General',
    'Parents',
    'Teachers',
    'Me / Myself',
    'Business professionals'
  ],
  'platform': [
    'Instagram',
    'Facebook',
    'Twitter / X',
    'LinkedIn',
    'YouTube',
    'Personal blog',
    'Website',
    'Meeting',
    'Classroom',
    'Medium',
    'Email',
    'WhatsApp',
    'Telegram',
    'Academic paper',
    'General',
    'Me / Myself',
    'Presentation'
  ]
};

function initializeAutocomplete() {
  Object.keys(autocompleteSuggestions).forEach(inputId => {
    const input = document.getElementById(inputId);
    if (!input) return;

    const wrapper = input.closest('.autocomplete-wrapper');
    if (!wrapper) return;

    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'autocomplete-suggestions';
    suggestionsContainer.id = `${inputId}-suggestions`;
    wrapper.appendChild(suggestionsContainer);

    let selectedIndex = -1;

    input.addEventListener('focus', function() {
      showSuggestions(input, suggestionsContainer, autocompleteSuggestions[inputId]);
    });

    input.addEventListener('input', function() {
      const value = this.value.toLowerCase();
      const filtered = autocompleteSuggestions[inputId].filter(suggestion =>
        suggestion.toLowerCase().includes(value)
      );
      showSuggestions(input, suggestionsContainer, filtered);
      selectedIndex = -1;
      
      if (inputId === 'creation-intent-selector') {
        debouncedUpdateStructureGrid(this.value);
      }
    });

    input.addEventListener('keydown', function(e) {
      const suggestions = suggestionsContainer.querySelectorAll('.autocomplete-suggestion');
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
        updateSelection(suggestions, selectedIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection(suggestions, selectedIndex);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        suggestions[selectedIndex].click();
      } else if (e.key === 'Escape') {
        hideSuggestions(suggestionsContainer);
        selectedIndex = -1;
      }
    });

    document.addEventListener('click', function(e) {
      if (!wrapper.contains(e.target)) {
        hideSuggestions(suggestionsContainer);
        selectedIndex = -1;
      }
    });
  });
}

function showSuggestions(input, container, suggestions) {
  if (suggestions.length === 0) {
    hideSuggestions(container);
    return;
  }

  container.innerHTML = '';
  
  suggestions.forEach((suggestion, index) => {
    const div = document.createElement('div');
    div.className = 'autocomplete-suggestion';
    div.textContent = suggestion;
    div.setAttribute('data-index', index);
    
    div.addEventListener('click', function() {
      input.value = suggestion;
      hideSuggestions(container);
      input.focus();
      
      if (input.id === 'creation-intent-selector') {
        updateStructureGrid(suggestion);
      }
    });
    
    container.appendChild(div);
  });
  
  container.classList.add('active');
}

function hideSuggestions(container) {
  container.classList.remove('active');
}

function updateSelection(suggestions, selectedIndex) {
  suggestions.forEach((suggestion, index) => {
    if (index === selectedIndex) {
      suggestion.classList.add('selected');
      suggestion.scrollIntoView({ block: 'nearest' });
    } else {
      suggestion.classList.remove('selected');
    }
  });
}



// ───────────────────────────────────────────────────────────
// 3.2 GREETING ANIMATION
// ───────────────────────────────────────────────────────────

function initGreetingAnimation() {
  const slider = document.getElementById('greeting-slider');
  
  if (!slider) {
    console.log('Greeting slider element not found');
    return;
  }

  const textElements = Array.from(slider.querySelectorAll('.greeting-text'));

  if (textElements.length !== 5) {
    console.log('Expected 5 greeting text elements, found:', textElements.length);
    return;
  }

  const greetings = [
    'Namaste',
    'Hello',
    'नमस्ते',
    'નમસ્તે',
    'नमस्कार',
    'வணக்கம்',
    'ನಮಸ್ಕಾರ',
    'నమస్కారం',
    'നമസ്കാരം',
    'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
    'প্রণাম',
    'Nomoshkar',
    'Vanakkam',
    'Namaskara',
    'Namaskar',
    'Adaab',
    'Sat Sri Akal',
    'Khurumjari',
    'Nomoskar'
  ];

  let currentIndex = 2;

  function getIndex(offset) {
    let index = currentIndex + offset;
    while (index < 0) index += greetings.length;
    return index % greetings.length;
  }

  function updatePositions() {
    textElements[0].textContent = greetings[getIndex(-2)];
    textElements[1].textContent = greetings[getIndex(-1)];
    textElements[2].textContent = greetings[getIndex(0)];
    textElements[3].textContent = greetings[getIndex(1)];
    textElements[4].textContent = greetings[getIndex(2)];

    textElements[0].className = 'greeting-text hidden-top';
    textElements[1].className = 'greeting-text prev-greeting';
    textElements[2].className = 'greeting-text current-greeting';
    textElements[3].className = 'greeting-text next-greeting';
    textElements[4].className = 'greeting-text hidden-bottom';
  }

  function slideUp() {
    textElements.forEach(el => {
      el.style.transition = 'all 0.6s ease-in-out';
    });

    textElements[0].className = 'greeting-text hidden-top';
    textElements[0].style.transform = 'translateY(-150px)';
    textElements[0].style.opacity = '0';
    textElements[0].style.fontSize = 'var(--text-xl)';

    textElements[1].className = 'greeting-text hidden-top';
    textElements[1].style.transform = 'translateY(-100px)';
    textElements[1].style.opacity = '0';
    textElements[1].style.fontSize = 'var(--text-xl)';

    textElements[2].className = 'greeting-text prev-greeting';
    textElements[2].style.transform = 'translateY(-50px)';
    textElements[2].style.opacity = '0.3';
    textElements[2].style.fontSize = 'var(--text-2xl)';

    textElements[3].className = 'greeting-text current-greeting';
    textElements[3].style.transform = 'translateY(0)';
    textElements[3].style.opacity = '1';
    textElements[3].style.fontSize = 'var(--text-4xl)';

    textElements[4].className = 'greeting-text next-greeting';
    textElements[4].style.transform = 'translateY(50px)';
    textElements[4].style.opacity = '0.3';
    textElements[4].style.fontSize = 'var(--text-2xl)';

    setTimeout(() => {
      currentIndex = getIndex(1);

      textElements.forEach(el => {
        el.style.transition = 'none';
      });

      textElements[0].textContent = greetings[getIndex(2)];
      textElements[0].className = 'greeting-text hidden-bottom';
      textElements[0].style.transform = 'translateY(100px)';
      textElements[0].style.opacity = '0';
      textElements[0].style.fontSize = 'var(--text-xl)';
      
      const first = textElements.shift();
      textElements.push(first);

      void textElements[0].offsetWidth;
    }, 600);
  }

  updatePositions();
  setInterval(slideUp, 3000);
}



// ═══════════════════════════════════════════════════════════
// SECTION 4: UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════
// This section contains generic utility functions that support
// the workspace functionality.
// ═══════════════════════════════════════════════════════════


// ───────────────────────────────────────────────────────────
// 4.1 NAVIGATION UTILITIES
// ───────────────────────────────────────────────────────────

function initializeSmoothScroll() {
  const startCreatingBtn = document.getElementById('start-creating-btn');
  const workspaceSection = document.getElementById('workspace');
  
  if (startCreatingBtn && workspaceSection) {
    startCreatingBtn.addEventListener('click', function() {
      workspaceSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    });
  }
}


// ───────────────────────────────────────────────────────────
// 4.2 CONTEXT TOGGLE
// ───────────────────────────────────────────────────────────

function initializeContextRefinementToggle() {
  const toggleBtn = document.getElementById('context-toggle-btn');
  const content = document.getElementById('context-refinement-content');
  
  if (toggleBtn && content) {
    toggleBtn.addEventListener('click', function() {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      
      toggleBtn.setAttribute('aria-expanded', !isExpanded);
      content.setAttribute('aria-hidden', isExpanded);
      
      if (isExpanded) {
        content.classList.remove('expanded');
      } else {
        content.classList.add('expanded');
      }
    });
  }
}


// ───────────────────────────────────────────────────────────
// 4.3 PERFORMANCE UTILITIES
// ───────────────────────────────────────────────────────────

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}


// ───────────────────────────────────────────────────────────
// 4.4 CLIPBOARD UTILITIES
// ───────────────────────────────────────────────────────────

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      showCopyTooltip('Copied!');
    } else {
      fallbackCopyToClipboard(text);
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    fallbackCopyToClipboard(text);
  }
}

function fallbackCopyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showCopyTooltip('Copied!');
    } else {
      showCopyTooltip('Please select and copy manually');
    }
  } catch (err) {
    console.error('Fallback copy failed:', err);
    showCopyTooltip('Please select and copy manually');
  }
  
  document.body.removeChild(textarea);
}

function showCopyTooltip(message) {
  const copyButton = document.getElementById('copy-button');
  if (!copyButton) return;
  
  const existingTooltip = document.querySelector('.copy-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  const tooltip = document.createElement('div');
  tooltip.className = 'copy-tooltip';
  tooltip.textContent = message;
  tooltip.setAttribute('role', 'status');
  tooltip.setAttribute('aria-live', 'polite');
  
  copyButton.parentElement.appendChild(tooltip);
  
  setTimeout(() => {
    tooltip.remove();
  }, 2000);
}


// ───────────────────────────────────────────────────────────
// 4.5 LOGGING UTILITIES
// ───────────────────────────────────────────────────────────

function logGenerationDetails(workspaceData, engineId, formattedPrompt) {
  console.group('🚀 AI Workspace Generation');
  
  console.log('%c📍 Engine Selected:', 'color: #8b5cf6; font-weight: bold; font-size: 14px;');
  console.log(`   ${engineId}`);
  console.log('');
  
  console.log('%c📦 Workspace Data:', 'color: #3b82f6; font-weight: bold; font-size: 14px;');
  console.log('   Identity:', workspaceData.identity);
  console.log('   Creation Intent:', workspaceData.creationIntent);
  console.log('   Raw Idea:', workspaceData.rawIdea);
  console.log('   Structure Customization:', workspaceData.structureCustomization);
  console.log('   Context Refinement:', workspaceData.contextRefinement);
  console.log('');
  
  console.log('%c🔍 Complete WorkspaceData Object:', 'color: #10b981; font-weight: bold; font-size: 14px;');
  console.dir(workspaceData);
  console.log('');
  
  console.groupEnd();
}
