export const ANALYZE_DOCUMENT_PROMPT = `You are an expert business analyst specializing in extracting key insights from corporate documents.

Analyze the following document and provide a structured analysis:

<document>
{documentContent}
</document>

Provide your analysis in the following JSON format:
\`\`\`json
{
  "title": "Document title or inferred title",
  "documentType": "rfp|proposal|report|guidelines|other",
  "executiveSummary": "2-3 sentence summary of the entire document",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "mainSections": [
    {
      "title": "Section title",
      "summary": "Brief summary of this section",
      "keyPoints": ["point1", "point2"]
    }
  ],
  "keyFindings": ["finding1", "finding2", "finding3"],
  "recommendations": ["recommendation1", "recommendation2"],
  "dataPoints": [
    {
      "metric": "metric name",
      "value": "value",
      "context": "brief context"
    }
  ],
  "stakeholders": ["stakeholder1", "stakeholder2"],
  "timeline": "any mentioned timeline or deadlines",
  "suggestedSlideCount": 5
}
\`\`\`

Focus on:
1. Extracting actionable insights
2. Identifying quantifiable data points
3. Understanding the core message and objectives
4. Noting any specific requirements or constraints`;

export const EXTRACT_KEY_POINTS_PROMPT = `Extract the most important points from this document that should be highlighted in an executive presentation.

<document>
{documentContent}
</document>

Return as JSON:
\`\`\`json
{
  "keyPoints": [
    {
      "point": "The key point statement",
      "importance": "high|medium|low",
      "category": "finding|recommendation|data|context",
      "supportingEvidence": "Brief evidence or source from document"
    }
  ]
}
\`\`\`

Limit to the top 10 most impactful points.`;

export const COMBINE_DOCUMENTS_PROMPT = `You are analyzing multiple related business documents to create a unified presentation.

Documents provided:
{documentsContent}

Create a unified analysis that:
1. Identifies common themes across documents
2. Resolves any conflicting information
3. Creates a coherent narrative
4. Prioritizes information by relevance

Return as JSON:
\`\`\`json
{
  "unifiedTitle": "Suggested presentation title",
  "narrative": "The overarching story these documents tell",
  "commonThemes": ["theme1", "theme2"],
  "keyMessages": [
    {
      "message": "Key message",
      "sources": ["doc1", "doc2"],
      "priority": 1
    }
  ],
  "suggestedStructure": [
    {
      "slideType": "title|executive-summary|content|chart|recommendations",
      "topic": "What this slide should cover",
      "sourceDocuments": ["doc names"]
    }
  ]
}
\`\`\``;
