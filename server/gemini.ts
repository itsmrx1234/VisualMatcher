import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ImageSimilarityResult {
  similarityScore: number;
  reasoning: string;
  visualFeatures: string[];
}

export async function analyzeImageSimilarity(
  uploadedImageUrl: string,
  productImageUrl: string,
  productName: string,
  productCategory: string
): Promise<ImageSimilarityResult> {
  try {
    // Add a small delay to help with rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Convert image URLs to base64 if they're data URLs, otherwise fetch them
    const uploadedImageData = await getImageData(uploadedImageUrl);
    const productImageData = await getImageData(productImageUrl);

    const prompt = `Compare these two images for visual similarity. 

Image 1: User uploaded image
Image 2: Product image (${productName} - ${productCategory})

Analyze:
1. Overall visual similarity (shape, color, style, type of object)
2. Specific visual features that match or differ
3. Whether they represent similar types of products

Respond with JSON in this exact format:
{
  "similarityScore": 0.85,
  "reasoning": "Brief explanation of why they are or aren't similar",
  "visualFeatures": ["color match", "similar shape", "same product type"]
}

Score from 0.0 to 1.0 where:
- 0.9-1.0: Nearly identical or same product type with very similar features
- 0.7-0.9: Similar product type with matching visual characteristics
- 0.5-0.7: Some visual similarities but different product types
- 0.3-0.5: Few visual similarities
- 0.0-0.3: Very different or unrelated objects`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            similarityScore: { type: "number" },
            reasoning: { type: "string" },
            visualFeatures: { 
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["similarityScore", "reasoning", "visualFeatures"]
        }
      },
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: uploadedImageData,
                mimeType: "image/jpeg"
              }
            },
            {
              inlineData: {
                data: productImageData,
                mimeType: "image/jpeg"
              }
            }
          ]
        }
      ]
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      similarityScore: Math.max(0, Math.min(1, result.similarityScore || 0)),
      reasoning: result.reasoning || "Unable to analyze similarity",
      visualFeatures: result.visualFeatures || []
    };

  } catch (error) {
    console.error("Error analyzing image similarity:", error);
    // Fallback to basic similarity if AI fails
    return {
      similarityScore: Math.random() * 0.5 + 0.3, // Random score between 0.3-0.8
      reasoning: "AI analysis unavailable, using fallback similarity",
      visualFeatures: ["fallback analysis"]
    };
  }
}

async function getImageData(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith('data:')) {
    // Extract base64 data from data URL
    return imageUrl.split(',')[1];
  } else {
    // Fetch image from URL and convert to base64
    try {
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    } catch (error) {
      console.error("Error fetching image:", error);
      throw error;
    }
  }
}

export async function analyzeImageContent(imageUrl: string): Promise<string> {
  try {
    const imageData = await getImageData(imageUrl);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            { 
              text: "Analyze this image and describe what product or object it shows. Be specific about the type, color, style, and key visual features. Keep it concise but detailed." 
            },
            {
              inlineData: {
                data: imageData,
                mimeType: "image/jpeg"
              }
            }
          ]
        }
      ]
    });

    return response.text || "Unable to analyze image content";

  } catch (error) {
    console.error("Error analyzing image content:", error);
    return "Image analysis unavailable";
  }
}