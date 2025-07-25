import fs from "fs";
import path from "path";
import mime from "mime";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API;
const genai = new GoogleGenerativeAI(apiKey);

// Helper: Convert image to base64
const getImageBase64 = (filePath) => {
  let mimeType = "image/png"; // Assuming PNG, adjust if needed
  const data = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: data.toString("base64"),
      mimeType,
    },
  };
};

// Helper: Log result to file
const logToFile = (fileName, data) => {
  const dataDir = path.resolve("__dirname", "../data");
  const filePath = path.join(dataDir, fileName);

  // Create folder if not exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  let existingData = [];

  // Read existing content
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      existingData = JSON.parse(fileContent);
    } catch (err) {
      console.error("Error reading existing JSON:", err);
    }
  }

  // Add new entry
  existingData.push(data);

  // Write back to file
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
};

export const analyzeProductImage = async (imagePath) => {
  try {
    const model = genai.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `
You are a professional product analysis AI.
You must return only JSON with the following structure:

{
  "title": "...",
  "description": "...",
  "color": "...",
  "material": "...",
  "dimension": "...",
  "shape": "...",
  "details": "...",
  "recommendations": ["...", "..."]
}

Guidelines:
- Strictly analyze the given product image.
- Avoid hallucinating unknown properties.
- If a detail is not visually identifiable, return "Unknown".
- Only return the JSON. No extra explanation or markdown.
- Be consistent with key names and format.
- If image is invalid or not a product, return:
{ "error": "Invalid input. Please provide a valid product image." }
      `,
    });

    const image = getImageBase64(imagePath);
    const fileName = path.basename(imagePath);

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: "Analyze this product image and extract structured product info in JSON." },
            image,
          ],
        },
      ],
    });

    let text = result.response.text().replace(/```json|```/g, "").trim();

    try {
      const parsed = JSON.parse(text);

      // Log only valid response
      if (!parsed.error) {
        logToFile("product-details-recommendations.json", {
          image: fileName,
          timestamp: new Date().toISOString(),
          ...parsed,
        });
      }

      return parsed;
    } catch (err) {
      console.error("JSON Parsing Failed:", err, "\nRaw:", text);
      return { error: "Invalid JSON format received from Gemini API." };
    }
  } catch (err) {
    console.error("Gemini API Error:", err);

    if (err.response?.status === 429) {
      return { error: "Rate limit exceeded. Try again later." };
    }

    return { error: "Failed to process image. Please try again." };
  }
};
