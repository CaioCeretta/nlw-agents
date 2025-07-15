import { GoogleGenAI } from '@google/genai';
import { env } from '../env.ts';

const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

const model = 'gemini-2.5-flash';

export async function transcribeAudio(audioAsBase64: string, mimeType: string) {
  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: `Translate the audio to brazilian portuguese. Be precise and natural on the transcription. Keep the adequate
        punctuation and divide the text in paragraphs when appropriate`,
      },
      {
        inlineData: {
          mimeType,
          data: audioAsBase64,
        },
      },
    ],
  });

  if (!response) {
    throw new Error('There was an error on the transcription process');
  }

  return response.text;
}

export async function generateEmbeddings(text: string) {
  const response = await gemini.models.embedContent({
    model: 'text-embedding-004',
    contents: [{ text }],
    config: {
      taskType: 'RETRIEVAL_DOCUMENT',
    },
  });

  if (!response.embeddings?.[0].values) {
    throw new Error('It was not possible to generate the embeddings');
  }

  return response.embeddings[0].values;
}

export async function generateAnswer(
  question: string,
  transcriptions: string[]
) {
  const context = transcriptions.join('\n\n');

  const prompt = `
    Based on the text provided below as a text. Answer the question clearly and precisely. In brazilian portuguese.

    CONTEXT:
    ${context}

    QUESTION: 
    ${question}

    INSTRUCTIONS:
    - Use only the information based on the provided context. 
    - If the answer was not found in the context, simply answer that you do not have enough information to answer it. 
    - Be objective
    - Be polite and professional
    - Cite relevant excerpts concerning the context if appropriate
    - If you are to cite the context, utilize the term "Class Content"

  `.trim();

  const response = await gemini.models.generateContent({
    model,
    contents: [
      {
        text: prompt,
      },
    ],
  });

  if (!response.text) {
    throw new Error('Failed to generate answer through Gemini');
  }

  return response.text;
}
