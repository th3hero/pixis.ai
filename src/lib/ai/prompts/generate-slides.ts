export const GENERATE_SLIDES_PROMPT = `You are an expert presentation designer specializing in McKinsey-style executive presentations.

Create a professional slide deck based on the following document content:

<document>
{documentContent}
</document>

Requirements:
- Generate exactly {slideCount} slides
- Use McKinsey consulting style: clear headlines that state the key takeaway, structured content, data-driven insights
- Each slide title should be an action-oriented statement (not just a topic)
- Focus areas: {focusAreas}
- Tone: {tone}

Slide types available:
- title: Opening slide with presentation title and subtitle
- executive-summary: Key takeaways and recommendations overview
- agenda: Outline of presentation structure
- section-header: Transition slide for new sections
- content: Standard content slide with bullets or text
- two-column: Comparison or side-by-side content
- chart: Data visualization slide
- comparison: Before/after or option comparison
- timeline: Sequential events or milestones
- key-takeaways: Summary of main points
- appendix: Supporting details

Return the slides in this JSON format:
\`\`\`json
{
  "title": "Presentation title",
  "slides": [
    {
      "id": "slide-1",
      "type": "title",
      "title": "Main presentation title",
      "subtitle": "Subtitle or tagline",
      "content": [],
      "notes": "Speaker notes for this slide",
      "order": 1
    },
    {
      "id": "slide-2", 
      "type": "executive-summary",
      "title": "Action-oriented headline stating the key insight",
      "content": [
        {
          "type": "bullets",
          "data": {
            "items": [
              {"text": "Key point 1", "subItems": ["Supporting detail"]},
              {"text": "Key point 2", "subItems": []}
            ]
          }
        }
      ],
      "notes": "Speaker notes",
      "order": 2
    }
  ]
}
\`\`\`

Guidelines for McKinsey-style slides:
1. Headlines should be complete sentences that state the "so what"
2. Use the pyramid principle: lead with conclusion, then support
3. Limit bullets to 3-5 per slide
4. Include specific numbers and data points where available
5. Each slide should have one clear message
6. Use action verbs in recommendations`;

export const REFINE_SLIDE_PROMPT = `You are refining a specific slide in a McKinsey-style presentation.

Current slide:
\`\`\`json
{currentSlide}
\`\`\`

User feedback: {userFeedback}

Original document context:
<document>
{documentContext}
</document>

Provide the refined slide in the same JSON format, maintaining McKinsey style guidelines:
- Action-oriented headline
- Clear, concise content
- Data-driven where possible

Return only the updated slide JSON:
\`\`\`json
{
  "id": "...",
  "type": "...",
  "title": "...",
  "content": [...],
  "notes": "..."
}
\`\`\``;

export const SUGGEST_IMPROVEMENTS_PROMPT = `Review this presentation slide deck and suggest improvements:

\`\`\`json
{slides}
\`\`\`

Analyze for:
1. Message clarity and impact
2. Logical flow between slides
3. Data presentation effectiveness
4. Adherence to McKinsey style
5. Missing information or gaps

Return suggestions as JSON:
\`\`\`json
{
  "overallScore": 8,
  "strengths": ["strength1", "strength2"],
  "improvements": [
    {
      "slideId": "slide-2",
      "issue": "Description of the issue",
      "suggestion": "How to improve it",
      "priority": "high|medium|low"
    }
  ],
  "missingElements": ["element1", "element2"],
  "flowSuggestions": "Suggestions for better narrative flow"
}
\`\`\``;
