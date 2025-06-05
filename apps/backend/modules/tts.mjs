import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Resolve current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate TTS audio using Coqui
async function convertTextToSpeech({ text, fileName }) {
  const outputPath = path.join(__dirname, "public", "output", "audios", fileName);

  // Ensure the output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  return new Promise((resolve, reject) => {
    const command = `tts --text "${text.replace(/"/g, '\\"')}" --out_path "${outputPath}" --model_name "tts_models/en/ljspeech/tacotron2-DDC"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("TTS Error:", stderr);
        reject(error);
      } else {
        console.log("TTS Output:", stdout);
        resolve(outputPath);
      }
    });
  });
}

// Simulated getVoices for UI dropdown or API call
async function getVoices() {
  return [
    {
      name: "LJSpeech (female, English)",
      id: "tts_models/en/ljspeech/tacotron2-DDC",
    },
    {
      name: "VCTK (multi-speaker)",
      id: "tts_models/en/vctk/vits",
    },
    {
      name: "Multilingual (YourTTS)",
      id: "tts_models/multilingual/multi-dataset/your_tts",
    },
  ];
}

export { convertTextToSpeech, getVoices };
