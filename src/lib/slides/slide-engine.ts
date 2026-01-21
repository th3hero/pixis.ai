import PptxGenJS from 'pptxgenjs';
import { GeneratedDeck, SlideContent, SlideStyle, BulletContent, ChartContent, TableContent, TextContent } from '@/src/types';

// Convert hex color to PptxGenJS format (without #)
function formatColor(hex: string): string {
  return hex.replace('#', '');
}

export async function createPPTX(deck: GeneratedDeck): Promise<Buffer> {
  const pptx = new PptxGenJS();
  
  // Set presentation properties
  pptx.author = 'Pixis AI';
  pptx.title = deck.title;
  pptx.subject = 'Generated Presentation';
  pptx.company = 'Pixis AI';
  
  // Set default slide size (16:9)
  pptx.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
  pptx.layout = 'LAYOUT_16x9';

  // Apply styling
  const style = deck.style;

  // Generate each slide
  for (const slideContent of deck.slides) {
    const slide = pptx.addSlide();
    
    // Add slide based on type
    switch (slideContent.type) {
      case 'title':
        createTitleSlide(slide, slideContent, style);
        break;
      case 'executive-summary':
        createExecutiveSummarySlide(slide, slideContent, style);
        break;
      case 'agenda':
        createAgendaSlide(slide, slideContent, style);
        break;
      case 'section-header':
        createSectionHeaderSlide(slide, slideContent, style);
        break;
      case 'content':
        createContentSlide(slide, slideContent, style);
        break;
      case 'two-column':
        createTwoColumnSlide(slide, slideContent, style);
        break;
      case 'chart':
        createChartSlide(slide, slideContent, style);
        break;
      case 'comparison':
        createComparisonSlide(slide, slideContent, style);
        break;
      case 'key-takeaways':
        createKeyTakeawaysSlide(slide, slideContent, style);
        break;
      default:
        createContentSlide(slide, slideContent, style);
    }

    // Add speaker notes if present
    if (slideContent.notes) {
      slide.addNotes(slideContent.notes);
    }
  }

  // Generate the PPTX file
  const pptxOutput = await pptx.write({ outputType: 'nodebuffer' });
  return pptxOutput as Buffer;
}

function createTitleSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  // Dark gradient background
  slide.background = { color: formatColor(style.primaryColor) };

  // Add subtle gradient overlay effect using shapes
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: 10,
    h: 5.625,
    fill: {
      type: 'solid',
      color: formatColor(style.primaryColor),
    },
  });

  // Decorative accent line
  slide.addShape('rect', {
    x: 0.5,
    y: 3.2,
    w: 2.5,
    h: 0.05,
    fill: { color: formatColor(style.accentColor) },
  });

  // Main title
  slide.addText(content.title, {
    x: 0.5,
    y: 1.2,
    w: 6,
    h: 1.8,
    fontSize: style.fontSize.title,
    fontFace: style.fontFamily.heading,
    color: 'FFFFFF',
    bold: true,
    align: 'left',
    valign: 'top',
  });

  // Subtitle with accent color
  if (content.subtitle) {
    slide.addText(content.subtitle, {
      x: 0.5,
      y: 2.6,
      w: 6,
      h: 0.6,
      fontSize: style.fontSize.subheading,
      fontFace: style.fontFamily.body,
      color: formatColor(style.accentColor),
      align: 'left',
      valign: 'top',
    });
  }

  // Tagline (if available in notes or use default)
  slide.addText('Future, Faster. Together', {
    x: 0.5,
    y: 3.4,
    w: 4,
    h: 0.5,
    fontSize: style.fontSize.body,
    fontFace: style.fontFamily.body,
    color: formatColor(style.accentColor),
    bold: true,
    align: 'left',
  });

  // Date
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  slide.addText(today, {
    x: 0.5,
    y: 3.9,
    w: 4,
    h: 0.4,
    fontSize: style.fontSize.caption,
    fontFace: style.fontFamily.body,
    color: 'AAAAAA',
    align: 'left',
  });

  // Brand mark in corner
  addBrandMark(slide, style);
}

function createExecutiveSummarySlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  addDarkBackground(slide, style);
  addSlideHeader(slide, content.title, style);
  
  // Add content blocks
  let yPosition = 1.4;
  for (const block of content.content) {
    if (block.type === 'bullets') {
      const bulletData = block.data as BulletContent;
      yPosition = addBulletPoints(slide, bulletData, yPosition, style);
    } else if (block.type === 'text') {
      const textData = block.data as TextContent;
      yPosition = addTextBlock(slide, textData, yPosition, style);
    }
  }

  addSlideFooter(slide, content.order, style);
  addBrandMark(slide, style);
}

function createAgendaSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  addDarkBackground(slide, style);
  addSlideHeader(slide, content.title || 'Agenda', style);
  
  let yPosition = 1.6;
  for (const block of content.content) {
    if (block.type === 'bullets' || block.type === 'numbered-list') {
      const bulletData = block.data as BulletContent;
      yPosition = addBulletPoints(slide, bulletData, yPosition, style, true);
    }
  }

  addSlideFooter(slide, content.order, style);
  addBrandMark(slide, style);
}

function createSectionHeaderSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  // Dark background
  slide.background = { color: formatColor(style.primaryColor) };

  // Accent stripe
  slide.addShape('rect', {
    x: 0,
    y: 2.2,
    w: 10,
    h: 1.2,
    fill: { color: formatColor(style.secondaryColor) },
  });

  // Accent line above title
  slide.addShape('rect', {
    x: 0.5,
    y: 2.1,
    w: 2,
    h: 0.04,
    fill: { color: formatColor(style.accentColor) },
  });

  slide.addText(content.title, {
    x: 0.5,
    y: 2.4,
    w: 9,
    h: 0.8,
    fontSize: style.fontSize.heading,
    fontFace: style.fontFamily.heading,
    color: 'FFFFFF',
    bold: true,
    align: 'left',
    valign: 'middle',
  });

  if (content.subtitle) {
    slide.addText(content.subtitle, {
      x: 0.5,
      y: 3.6,
      w: 9,
      h: 0.5,
      fontSize: style.fontSize.body,
      fontFace: style.fontFamily.body,
      color: formatColor(style.accentColor),
      align: 'left',
    });
  }

  addSlideFooter(slide, content.order, style);
  addBrandMark(slide, style);
}

function createContentSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  addDarkBackground(slide, style);
  addSlideHeader(slide, content.title, style);
  
  let yPosition = 1.4;
  for (const block of content.content) {
    switch (block.type) {
      case 'bullets':
        const bulletData = block.data as BulletContent;
        yPosition = addBulletPoints(slide, bulletData, yPosition, style);
        break;
      case 'text':
        const textData = block.data as TextContent;
        yPosition = addTextBlock(slide, textData, yPosition, style);
        break;
      case 'table':
        const tableData = block.data as TableContent;
        yPosition = addTable(slide, tableData, yPosition, style);
        break;
    }
  }

  addSlideFooter(slide, content.order, style);
  addBrandMark(slide, style);
}

function createTwoColumnSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  addDarkBackground(slide, style);
  addSlideHeader(slide, content.title, style);
  
  // Split content into two columns
  const leftContent = content.content.slice(0, Math.ceil(content.content.length / 2));
  const rightContent = content.content.slice(Math.ceil(content.content.length / 2));

  // Left column
  let leftY = 1.4;
  for (const block of leftContent) {
    if (block.type === 'bullets') {
      const bulletData = block.data as BulletContent;
      leftY = addBulletPoints(slide, bulletData, leftY, style, false, 0.5, 4.2);
    }
  }

  // Right column
  let rightY = 1.4;
  for (const block of rightContent) {
    if (block.type === 'bullets') {
      const bulletData = block.data as BulletContent;
      rightY = addBulletPoints(slide, bulletData, rightY, style, false, 5.2, 4.2);
    }
  }

  // Divider line with accent color
  slide.addShape('rect', {
    x: 4.9,
    y: 1.4,
    w: 0.02,
    h: 3.5,
    fill: { color: formatColor(style.accentColor) },
  });

  addSlideFooter(slide, content.order, style);
  addBrandMark(slide, style);
}

function createChartSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  addDarkBackground(slide, style);
  addSlideHeader(slide, content.title, style);
  
  for (const block of content.content) {
    if (block.type === 'chart') {
      const chartData = block.data as ChartContent;
      addChart(slide, chartData, style);
    }
  }

  addSlideFooter(slide, content.order, style);
  addBrandMark(slide, style);
}

function createComparisonSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  addDarkBackground(slide, style);
  addSlideHeader(slide, content.title, style);
  
  // Create comparison boxes with dark theme
  const boxWidth = 4.2;
  const boxHeight = 3.2;
  
  // Left box
  slide.addShape('rect', {
    x: 0.5,
    y: 1.4,
    w: boxWidth,
    h: boxHeight,
    fill: { color: formatColor(style.secondaryColor) },
    line: { color: formatColor(style.accentColor), width: 1 },
  });

  // Right box
  slide.addShape('rect', {
    x: 5.3,
    y: 1.4,
    w: boxWidth,
    h: boxHeight,
    fill: { color: formatColor(style.secondaryColor) },
    line: { color: formatColor(style.accentColor), width: 1 },
  });

  // Add content to boxes
  if (content.content.length >= 2) {
    const leftData = content.content[0].data as BulletContent;
    const rightData = content.content[1].data as BulletContent;
    
    addBulletPoints(slide, leftData, 1.6, style, false, 0.7, 3.8);
    addBulletPoints(slide, rightData, 1.6, style, false, 5.5, 3.8);
  }

  addSlideFooter(slide, content.order, style);
  addBrandMark(slide, style);
}

function createKeyTakeawaysSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  addDarkBackground(slide, style);
  
  // Accent stripe on left
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: 0.15,
    h: 5.625,
    fill: { color: formatColor(style.accentColor) },
  });

  addSlideHeader(slide, content.title || 'Key Takeaways', style);
  
  let yPosition = 1.6;
  for (const block of content.content) {
    if (block.type === 'bullets') {
      const bulletData = block.data as BulletContent;
      // Use numbered list for takeaways
      yPosition = addBulletPoints(slide, bulletData, yPosition, style, true);
    }
  }

  addSlideFooter(slide, content.order, style);
  addBrandMark(slide, style);
}

// Helper functions
function addDarkBackground(slide: PptxGenJS.Slide, style: SlideStyle): void {
  slide.background = { color: formatColor(style.primaryColor) };
}

function addBrandMark(slide: PptxGenJS.Slide, style: SlideStyle): void {
  // Brand mark in top-left corner
  slide.addText('PIXIS', {
    x: 0.3,
    y: 0.2,
    w: 0.8,
    h: 0.3,
    fontSize: 10,
    fontFace: style.fontFamily.heading,
    color: formatColor(style.accentColor),
    bold: true,
    align: 'left',
  });
}

function addSlideHeader(
  slide: PptxGenJS.Slide,
  title: string,
  style: SlideStyle
): void {
  // Header background bar
  slide.addShape('rect', {
    x: 0,
    y: 0.6,
    w: 10,
    h: 0.7,
    fill: { color: formatColor(style.secondaryColor) },
  });

  // Accent line under header
  slide.addShape('rect', {
    x: 0,
    y: 1.3,
    w: 10,
    h: 0.03,
    fill: { color: formatColor(style.accentColor) },
  });

  // Title text
  slide.addText(title, {
    x: 0.5,
    y: 0.65,
    w: 9,
    h: 0.6,
    fontSize: style.fontSize.heading - 8,
    fontFace: style.fontFamily.heading,
    color: 'FFFFFF',
    bold: true,
    align: 'left',
    valign: 'middle',
  });
}

function addSlideFooter(
  slide: PptxGenJS.Slide,
  pageNumber: number,
  style: SlideStyle
): void {
  // Footer line
  slide.addShape('rect', {
    x: 0.5,
    y: 5.1,
    w: 9,
    h: 0.02,
    fill: { color: formatColor(style.accentColor) },
  });

  // Page number
  slide.addText(pageNumber.toString(), {
    x: 0.3,
    y: 5.2,
    w: 0.5,
    h: 0.3,
    fontSize: 12,
    fontFace: style.fontFamily.body,
    color: 'FFFFFF',
    bold: true,
    align: 'left',
  });
}

function addBulletPoints(
  slide: PptxGenJS.Slide,
  bulletData: BulletContent,
  startY: number,
  style: SlideStyle,
  numbered: boolean = false,
  startX: number = 0.5,
  width: number = 9
): number {
  const textRows: PptxGenJS.TextProps[] = [];
  
  bulletData.items.forEach((item, index) => {
    // Main bullet point
    textRows.push({
      text: item.text,
      options: {
        bullet: numbered 
          ? { type: 'number' } 
          : { characterCode: '25CF' },
        indentLevel: 0,
        fontSize: style.fontSize.body,
        fontFace: style.fontFamily.body,
        color: 'FFFFFF',
        paraSpaceBefore: 8,
        paraSpaceAfter: 4,
      },
    });

    // Sub-items
    if (item.subItems && item.subItems.length > 0) {
      item.subItems.forEach(subItem => {
        textRows.push({
          text: subItem,
          options: {
            bullet: { characterCode: '2013' },
            indentLevel: 1,
            fontSize: style.fontSize.body - 2,
            fontFace: style.fontFamily.body,
            color: 'AAAAAA',
            paraSpaceBefore: 2,
            paraSpaceAfter: 2,
          },
        });
      });
    }
  });

  const estimatedHeight = textRows.length * 0.38;
  
  slide.addText(textRows, {
    x: startX,
    y: startY,
    w: width,
    h: Math.min(estimatedHeight, 3.5),
    valign: 'top',
  });

  return startY + estimatedHeight + 0.2;
}

function addTextBlock(
  slide: PptxGenJS.Slide,
  textData: TextContent,
  startY: number,
  style: SlideStyle
): number {
  const fontSize = textData.style === 'emphasis' 
    ? style.fontSize.body + 2 
    : style.fontSize.body;
  
  slide.addText(textData.text, {
    x: 0.5,
    y: startY,
    w: 9,
    h: 0.8,
    fontSize: fontSize,
    fontFace: style.fontFamily.body,
    color: textData.style === 'emphasis' ? formatColor(style.accentColor) : 'FFFFFF',
    bold: textData.style === 'emphasis',
    align: 'left',
    valign: 'top',
  });

  return startY + 0.9;
}

function addTable(
  slide: PptxGenJS.Slide,
  tableData: TableContent,
  startY: number,
  style: SlideStyle
): number {
  const rows: PptxGenJS.TableRow[] = [
    // Header row
    tableData.headers.map(header => ({
      text: header,
      options: {
        bold: true,
        fill: { color: formatColor(style.secondaryColor) },
        color: 'FFFFFF',
        fontSize: style.fontSize.body,
        fontFace: style.fontFamily.body,
      },
    })),
    // Data rows
    ...tableData.rows.map(row =>
      row.map(cell => ({
        text: cell,
        options: {
          fontSize: style.fontSize.body - 1,
          fontFace: style.fontFamily.body,
          color: 'FFFFFF',
          fill: { color: formatColor(style.primaryColor) },
        },
      }))
    ),
  ];

  slide.addTable(rows, {
    x: 0.5,
    y: startY,
    w: 9,
    colW: 9 / tableData.headers.length,
    border: { color: formatColor(style.accentColor), pt: 0.5 },
    align: 'left',
    valign: 'middle',
  });

  return startY + (rows.length * 0.4) + 0.3;
}

function addChart(
  slide: PptxGenJS.Slide,
  chartData: ChartContent,
  style: SlideStyle
): void {
  const chartType = chartData.chartType === 'bar' ? 'bar' 
    : chartData.chartType === 'line' ? 'line'
    : chartData.chartType === 'pie' ? 'pie'
    : 'bar';

  const data = [{
    name: chartData.title || 'Data',
    labels: chartData.data.map(d => d.label),
    values: chartData.data.map(d => d.value),
  }];

  slide.addChart(chartType as PptxGenJS.CHART_NAME, data, {
    x: 1,
    y: 1.5,
    w: 8,
    h: 3.2,
    showLegend: true,
    legendPos: 'b',
    legendColor: 'FFFFFF',
    showTitle: !!chartData.title,
    title: chartData.title,
    titleFontSize: style.fontSize.body,
    titleColor: 'FFFFFF',
    chartColors: [formatColor(style.accentColor), '00A3E0', 'F5B800', 'E74C3C', '2ECC71'],
  });
}
