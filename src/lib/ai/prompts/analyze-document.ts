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
  "suggestedSlideCount": 5
}
\`\`\`

Focus on:
1. Extracting actionable insights
2. Identifying quantifiable data points
3. Understanding the core message and objectives
4. Noting any specific requirements or constraints`;
