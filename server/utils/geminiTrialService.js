const { GoogleGenAI, Modality } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const apiKey = process.env.GEMINI_API;
const ai = new GoogleGenAI({
  apiKey 
});


const aiDir = path.join(__dirname, '..',  'uploads', 'ai');
if (!fs.existsSync(aiDir)) fs.mkdirSync(aiDir, { recursive: true });

const processImage = async (imagePath, prompt, index) => {
  console.log("image path at process ",imagePath)
  try {
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString("base64");

    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/png",
          data: base64Image,
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData) {
        const enhancedName = path.basename(imagePath).replace(/(\.[\w]+)$/, '-ai$1');
        const fullPath = path.join(aiDir, enhancedName);
        const buffer = Buffer.from(part.inlineData.data, "base64");
        fs.writeFileSync(fullPath, buffer);
        console.log(`Saved enhanced image: ${fullPath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${imagePath}:`, error.message);
  }
};

// studio photo of a modern arm chair, natural lighting

const geminiBatchProcess = async (imagePaths, 
  prompt = `You are a professional product photographer. Take the provided product image and place it in a realistic and contextually appropriate environment that suits the product's purpose. Do not alter the product's shape, color, size, material, or any visual details. Only enhance the lighting, shadows, and contrast subtly to blend the product naturally into the new background.

For example:

A kitchen utensil should be placed in a modern kitchen counter or dining table scene.

A cosmetic product should be set on a bathroom shelf, makeup desk, or styled vanity setup.

A tech gadget should appear on a desk setup, office space, or living room environment.

The final output should look like a high-quality, real-life photoshoot where the product is naturally integrated into its environment, keeping all visual integrity of the original product image intact.`

) => {
  await Promise.all(
    imagePaths.map((imgPath, index) => processImage(imgPath, prompt, index))
  );
};

module.exports = { geminiBatchProcess };
