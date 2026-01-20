import PptxGenJS from 'pptxgenjs';
import { GeneratedDeck, SlideContent, SlideStyle, BulletContent, ChartContent, TableContent, TextContent } from '@/src/types';

// Convert hex color to PptxGenJS format (without #)
function formatColor(hex: string): string {
  return hex.replace('#', '');
}

export async function createPPTX(deck: GeneratedDeck): Promise<Buffer> {
  const pptx = new PptxGenJS();
  
  // Set presentation properties
  pptx.author = 'DeckForge AI';
  pptx.title = deck.title;
  pptx.subject = 'Generated Presentation';
  pptx.company = 'DeckForge AI';
  
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
  // Background
  slide.background = { color: formatColor(style.primaryColor) };

  // Main title
  slide.addText(content.title, {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1.2,
    fontSize: style.fontSize.title,
    fontFace: style.fontFamily.heading,
    color: 'FFFFFF',
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  // Subtitle
  if (content.subtitle) {
    slide.addText(content.subtitle, {
      x: 0.5,
      y: 3.3,
      w: 9,
      h: 0.6,
      fontSize: style.fontSize.subheading,
      fontFace: style.fontFamily.body,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
    });
  }

  // Date
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  slide.addText(today, {
    x: 0.5,
    y: 4.8,
    w: 9,
    h: 0.4,
    fontSize: style.fontSize.caption,
    fontFace: style.fontFamily.body,
    color: 'CCCCCC',
    align: 'center',
  });
}

function createExecutiveSummarySlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  addSlideHeader(slide, content.title, style);
  
  // Add content blocks
  let yPosition = 1.2;
  for (const block of content.content) {
    if (block.type === 'bullets') {
      const bulletData = block.data as BulletContent;
      yPosition = addBulletPoints(slide, bulletData, yPosition, style);
    } else if (block.type === 'text') {
      const textData = block.data as TextContent;
      yPosition = addTextBlock(slide, textData, yPosition, style);
    }
  }

  addSlideFooter(slide, style);
}

function createAgendaSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  addSlideHeader(slide, content.title || 'Agenda', style);
  
  let yPosition = 1.4;
  for (const block of content.content) {
    if (block.type === 'bullets' || block.type === 'numbered-list') {
      const bulletData = block.data as BulletContent;
      yPosition = addBulletPoints(slide, bulletData, yPosition, style, true);
    }
  }

  addSlideFooter(slide, style);
}

function createSectionHeaderSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  // Accent color background stripe
  slide.addShape('rect', {
    x: 0,
    y: 2,
    w: 10,
    h: 1.5,
    fill: { color: formatColor(style.secondaryColor) },
  });

  slide.addText(content.title, {
    x: 0.5,
    y: 2.2,
    w: 9,
    h: 1,
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
      color: formatColor(style.primaryColor),
      align: 'left',
    });
  }
}

function createContentSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  addSlideHeader(slide, content.title, style);
  
  let yPosition = 1.2;
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

  addSlideFooter(slide, style);
}

function createTwoColumnSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  addSlideHeader(slide, content.title, style);
  
  // Split content into two columns
  const leftContent = content.content.slice(0, Math.ceil(content.content.length / 2));
  const rightContent = content.content.slice(Math.ceil(content.content.length / 2));

  // Left column
  let leftY = 1.2;
  for (const block of leftContent) {
    if (block.type === 'bullets') {
      const bulletData = block.data as BulletContent;
      leftY = addBulletPoints(slide, bulletData, leftY, style, false, 0.5, 4.2);
    }
  }

  // Right column
  let rightY = 1.2;
  for (const block of rightContent) {
    if (block.type === 'bullets') {
      const bulletData = block.data as BulletContent;
      rightY = addBulletPoints(slide, bulletData, rightY, style, false, 5.2, 4.2);
    }
  }

  // Divider line
  slide.addShape('line', {
    x: 4.9,
    y: 1.2,
    w: 0,
    h: 3.8,
    line: { color: formatColor(style.accentColor), width: 1 },
  });

  addSlideFooter(slide, style);
}

function createChartSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  addSlideHeader(slide, content.title, style);
  
  for (const block of content.content) {
    if (block.type === 'chart') {
      const chartData = block.data as ChartContent;
      addChart(slide, chartData, style);
    }
  }

  addSlideFooter(slide, style);
}

function createComparisonSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  addSlideHeader(slide, content.title, style);
  
  // Create comparison boxes
  const boxWidth = 4.2;
  const boxHeight = 3.5;
  
  // Left box
  slide.addShape('rect', {
    x: 0.5,
    y: 1.2,
    w: boxWidth,
    h: boxHeight,
    fill: { color: 'F5F5F5' },
    line: { color: formatColor(style.primaryColor), width: 2 },
  });

  // Right box
  slide.addShape('rect', {
    x: 5.3,
    y: 1.2,
    w: boxWidth,
    h: boxHeight,
    fill: { color: 'F5F5F5' },
    line: { color: formatColor(style.secondaryColor), width: 2 },
  });

  // Add content to boxes
  if (content.content.length >= 2) {
    const leftData = content.content[0].data as BulletContent;
    const rightData = content.content[1].data as BulletContent;
    
    addBulletPoints(slide, leftData, 1.4, style, false, 0.7, 3.8);
    addBulletPoints(slide, rightData, 1.4, style, false, 5.5, 3.8);
  }

  addSlideFooter(slide, style);
}

function createKeyTakeawaysSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  style: SlideStyle
): void {
  // Special styling for key takeaways
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: 0.3,
    h: 5.625,
    fill: { color: formatColor(style.accentColor) },
  });

  addSlideHeader(slide, content.title || 'Key Takeaways', style);
  
  let yPosition = 1.4;
  for (const block of content.content) {
    if (block.type === 'bullets') {
      const bulletData = block.data as BulletContent;
      // Use numbered list for takeaways
      yPosition = addBulletPoints(slide, bulletData, yPosition, style, true);
    }
  }

  addSlideFooter(slide, style);
}

// Helper functions
function addSlideHeader(
  slide: PptxGenJS.Slide,
  title: string,
  style: SlideStyle
): void {
  // Header background
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: 10,
    h: 1,
    fill: { color: formatColor(style.primaryColor) },
  });

  // Title text
  slide.addText(title, {
    x: 0.5,
    y: 0.15,
    w: 9,
    h: 0.7,
    fontSize: style.fontSize.heading - 6,
    fontFace: style.fontFamily.heading,
    color: 'FFFFFF',
    bold: true,
    align: 'left',
    valign: 'middle',
  });
}

function addSlideFooter(
  slide: PptxGenJS.Slide,
  style: SlideStyle
): void {
  // Footer line
  slide.addShape('line', {
    x: 0.5,
    y: 5.2,
    w: 9,
    h: 0,
    line: { color: formatColor(style.accentColor), width: 1 },
  });

  // Page number placeholder
  slide.addText('', {
    x: 9,
    y: 5.3,
    w: 0.5,
    h: 0.3,
    fontSize: 10,
    fontFace: style.fontFamily.body,
    color: formatColor(style.primaryColor),
    align: 'right',
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
  const textRows: PptxGenJS.TextProps[] = bulletData.items.map((item, index) => ({
    text: item.text,
    options: {
      bullet: numbered ? { type: 'number' } : { code: '2022' },
      indentLevel: 0,
      fontSize: style.fontSize.body,
      fontFace: style.fontFamily.body,
      color: formatColor(style.primaryColor),
      paraSpaceBefore: 6,
      paraSpaceAfter: 3,
    },
  }));

  // Add sub-items
  bulletData.items.forEach((item, index) => {
    if (item.subItems && item.subItems.length > 0) {
      item.subItems.forEach(subItem => {
        textRows.splice(index + 1, 0, {
          text: subItem,
          options: {
            bullet: { code: '2013' },
            indentLevel: 1,
            fontSize: style.fontSize.body - 2,
            fontFace: style.fontFamily.body,
            color: '666666',
            paraSpaceBefore: 2,
            paraSpaceAfter: 2,
          },
        });
      });
    }
  });

  const estimatedHeight = textRows.length * 0.35;
  
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
    color: formatColor(style.primaryColor),
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
        fill: { color: formatColor(style.primaryColor) },
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
          color: formatColor(style.primaryColor),
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
    y: 1.3,
    w: 8,
    h: 3.5,
    showLegend: true,
    legendPos: 'b',
    showTitle: !!chartData.title,
    title: chartData.title,
    titleFontSize: style.fontSize.body,
    titleColor: formatColor(style.primaryColor),
  });
}
