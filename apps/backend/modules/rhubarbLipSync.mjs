import { execCommand } from "../utils/files.mjs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ES Module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath = 'C:/Users/Navya/Downloads/avatar_teacher/apps/backend/modules/public/output/modules/public/output';

const getPhonemes = async ({ message }) => {
  try {
    const time = Date.now();

    const mp3Path = path.join(basePath, `message_${message}.mp3`);
    const wavPath = path.join(basePath, `message_${message}.wav`);
    const jsonPath = path.join(basePath, `message_${message}.json`);

    console.log(`Starting conversion for message_${message}`);

    // Step 1: Convert mp3 to wav
    await execCommand({
      command: `ffmpeg -y -i "${mp3Path}" "${wavPath}"`
    });
    console.log(`MP3 to WAV conversion done in ${Date.now() - time}ms`);

    // Step 2: Run rhubarb
    await execCommand({
      command: `./bin/rhubarb -f json -o "${jsonPath}" "${wavPath}" -r phonetic`
    });
    console.log(`Lip sync JSON generated in ${Date.now() - time}ms`);
  } catch (error) {
    console.error(`Error while getting phonemes for message ${message}:`, error);
  }
};

export { getPhonemes };
