export const EXTRACT_STYLE_FROM_GUIDELINES_PROMPT = `Analyze this brand guidelines document and extract styling information for presentations.

<guidelines>
{guidelinesContent}
</guidelines>

Extract the following information:
\`\`\`json
{
  "brandName": "Company/Brand name",
  "colors": {
    "primary": "#hexcode or color description",
    "secondary": "#hexcode or color description", 
    "accent": "#hexcode or color description",
    "background": "#hexcode or 'white'",
    "text": "#hexcode or 'dark gray'",
    "textLight": "#hexcode or 'gray'"
  },
  "typography": {
    "headingFont": "Font name for headings",
    "bodyFont": "Font name for body text",
    "notes": "Any specific typography guidelines"
  },
  "voiceAndTone": {
    "tone": "formal|professional|friendly|technical",
    "keywords": ["key brand words"],
    "avoid": ["words/phrases to avoid"]
  },
  "visualGuidelines": {
    "logoUsage": "Guidelines for logo placement",
    "imageStyle": "Photography/illustration style",
    "iconStyle": "Icon style if mentioned"
  },
  "presentationSpecific": {
    "slideLayout": "Any layout preferences",
    "headerStyle": "Header formatting guidelines",
    "bulletStyle": "Bullet point preferences"
  }
}
\`\`\`

If specific values aren't mentioned, use null. Extract as much as possible from the document.`;

export const INFER_STYLE_FROM_DECK_PROMPT = `Analyze this reference presentation content and infer the styling preferences.

<presentation_content>
{presentationContent}
</presentation_content>

Based on the content structure and any visible patterns, infer:
\`\`\`json
{
  "inferredStyle": {
    "headlineStyle": "action-oriented|topic-based|question-based",
    "contentDensity": "minimal|moderate|detailed",
    "bulletStyle": "short-phrases|complete-sentences|mixed",
    "dataPresentation": "charts-heavy|text-heavy|balanced",
    "narrativeFlow": "problem-solution|chronological|thematic"
  },
  "suggestedApproach": {
    "slideCount": 5,
    "emphasisAreas": ["area1", "area2"],
    "tone": "executive|technical|persuasive"
  },
  "patterns": [
    "Observed pattern 1",
    "Observed pattern 2"
  ]
}
\`\`\``;

export const APPLY_STYLE_PROMPT = `Apply the following brand style to the presentation content.

Brand Style:
\`\`\`json
{brandStyle}
\`\`\`

Current Slides:
\`\`\`json
{currentSlides}
\`\`\`

Adjust the slides to:
1. Match the brand voice and tone
2. Use appropriate terminology
3. Follow visual hierarchy guidelines
4. Maintain McKinsey-style professionalism while incorporating brand elements

Return the styled slides in the same JSON format.`;
