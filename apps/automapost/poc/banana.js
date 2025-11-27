import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";

// https://aistudio.google.com/usage?project=cod-if-i
const GoogleGeminiApiKey = "AIzaSyAS8hsnDXgkzWTGMIzbdjA11PFBdTbtBTs"

async function main() {

  const ai = new GoogleGenAI({ apiKey: GoogleGeminiApiKey });

  const prompt =
    "A split-screen image: one side with a static LinkedIn post, the other with a dynamic video thumbnail featuring a young professional speaking, overlaid with engagement metrics and play icons.";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("gemini-native-image.png", buffer);
      console.log("Image saved as gemini-native-image.png");
    }
  }
}

main();