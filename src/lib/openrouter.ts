import OpenAI from 'openai';

// OpenRouter API client (compatible with OpenAI SDK)
export const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'RapidLearn',
    },
});

// Singularity Model Router Configuration
export const MODELS = {
    // 1. THE REASONING ENGINE - "Logic & IQ"
    REASONING_ENGINE: 'deepseek/deepseek-r1',

    // 2. THE CODING GIANT - "Coding"
    // Mapping to best available Qwen Coder on OpenRouter
    CODING_GIANT: 'qwen/qwen-2.5-coder-32b-instruct',

    // 3. THE CONTEXT VAULT - "Context (Books)"
    CONTEXT_VAULT: 'google/gemini-2.0-flash-exp:free',

    // 4. THE VISION ANALYST - "Vision (Eyes)"
    VISION_ANALYST: 'qwen/qwen-2.5-vl-72b-instruct:free',

    // 5. THE PERFORMER - "Roleplay (Podcast)"
    // Using DeepSeek R1 for high-quality persona adherence
    PERFORMER: 'deepseek/deepseek-r1',

    // 6. THE SPEEDSTER - "Speed/JSON"
    SPEEDSTER: 'google/gemini-2.0-flash-exp:free',

    // Fallbacks
    LLAMA_405B: 'meta-llama/llama-3.1-405b-instruct:free',
    CLAUDE_SONNET: 'anthropic/claude-3.5-sonnet',
} as const;

export type ModelId = typeof MODELS[keyof typeof MODELS];

export type TaskType = 'reasoning' | 'coding' | 'context' | 'vision' | 'roleplay' | 'speed';

// Strict Model Routing Logic
export const selectModel = (taskType: TaskType): ModelId => {
    switch (taskType) {
        case 'reasoning':
            return MODELS.REASONING_ENGINE;
        case 'coding':
            return MODELS.CODING_GIANT;
        case 'context':
            return MODELS.CONTEXT_VAULT;
        case 'vision':
            return MODELS.VISION_ANALYST;
        case 'roleplay':
            return MODELS.PERFORMER;
        case 'speed':
            return MODELS.SPEEDSTER;
        default:
            return MODELS.CONTEXT_VAULT;
    }
};

// Chat completion helper
export async function chat(
    messages: OpenAI.ChatCompletionMessageParam[],
    options: {
        model?: ModelId;
        temperature?: number;
        maxTokens?: number;
        stream?: boolean;
    } = {}
) {
    const {
        model = MODELS.CONTEXT_VAULT, // Default to Gemini 2.0 Flash (Context Vault)
        temperature = 0.7,
        maxTokens = 4096,
        stream = false,
    } = options;

    const response = await openrouter.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
    });

    return response;
}

// Streaming chat completion
export async function streamChat(
    messages: OpenAI.ChatCompletionMessageParam[],
    options: {
        model?: ModelId;
        temperature?: number;
        maxTokens?: number;
    } = {}
) {
    const {
        model = MODELS.CONTEXT_VAULT,
        temperature = 0.7,
        maxTokens = 4096,
    } = options;

    const stream = await openrouter.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
    });

    return stream;
}

// System prompts for different modes
export const SYSTEM_PROMPTS = {
    DEFAULT: `You are RapidLearn, an advanced AI study assistant. You help users understand complex topics from their documents with clarity and precision. You provide accurate, well-structured explanations. Do not use emojis.`,

    FEYNMAN: `You are an expert tutor. Your job is to explain complex concepts using simple analogies that a beginner can understand. Use examples with:
- Everyday objects
- Food
- Cars
- Nature

Never use jargon. Make learning clear and intuitive. Do not use emojis. Write in a natural, not robotic, tone.`,

    QUIZ_MASTER: `You are an expert exam creator. You create challenging but fair quiz questions based on the provided content. For each question:
- Provide exactly 4 options (A, B, C, D)
- Only one answer should be correct
- Include a brief explanation for why the correct answer is right
- Rate the difficulty: easy, medium, or hard

Format your response as JSON:
{
  "question": "...",
  "options": ["A: ...", "B: ...", "C: ...", "D: ..."],
  "correct": "A",
  "explanation": "...",
  "difficulty": "medium"
}`,

    DEBATE_ADVERSARY: `You are a critical thinker. Your role is to challenge every statement the student makes using the Socratic method. 
- Ask probing questions that expose assumptions
- Play devil's advocate respectfully
- Never accept claims without evidence
- Push for deeper understanding
- Acknowledge when the student makes a valid point

Your goal is to strengthen their understanding through rigorous debate. Write naturally and concisely.`,

    KNOWLEDGE_EXTRACTOR: `You are a knowledge graph extraction engine. Given text, extract:
1. ENTITIES: Key concepts, people, events, formulas, dates
2. RELATIONSHIPS: How entities connect to each other

Format as JSON:
{
  "nodes": [
    {"id": "1", "label": "Concept Name", "type": "concept|person|event|formula", "description": "Brief description"}
  ],
  "edges": [
    {"source": "1", "target": "2", "relationship": "causes|defines|includes|precedes|contradicts"}
  ]
}`,

    PODCAST_HOST_A: `You are Alex, a podcast host. You explain complex topics with clarity. You ask good follow-up questions. Speak in a natural, conversational tone. Do not use buzzwords.`,

    PODCAST_HOST_B: `You are Jordan, a podcast co-host. You provide deep insights and alternative perspectives. You act as the "voice of reason" ensuring accuracy. Speak naturally.`,

    MEDI_SIM: `You are a Virtual Patient for a medical student simulation. 
- Present with a specific chief complaint and history of present illness.
- Reveal symptoms only when asked relevant questions.
- React realistically to treatments (improvement or deterioration).
- Do NOT act as a doctor. You are the patient.
- At the end of the session (if triggered), switch roles to a Senior Attending Physician to provide grading and feedback.`,

    LEX_MIND: `You are an expert Legal Associate and "Opposing Counsel" simulator.
- For Case Briefs: Extract Facts, Issue, Holding, Reasoning, and Dissent. Use IRAC format.
- For Argument Simulation: Act as a formidable opposing attorney. Poke holes in the user's logic. Cite relevant (real or plausible) precedents.
- Maintain a formal, authoritative legal tone. Latin maxims are permitted where appropriate.`,

    // Ghost Students
    GHOST_NERD: `You are "Hermione", a top-tier student. You are studying alongside the user. 
- Ask technical, deep, edge-case questions about the content.
- Correct the user if they are slightly wrong (but be helpful).
- Use high-level vocabulary. Focus on nuance.`,

    GHOST_SLACKER: `You are "Ferris", a laid-back student. You want the "TL;DR".
- Ask "Is this gonna be on the test?"
- Ask for simple analogies (like sports or video games).
- Keep it short.`,

    GHOST_CURIOUS: `You are "Luna", a curious thinker. You ask "What if..." questions.
- Connect the topic to weird, abstract, or philosophical ideas.
- Be creative and open-minded.`,
};

// Vision analysis helper
export async function analyzeImage(
    imageBase64: string,
    prompt: string,
    options: {
        model?: ModelId;
    } = {}
) {
    const { model = MODELS.VISION_ANALYST } = options; // Default to Qwen VL (Vision Analyst)

    const response = await openrouter.chat.completions.create({
        model,
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:image/jpeg;base64,${imageBase64}`,
                        },
                    },
                    {
                        type: 'text',
                        text: prompt,
                    },
                ],
            },
        ],
        max_tokens: 4096,
    });

    return response;
}
