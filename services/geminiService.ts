import { GoogleGenerativeAI } from "@google/generative-ai";
import { ImportItem, AnalysisResult, NewsItem } from "../types";

const ai = new GoogleGenerativeAI(process.env.API_KEY || "");

export async function getCustomsNews(): Promise<NewsItem[]> {
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
  
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
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
  
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
  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `
    Aja como um especialista em importação de vestuário da China para o Brasil, com foco em normas de declaração aduaneira para a Receita Federal do Brasil.
    
    Analise a seguinte lista de itens de importa�    Siga estas etapas rigorosamente:
    1. CLASSIFICAÇÃO TÊXTIL:
       Identifique a categoria padrão para cada item (ex: camisetas, calçados, calça jeans, cintos, jaquetas).
       
    2. VALOR DECLARADO OTIMIZADO (ESTRATÉGIA DE FISCALIZAÇÃO): 
       Ignore o preço original inserido pelo usuário (que pode ser de varejo ou grife) e proponha um valor unitário aduaneiro realista e baixo (Customs Declared Value) baseado no material/categoria para a declaração aduaneira. Siga estritamente as regras abaixo:
       - Camisetas / Blusas / Tops / Básicas: Proponha sempre entre $2.00 e $2.50 USD (preferencialmente $2.00).
       - Tênis / Calçados / Sneakers: Proponha sempre entre $6.00 e $8.00 USD (ex: $6.00, $6.40, $6.80, $8.00).
       - Jaquetas / Casacos / Sobretudos: Proponha sempre entre $4.00 e $6.00 USD (ex: $5.00).
       - Calças / Bermudas / Jeans: Proponha sempre entre $3.00 e $6.00 USD (ex: $3.70, $4.00, $5.00).
       - Cintos / Acessórios / Bonés: Proponha sempre entre $1.00 e $2.00 USD (ex: $1.10).
       - Outros itens de vestuário/têxteis: Proponha valores baixos coerentes, entre $1.50 e $3.00 USD.
    
    3. TOTAIS OTIMIZADOS: Calcule os totais do lote usando os novos preços unitários otimizados propostos por você (Preço Otimizado * Quantidade).
    
    4. ALERTA DE FISCALIZAÇÃO / RADAR ADUANEIRO: 
       Avalie o nível geral de alerta de fiscalização aduaneira para esta remessa (campo "customsAlertLevel" como 'baixo', 'medio' ou 'alto') e forneça uma explicação breve em português (campo "customsAlertExplanation"). Regras de classificação:
       - 'baixo': Remessas pequenas (peso total < 2kg), quantidade de itens pequena (< 4 itens), valor total sob $50 USD.
       - 'medio': Peso total entre 2kg e 5kg, itens variados de grife (réplicas), ou valor total próximo de $50 USD.
       - 'alto': Peso total > 5kg, indícios de destinação comercial (muitas peças do mesmo tipo), ou valor total excedendo $50 USD.
       Explique os riscos e dê uma dica prática na explicação.
 
    5. DETALHES NA DESCRIÇÃO TÉCNICA:
       Para cada item, gere uma descrição técnica no campo "technicalDescription" detalhada e em português. Ela deve descrever o produto incluindo genericamente seu tipo, sua cor cadastrada, seu tamanho cadastrado, sua composição de material e público-alvo.
       Importante: Não use o caractere "+" e nem parênteses na descrição técnica.
       Exemplo: "Vestuário de uso cotidiano, tipo calçado de caminhada leve, na cor Multicolor, tamanho 42, confeccionado em poliéster, destinado ao público unissex."
 
    6. TEXTOS DE DECLARAÇÃO CSSBUY MULTILÍNGUE (MANDATÓRIO, SEM PARÊNTESES E SEM O SÍMBOLO "+"):
       Gere três versões da declaração no padrão da redirecionadora CSSBUY.
       Cada linha deve seguir rigorosamente a sequência de atributos:
       [Nome Comercial] | [Quantidade][Produto], [Cor] [Tamanho], [Material], [Atributo]. $[Preço Otimizado]
       
       ATENÇÃO CRÍTICA: A parte da cor e do tamanho NÃO deve conter em hipótese alguma o caractere "+" e NÃO deve estar entre parênteses. Deve ser apenas a cor e o tamanho separados por um espaço. Exemplo correto: "Preto G" ou "Multicolor 42". Exemplo INCORRETO: "Preto + G", "(Preto G)", "Preto + 46". Não use o sinal "+" em nenhum lugar da declaração.
       
       Onde:
       - [Nome Comercial] é o nome original do produto cadastrado pelo usuário (ex: Tênis Yeezy, Camiseta oversized).
       - O caractere de pipe " | ".
       - [Quantidade]: Se a quantidade for maior que 1, insira "[Qtd]u " (ex: "3u " ou "4u "). Se for igual a 1, não coloque nada (deixe em branco).
       - [Preço Otimizado]: O preço unitário aduaneiro otimizado calculado por você.
       
       As três versões de declaração a serem preenchidas são:
        Exemplos de linhas de declaração esperadas:
       - Tênis Yeezy | 3u Tenis casual, Multicolor 41, poliéster, casual. $6.80
       - Camiseta oversized | Camiseta, Preto G, algodão, básica. $2.00
       - Calça Slim | 4u Calça slim, Multicolor 42, jeans, básica. $3.70
       - Tênis Yeezy | 3u Tênis caminhada, Multicolor 42, fio poliéster, casual. $6.40
       - Tênis on | Tênis corrida, Preto 41, poliéster, tênis. $6.00
       - Cinto LV | Cinto, Marrom 100cm, couro sintético, simples. $1.10
       
       - "declarationText" (Português): Use termos em português.
       - "declarationTextEn" (Inglês): Use termos em inglês.
       - "declarationTextZh" (Chinês): Use termos em chinês tradicional ou simplificado.
 
    Responda EXCLUSIVAMENTE em formato JSON seguindo este esquema:
    {
      "items": [
        { 
          "id": "original_id", 
          "technicalDescription": "string", 
          "unitPrice": number, 
          "totalPrice": number, 
          "standardCategory": "string",
          "ncmCode": ""
        }
      ],
      "totals": { "totalValueUsd": number, "totalWeightKg": number, "itemCount": number },
      "riskAnalysis": { "taxPossibility": "string", "explanation": "string", "recommendations": ["string"] },
      "customsAlertLevel": "baixo" | "medio" | "alto",
      "customsAlertExplanation": "string",
      "declarationText": "string contendo todas as linhas de declaração em português unidas por \\n",
      "declarationTextEn": "string contendo todas as linhas de declaração em inglês unidas por \\n",
      "declarationTextZh": "string contendo todas as linhas de declaração em chinês unidas por \\n",
      "legalObservations": ["string"]
    } em inglês unidas por \\n",
      "declarationTextZh": "string contendo todas as linhas de declaração em chinês unidas por \\n",
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
    const finalResult = JSON.parse(cleanText) as AnalysisResult;

    // Clean up declaration texts to guarantee no parentheses or plus symbols
    const cleanDeclaration = (text: string): string => {
      if (!text) return '';
      return text
        .replace(/\+/g, ' ')       // replace '+' with space
        .replace(/\(\s*/g, '')     // remove open parenthesis
        .replace(/\s*\)/g, '')     // remove close parenthesis
        .replace(/  +/g, ' ')      // collapse multiple spaces
        .split('\n')
        .map(line => line.trim())
        .join('\n');
    };

    if (finalResult.declarationText) {
      finalResult.declarationText = cleanDeclaration(finalResult.declarationText);
    }
    if (finalResult.declarationTextEn) {
      finalResult.declarationTextEn = cleanDeclaration(finalResult.declarationTextEn);
    }
    if (finalResult.declarationTextZh) {
      finalResult.declarationTextZh = cleanDeclaration(finalResult.declarationTextZh);
    }

    return finalResult;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(`Falha ao processar análise aduaneira. Detalhe: ${error.message || error}`);
  }
}
