import { GoogleGenerativeAI } from "@google/generative-ai";
import { ImportItem, AnalysisResult, NewsItem } from "../types";

const ai = new GoogleGenerativeAI(process.env.API_KEY || "");

export async function getCustomsNews(): Promise<NewsItem[]> {
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    Pesquise as notícias mais recentes (últimos 30 dias) da Receita Federal do Brasil e do Ministério da Fazenda sobre importação de vestuário, têxteis, Remessa Conforme e novas alíquotas de imposto de importação.
    
    Retorne as 4 notícias mais relevantes.
    Para cada notícia, forneça:
    1. Título conciso.
    2. Resumo de uma frase explicando o impacto para o importador.
    3. URL da fonte oficial (gov.br ou portais de notícias confiáveis).
    4. Data da notícia.
    
    Responda APENAS um array JSON seguindo este esquema:
    [{ "title": "string", "summary": "string", "url": "string", "date": "string" }]
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const response = await result.response;
    const rawText = response.text() || "[]";
    const cleanText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini News Error:", error);
    return [];
  }
}

export async function getProductSuggestions(productName: string): Promise<string[]> {
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    O usuário quer importar um produto, mas não sabe como descrevê-lo de forma técnica ou estratégica para a Receita Federal do Brasil.
    Produto informado: "${productName}"
    
    Gere 5 sugestões de nomes técnicos, componentes ou descrições que "se parecem" com este produto ou que são partes fundamentais dele, visando uma declaração aduaneira mais precisa ou segmentada.
    Exemplo para "celular": ["Tela de cristal líquido para reposição", "Carcaça plástica para dispositivo móvel", "Placa de circuito impresso montada", "Módulo de bateria de íon-lítio", "Cabo de dados e carregamento USB"].
    
    Responda APENAS um array JSON com as 5 strings.
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const response = await result.response;
    const rawText = response.text() || "[]";
    const cleanText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return [];
  }
}

export async function analyzeImportData(items: ImportItem[]): Promise<AnalysisResult> {
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    Aja como um especialista em importação de vestuário da China para o Brasil, com foco em normas da Receita Federal do Brasil.
    
    Analise a seguinte lista de itens de importação:
    ${JSON.stringify(items, null, 2)}

    Siga estas etapas rigorosamente:
    1. CLASSIFICAÇÃO TÊXTIL: Identifique a categoria padrão para cada item.
    2. DESCRIÇÃO ADUANEIRA: Gere descrições curtas e técnicas no padrão: "Vestuário de uso cotidiano, confeccionado em [material], destinado ao público [público]." (Remova marcas, termos publicitários como 'premium', 'streetwear', etc).
    3. VALOR COMPATÍVEL: Verifique se o valor informado (${items.map(i => i.estimatedPrice).join(', ')}) é compatível com o mercado internacional de atacado. Se for muito baixo (subfaturamento), sugira um valor realista. Nunca subfature.
    4. CONSOLIDAÇÃO: Calcule os totais.
    5. ANÁLISE DE RISCO: Explique a tributação (Imposto de Importação, ICMS conforme programa Remessa Conforme se aplicável).

    Responda EXCLUSIVAMENTE em formato JSON seguindo este esquema:
    {
      "items": [
        { "id": "original_id", "technicalDescription": "string", "unitPrice": number, "totalPrice": number, "standardCategory": "string" }
      ],
      "totals": { "totalValueUsd": number, "totalWeightKg": number, "itemCount": number },
      "riskAnalysis": { "taxPossibility": "string", "explanation": "string", "recommendations": ["string"] },
      "declarationText": "string formatada para nota de declaração",
      "legalObservations": ["string"]
    }
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const response = await result.response;
    const rawText = response.text() || "{}";
    const cleanText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const finalResult = JSON.parse(cleanText);
    return finalResult as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(`Falha ao processar análise aduaneira. Detalhe: ${error.message || error}`);
  }
}
