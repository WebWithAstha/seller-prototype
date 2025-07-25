import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Helper: Log result to file
export const logToFile = (fileName, data) => {
  const dataDir = path.resolve(__dirname, "../data");
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