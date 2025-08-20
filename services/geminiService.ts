import { GoogleGenAI } from "@google/genai";
import { marked } from 'marked';
import { Task } from '../types';

// IMPORTANT: Assumes process.env.API_KEY is set in the environment
const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey });

export const getAIAssistance = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
        topP: 0.95,
        topK: 64,
      }
    });

    const rawText = response.text;
    const htmlText = marked.parse(rawText);
    return typeof htmlText === 'string' ? htmlText : '';

  } catch (error) {
    console.error("Error calling Gemini API for tips:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get AI assistance. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching AI assistance.");
  }
};

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});


const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string; } } | { text: string }> => {
    const fileType = file.type;
    
    if (fileType.startsWith('image/')) {
        const data = await toBase64(file);
        return {
            inlineData: { data, mimeType: fileType },
        };
    } else if (fileType.startsWith('text/') || fileType === 'application/json' || fileType === 'application/xml' || fileType === 'application/pdf' || fileType.endsWith('.log') || fileType.endsWith('.md')) {
        // For text-based and other complex formats, we send text content or metadata.
        // True PDF parsing is complex client-side; Gemini can analyze metadata.
        try {
            const text = await file.text();
            // Truncate large files to avoid exceeding token limits
            const truncatedText = text.length > 10000 ? text.substring(0, 10000) + "\n...[TRUNCATED]" : text;
            return { text: `File Name: ${file.name}\n\n${truncatedText}` };
        } catch (e) {
            // If we can't read as text, fall back to metadata.
            return { text: `File metadata: Name: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes. Could not read file content.` };
        }
    } else {
        // For binary/unsupported files, send metadata.
        return { text: `File metadata: Name: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes.` };
    }
};


export const summarizeFileContent = async (task: Task, file: File): Promise<string> => {
  const filePart = await fileToGenerativePart(file);

  const systemInstruction = `
You are an AI assistant helping an IT engineer collect data for a RAG system in radiology.
Your task is to provide a brief, one-sentence summary of what useful information could be extracted from the provided file for this specific data collection task.

**Data Collection Task Context:**
- **Task Title:** "${task.title}"
- **Task Description:** "${task.description}"

**File Information:**
Below is either the content of the file or its metadata.

Analyze this information and generate a summary.
Focus on the *potential value* of the file's content for training a large language model on radiology IT support topics.
For example, instead of "This is a log file", say "This log file could provide patterns of system errors and user actions preceding a fault."
Instead of "An image of a PACS viewer", say "This screenshot likely demonstrates a common user workflow or a specific UI-related issue."
Keep your summary to a single, concise sentence.
`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [filePart] },
        config: {
            systemInstruction,
            temperature: 0.2,
            topK: 32,
        },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for summary:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to summarize. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while summarizing file.");
  }
};