/**
 * Auto-calculate issue priority based on multiple factors:
 * 1. AI-powered analysis of description and severity
 * 2. Category severity (some categories are inherently more urgent)
 * 3. Urgency keywords in title/description (fallback)
 * 4. Number of similar issues in the area
 * 5. Image analysis (if photos provided)
 */

interface PriorityCalculationParams {
  category: string;
  title: string;
  description: string;
  similarIssuesCount?: number;
  photos?: string[]; // URLs or base64 of photos
  useAI?: boolean; // Enable AI-powered priority detection
}

// Category-based base priority scores (0-100)
const CATEGORY_SEVERITY: Record<string, number> = {
  'Safety & Security': 90,
  'Health & Sanitation': 85,
  'Water Supply': 80,
  'Electricity': 75,
  'Road & Infrastructure': 70,
  'Street Lights': 65,
  'Waste Management': 60,
  'Public Transport': 55,
  'Parks & Recreation': 45,
  'Education': 50,
  'Other': 40,
};

// Critical urgency keywords that significantly increase priority
const CRITICAL_KEYWORDS = [
  'emergency',
  'urgent',
  'dangerous',
  'hazardous',
  'life-threatening',
  'critical',
  'severe',
  'immediate',
  'fatal',
  'death',
  'injury',
  'injured',
  'accident',
  'collapsed',
  'fire',
  'explosion',
  'leak',
  'flooding',
  'burst',
  'broken glass',
  'exposed wire',
  'live wire',
  'electric shock',
  'gas leak',
  'contaminated',
  'toxic',
  'overflow',
  'manholes',
  'open manhole',
];

// High urgency keywords
const HIGH_URGENCY_KEYWORDS = [
  'broken',
  'damaged',
  'not working',
  'malfunctioning',
  'blocked',
  'overflowing',
  'stagnant',
  'foul smell',
  'spreading',
  'growing',
  'worse',
  'deteriorating',
  'multiple',
  'several',
  'many',
  'weeks',
  'days',
];

// Medium urgency keywords
const MEDIUM_URGENCY_KEYWORDS = [
  'issue',
  'problem',
  'concern',
  'needs attention',
  'requires',
  'should be',
  'would be',
  'improvement',
  'repair',
  'fix',
  'maintenance',
];

/**
 * Calculate priority score (0-100) based on various factors
 */
export function calculatePriorityScore(params: PriorityCalculationParams): number {
  const { category, title, description, similarIssuesCount = 0 } = params;

  // Start with category-based score
  let score = CATEGORY_SEVERITY[category] || 50;

  // Combine title and description for keyword analysis
  const content = `${title} ${description}`.toLowerCase();

  // Add points for critical keywords (each adds 30 points, max 30)
  const criticalMatches = CRITICAL_KEYWORDS.filter((keyword) =>
    content.includes(keyword.toLowerCase())
  );
  if (criticalMatches.length > 0) {
    score += 30; // Boost to critical if any critical keyword found
  }

  // Add points for high urgency keywords (each adds 15 points, max 15)
  const highUrgencyMatches = HIGH_URGENCY_KEYWORDS.filter((keyword) =>
    content.includes(keyword.toLowerCase())
  );
  if (highUrgencyMatches.length > 0 && criticalMatches.length === 0) {
    score += 15;
  }

  // Add points for medium urgency keywords (each adds 5 points, max 10)
  const mediumUrgencyMatches = MEDIUM_URGENCY_KEYWORDS.filter((keyword) =>
    content.includes(keyword.toLowerCase())
  );
  if (mediumUrgencyMatches.length > 0 && criticalMatches.length === 0 && highUrgencyMatches.length === 0) {
    score += Math.min(mediumUrgencyMatches.length * 5, 10);
  }

  // Add points based on similar issues count (indicates widespread problem)
  // Each similar issue adds 2 points, max 20 points
  if (similarIssuesCount > 0) {
    score += Math.min(similarIssuesCount * 2, 20);
  }

  // Cap the score at 100
  return Math.min(score, 100);
}

/**
 * Convert priority score to priority level
 */
export function getPriorityLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (score >= 85) return 'Critical';
  if (score >= 70) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}

/**
 * Main function to calculate priority with explanation
 */
export async function calculateIssuePriority(params: PriorityCalculationParams): Promise<{
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  score: number;
  factors: string[];
  aiAnalysis?: string;
}> {
  const { useAI = true } = params;

  // Try AI-powered detection first if enabled
  if (useAI) {
    try {
      const aiResult = await detectPriorityWithAI(params);
      if (aiResult) {
        return aiResult;
      }
    } catch (error) {
      console.warn('AI priority detection failed, falling back to rule-based:', error);
    }
  }

  // Fallback to rule-based calculation
  const score = calculatePriorityScore(params);
  const priority = getPriorityLevel(score);
  const factors: string[] = [];

  // Build explanation of factors
  const { category, title, description, similarIssuesCount = 0 } = params;
  const content = `${title} ${description}`.toLowerCase();

  factors.push(`Category: ${category} (base severity)`);

  const criticalMatches = CRITICAL_KEYWORDS.filter((keyword) =>
    content.includes(keyword.toLowerCase())
  );
  if (criticalMatches.length > 0) {
    factors.push(`Critical keywords detected: ${criticalMatches.slice(0, 3).join(', ')}`);
  }

  const highUrgencyMatches = HIGH_URGENCY_KEYWORDS.filter((keyword) =>
    content.includes(keyword.toLowerCase())
  );
  if (highUrgencyMatches.length > 0) {
    factors.push(`Urgency indicators: ${highUrgencyMatches.slice(0, 3).join(', ')}`);
  }

  if (similarIssuesCount > 0) {
    factors.push(`${similarIssuesCount} similar issue(s) in area (widespread problem)`);
  }

  return { priority, score, factors };
}

/**
 * AI-powered priority detection using LLM
 */
async function detectPriorityWithAI(
  params: PriorityCalculationParams
): Promise<{
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  score: number;
  factors: string[];
  aiAnalysis: string;
} | null> {
  const { category, title, description, similarIssuesCount = 0, photos = [] } = params;

  // Check if AI API key is available
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('No AI API key found, skipping AI analysis');
    return null;
  }

  try {
    const prompt = `You are an expert civic issue triage system. Analyze this civic issue report and determine its priority level.

**Issue Details:**
- Category: ${category}
- Title: ${title}
- Description: ${description}
- Similar issues in area: ${similarIssuesCount}
- Photos attached: ${photos.length}

**Priority Levels:**
- Critical (85-100): Immediate safety threats, life-threatening situations, major infrastructure failures
- High (70-84): Significant problems requiring urgent attention, public safety concerns
- Medium (50-69): Important issues needing timely resolution, quality of life impacts
- Low (0-49): Minor concerns for routine maintenance, aesthetic improvements

**Analysis Instructions:**
1. Consider public safety impact
2. Assess urgency and time sensitivity
3. Evaluate potential for escalation
4. Consider community impact (number of affected citizens)
5. Factor in similar issues count (indicates widespread problem)

**Response Format (JSON):**
{
  "priority": "Critical|High|Medium|Low",
  "score": 0-100,
  "reasoning": "Brief explanation of why this priority was assigned",
  "safetyRisk": "None|Low|Moderate|High|Critical",
  "urgencyLevel": "Can wait|Within week|Within 24h|Immediate",
  "impactAssessment": "Description of potential impact"
}

Provide ONLY the JSON response, no additional text.`;

    let aiResponse;

    // Try Gemini first (preferred for cost and speed)
    if (process.env.GEMINI_API_KEY) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      aiResponse = data.candidates[0].content.parts[0].text;
    }
    // OpenAI as fallback
    else if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Fast and cost-effective
          messages: [
            {
              role: 'system',
              content: 'You are an expert civic issue triage AI. Respond only with valid JSON.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3, // Lower temperature for consistent prioritization
          max_tokens: 500,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      aiResponse = data.choices[0].message.content;
    }

    if (!aiResponse) {
      return null;
    }

    // Parse AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Could not parse AI response as JSON');
      return null;
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Build factors array from AI analysis
    const factors = [
      `AI Analysis: ${analysis.reasoning}`,
      `Safety Risk: ${analysis.safetyRisk}`,
      `Urgency: ${analysis.urgencyLevel}`,
      `Impact: ${analysis.impactAssessment}`,
    ];

    if (similarIssuesCount > 0) {
      factors.push(`${similarIssuesCount} similar issue(s) in area`);
    }

    return {
      priority: analysis.priority,
      score: analysis.score,
      factors,
      aiAnalysis: analysis.reasoning,
    };
  } catch (error) {
    console.error('AI priority detection error:', error);
    return null;
  }
}

/**
 * Analyze images using AI vision models
 */
export async function analyzeIssueImages(imageUrls: string[]): Promise<{
  severity: string;
  description: string;
  detectedHazards: string[];
} | null> {
  if (imageUrls.length === 0) return null;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `Analyze this civic issue photo and provide:
1. Severity assessment (Low/Medium/High/Critical)
2. Brief description of what you see
3. List of any safety hazards detected

Respond in JSON format:
{
  "severity": "Low|Medium|High|Critical",
  "description": "What you see in the image",
  "detectedHazards": ["hazard1", "hazard2"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: imageUrls[0] }, // Analyze first image
              },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`Vision API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error) {
    console.error('Image analysis error:', error);
    return null;
  }
}
