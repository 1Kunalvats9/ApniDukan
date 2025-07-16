import { NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { GoogleGenerativeAI } from '@google/generative-ai'; // <-- NEW: Import Google AI
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

// --- Authentication ---
const JWT_SECRET = process.env.JWT_SECRET || 'kst_apnidukaan';
const getUserFromToken = (request) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    try {
        const token = authHeader.split(' ')[1];
        return jwt.verify(token, JWT_SECRET);
    } catch (error) { return null; }
};

// --- Google Vision Client (for OCR) ---
let visionClient;
// (Vision client initialization logic remains the same)
try {
    const credentialsJson = process.env.GCP_CREDENTIALS_JSON;
    if (credentialsJson) {
        const credentials = JSON.parse(credentialsJson);
        visionClient = new ImageAnnotatorClient({ credentials, projectId: credentials.project_id });
    } else {
        const credentialsPath = path.join(process.cwd(), 'gcp-credentials.json');
        if (fs.existsSync(credentialsPath)) {
            const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
            visionClient = new ImageAnnotatorClient({ credentials, projectId: credentials.project_id });
        } else {
            throw new Error("GCP credentials not found for Vision API.");
        }
    }
} catch (error) {
    console.error("Failed to initialize Google Cloud Vision client:", error);
    visionClient = null;
}

// --- NEW: Google Gemini Client (for data extraction) ---
let genAI;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
    console.error("GEMINI_API_KEY not found in environment variables.");
    genAI = null;
}

// --- Main API Function ---
export async function POST(request) {
    if (!visionClient || !genAI) {
        return NextResponse.json({ message: 'Server configuration error: AI services not initialized.' }, { status: 500 });
    }
    if (!getUserFromToken(request)) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { imageUrl } = await request.json();
        if (!imageUrl) {
            return NextResponse.json({ message: 'Image URL is required' }, { status: 400 });
        }

        const [ocrResult] = await visionClient.textDetection(imageUrl);
        const rawText = ocrResult.fullTextAnnotation?.text;

        if (!rawText || rawText.trim().length === 0) {
            return NextResponse.json({ message: 'No text could be extracted from the image.' }, { status: 400 });
        }

        // --- REVISED: Prompt and Model for Gemini ---
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
            generationConfig: { responseMimeType: "application/json" } // Use built-in JSON mode
        });

        const prompt = `You are an automated data entry assistant. Your only function is to analyze raw text from a bill and return a single, valid JSON object. Do not provide any conversational text, introductions, or explanations. The JSON object must contain a single key, "items", which is an array of products. If no items are found, return an empty array.

        For each item in the array, extract:
        - "name": (string) The full product name, corrected for OCR errors.
        - "hsnSacCode": (string) The HSN or SAC code. If not found, return an empty string "".
        - "quantity": (number) The numerical quantity.
        - "costPrice": (number) The price per single unit (rate/price).
        - "gstRate": (number) The GST percentage. If not found, return 0.
        
        Here is the raw OCR text:
        ---
        ${rawText}
        ---`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const jsonText = response.text();

        const extractedJson = JSON.parse(jsonText);

        // Return the clean, structured data from Gemini
        return NextResponse.json(extractedJson, { status: 200 });

    } catch (error) {
        console.error('Error in /api/process-bill:', error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'AI model returned invalid JSON format.' }, { status: 500 });
        }
        return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
    }
}