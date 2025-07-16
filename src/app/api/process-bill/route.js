import { NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
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
    } catch (error) {
        return null;
    }
};

// --- Google Vision Client Initialization ---
let visionClient;
try {
    const credentialsJson = process.env.GCP_CREDENTIALS_JSON;
    if (credentialsJson) {
        const credentials = JSON.parse(credentialsJson);
        visionClient = new ImageAnnotatorClient({ credentials, projectId: credentials.project_id });
        console.log("Google Cloud Vision client initialized from environment variable.");
    } else {
        const credentialsPath = path.join(process.cwd(), 'gcp-credentials.json');
        if (fs.existsSync(credentialsPath)) {
            const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
            visionClient = new ImageAnnotatorClient({ credentials, projectId: credentials.project_id });
            console.log("Google Cloud Vision client initialized from local gcp-credentials.json file.");
        } else {
            throw new Error("GCP credentials not found.");
        }
    }
} catch (error) {
    console.error("Failed to initialize Google Cloud Vision client:", error);
    visionClient = null;
}

// --- Main API Function ---
export async function POST(request) {
    if (!visionClient) {
        return NextResponse.json({ message: 'Server configuration error: Vision API not initialized.' }, { status: 500 });
    }
    const user = getUserFromToken(request);
    if (!user) {
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

        // Using a system prompt for stronger instructions
        const systemPrompt = `You are an automated data entry assistant. Your only function is to analyze raw text from a bill and return a single, valid JSON object. Do not provide any conversational text, introductions, or explanations. The JSON object must contain a single key, "items", which is an array of products. If no items are found, return an empty array.

        For each item, extract:
        - "name": Full product name, corrected for OCR errors.
        - "hsnSacCode": HSN/SAC code as a string, or an empty string "" if not found.
        - "quantity": The numerical quantity.
        - "costPrice": The price per single unit, as a number.
        - "gstRate": The GST percentage, as a number, or 0 if not found.`;

        const userPrompt = `Please process the following raw OCR text:\n---\n${rawText}\n---`;

        const llmResponse = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.TOGETHER_AI_API_KEY}`,
            },
            body: JSON.stringify({
                // Using a top-tier, reliable model for instruction following.
                model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                // We still use response_format as a strong hint to the model
                response_format: { type: 'json_object' },
                temperature: 0.0, // Set to 0 for maximum predictability
            }),
        });

        if (!llmResponse.ok) {
            const errorBody = await llmResponse.text();
            console.error('LLM API Error:', errorBody);
            throw new Error('The AI model service returned an error.');
        }

        const llmData = await llmResponse.json();
        let responseContent = llmData.choices[0].message.content;

        // ** ROBUST JSON EXTRACTION LOGIC **
        // This finds the JSON block even if the AI adds extra text.
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            console.error("Raw LLM response did not contain a JSON object:", responseContent);
            throw new Error('AI model did not return a valid JSON object.');
        }

        const extractedJsonString = jsonMatch[0];
        const extractedJson = JSON.parse(extractedJsonString);

        // Return the clean, structured data
        return NextResponse.json(extractedJson, { status: 200 });

    } catch (error) {
        console.error('Error in /api/process-bill:', error.message);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'AI model returned invalid JSON format after cleaning.' }, { status: 500 });
        }
        return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
    }
}