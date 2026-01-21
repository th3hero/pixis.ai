export type SlideType = 
  | 'title'
  | 'executive-summary'
  | 'agenda'
  | 'section-header'
  | 'content'
  | 'two-column'
  | 'chart'
  | 'comparison'
  | 'timeline'
  | 'key-takeaways'
  | 'appendix';

export interface SlideContent {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  content: SlideContentBlock[];
  notes?: string;
  order: number;
}

export interface SlideContentBlock {
  type: 'text' | 'bullets' | 'numbered-list' | 'chart' | 'table' | 'image' | 'quote';
  data: BulletContent | ChartContent | TableContent | TextContent | QuoteContent;
}

export interface TextContent {
  text: string;
  style?: 'normal' | 'emphasis' | 'highlight';
}

export interface BulletContent {
  items: BulletItem[];
}

export interface BulletItem {
  text: string;
  subItems?: string[];
  icon?: string;
}

export interface ChartContent {
  chartType: 'bar' | 'line' | 'pie' | 'donut' | 'area';
  title?: string;
  data: ChartDataPoint[];
  labels?: string[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TableContent {
  headers: string[];
  rows: string[][];
}

export interface QuoteContent {
  text: string;
  author?: string;
  source?: string;
}

export interface SlideStyle {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foreground?: string; // Text color for dark themes
  fontFamily: {
    heading: string;
    body: string;
  };
  fontSize: {
    title: number;
    heading: number;
    subheading: number;
    body: number;
    caption: number;
  };
}

export interface GeneratedDeck {
  id: string;
  title: string;
  slides: SlideContent[];
  style: SlideStyle;
  createdAt: Date;
  sourceDocuments: string[];
}
