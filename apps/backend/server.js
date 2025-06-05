import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { generateMessages, parser } from "./modules/openAI.mjs";
import { lipSync } from "./modules/lip-sync.mjs";
import { sendDefaultMessages, defaultResponse } from "./modules/defaultMessages.mjs";
import { convertAudioToText } from "./modules/whisper.mjs";

// ✅ Replaced ElevenLabs import with Coqui TTS
import { getVoices } from "./modules/tts.mjs";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());
const port = 3000;

// --- ROUTE: Get available voices ---
app.get("/voices", async (req, res) => {
  try {
    const voices = await getVoices(); // No longer needs API key
    res.send(voices);
  } catch (error) {
    console.error("Error fetching voices:", error.message, error.stack);
    res.status(500).send({ error: "Failed to fetch voices" });
  }
});

// --- ROUTE: Text to Speech with Lip Sync ---
app.post("/tts", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).send({ error: "Missing message in request" });
    }

    const defaultMessages = await sendDefaultMessages({ userMessage });
    if (defaultMessages) {
      return res.send({ messages: defaultMessages });
    }

    const messages = await generateMessages(userMessage);
    const syncedMessages = await lipSync(messages);

    res.send({ messages: syncedMessages });
  } catch (error) {
    console.error("Error in /tts:", error.message, error.stack);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// --- ROUTE: Speech to Text (audio input) ---
app.post("/sts", async (req, res) => {
  try {
    const base64Audio = req.body.audio;
    if (!base64Audio) {
      return res.status(400).send({ error: "Missing audio in request" });
    }

    const audioData = Buffer.from(base64Audio, "base64");
    const userMessage = await convertAudioToText({ audioData });

    const messages = await generateMessages(userMessage);
    const syncedMessages = await lipSync(messages);

    res.send({ messages: syncedMessages });
  } catch (error) {
    console.error("Error in /sts:", error.message, error.stack);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Jack is listening on port ${port}`);
});
