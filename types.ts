
export interface ImportItem {
  id: string;
  name: string;
  brand: string;
  pieceType: string;
  audience: 'masculino' | 'feminino' | 'unissex';
  material: string;
  quantity: number;
  unitWeight: number; // in kg
  estimatedPrice: number; // in USD
}

export interface ProductSuggestion {
  original: string;
  suggestions: string[];
}

export interface AnalysisResult {
  items: {
    id: string;
    technicalDescription: string;
    unitPrice: number;
    totalPrice: number;
    standardCategory: string;
  }[];
  totals: {
    totalValueUsd: number;
    totalWeightKg: number;
    itemCount: number;
  };
  riskAnalysis: {
    taxPossibility: string;
    explanation: string;
    recommendations: string[];
  };
  declarationText: string;
  legalObservations: string[];
}

export interface NewsItem {
  title: string;
  summary: string;
  url: string;
  date: string;
}

export interface HistoryItem {
  id: string;
  user_id: string;
  items: ImportItem[];
  result: AnalysisResult;
  created_at: string;
}
