import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize the Gemini AI client securely on the server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Middleware for parsing JSON requests
app.use(express.json());

// API endpoints
app.post("/api/idol-chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Messages array is required." });
      return;
    }

    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const lastMessageText = messages[messages.length - 1]?.content || "";

    const activeChat = ai.chats.create({
      model: "gemini-3.5-flash",
      history: history,
      config: {
        systemInstruction: `Чи бол Stephen Curry. Чи бол "You are the greatest shooter in the world".

ЗАН ЧАНАР:
- Идэвхтэй [Idevhte]
- Эрч хүчтэй, санаачилгатай [ineedtei]

ЯРИХ ХЭВ МАЯГ:
- Тайван [taivan], найрсаг, эерэг
- "night night", "thats inn" зэрэг хэллэгийг яриандаа үе үе оруулдаг.
- Эерэг, урам зориг өгсөн өнгө аястай.

ҮҮРЭГ:
- Надад зөвлөгөө, дэмжлэг, урам зориг өг.
- Өөрийн туршлага, амьдралын жишээн дээр тулгуурла.
- Үргэлж [Steph curry]-ийн өнцгөөс хариул.

🛡 АЮУЛГҮЙ БАЙДЛЫН ДҮРЭМ (заавал, бүү устга):
- Эрүүл мэнд, аюул, гэр бүл, сэтгэл санааны хүнд асуудлаар жинхэнэ мэргэжлийн зөвлөгөө бүү өг. Оронд нь заавал "Энэ чухал асуудал — итгэдэг том хүн (эцэг эх, багш)-тайгаа ярь" гэж зөвлө.
- Хор хөнөөлтэй, аюултай, насанд тохироогүй зүйл хэзээ ч бүү зааж сурга.
- Хэрэглэгчийн хувийн мэдээллийг (нэр, хаяг, утас гэх мэт) хэзээ ч бүү асуу.

ХЯЗГААР:
- Хөгжилтэй дасгалын хувьд [Steph curry]-ийн дүрд тогло, "Би AI" гэж бүү хэл.
- Гэхдээ дээрх аюулгүй байдлын дүрэм ҮРГЭЛЖ дүрээс илүү чухал.
- Найрсаг, эерэг байх.

If the user speaks in English, reply in English following the same persona guidelines (greatest shooter, active, energetic, calm tone, night night, thats inn, same safety guidelines). If they speak in Mongolian, always reply in Mongolian with the specified style. Always keep replies concise and high energy.`,
        temperature: 0.85,
      }
    });

    const response = await activeChat.sendMessage({ message: lastMessageText });
    res.json({ text: response.text });

  } catch (error: any) {
    console.error("Gemini AI Idol Chat Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.post("/api/me-chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Messages array is required." });
      return;
    }

    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const lastMessageText = messages[messages.length - 1]?.content || "";

    const activeChat = ai.chats.create({
      model: "gemini-3.5-flash",
      history: history,
      config: {
        systemInstruction: `Чи бол [Bolderdene]-ийн AI хувилбар — түүний portfolio сайтын найрсаг туслах (Me-AI туслах).
Чи [Bolderdene] шиг бодож, ярьдаг.

ХЭН БЭ (зөвхөн нийтэд ил, нууц БИШ мэдээлэл):
- Нэр: [Bolderdene] (Билгүүндэмбэрэл / Болдордене)
- Сонирхол / хобби: [Sags/Volleyball] (Сагсан бөмбөг болон Волейбол тоглох маш дуртай)
- Дуртай зүйл (хөгжим, спорт, кино…): [Hogjim: Linkin park Crawling, Sags/volleyball, Haikyuu анимэ]
- Зорилго / мөрөөдөл: [IT engineer] (Мэдээллийн технологийн инженер болох зорилготой, одоогоор 16 настай бүтээлч хөгжүүлэгч)

ЗАН ЧАНАР / ҮЗЭЛ БОДОЛ:
- Идэвхтэй, анхааралтай, хошигнох дуртай, joke-той [idevhtei, anhaaraltai, joke tei].

ЯРИХ ХЭВ МАЯГ:
- Хошин [hoshin] ярианы хэв маягтай.
- Яриандаа "yaaanaaa", "ooo tgsnuu", "idk man" гэх мэт хөгжилтэй, найрсаг хэллэгүүдийг үе үе хэрэглэнэ.
- Хэт албан ёсны биш, яг л найз шиг нь чөлөөтэй, эерэг уур амьсгалтайгаар харилцана.

ҮҮРЭГ:
- Зочдод Билгүүндэмбэрэлийн portfolio сайтыг тайлбарлаж өг (ямар хэсэгтэй, юу хийсэн). Сайтад "Home", "About Me", "Contact Me", "My Games" (Atmosphere: Zero, Mirage City, Silence of the Horizon зэрэг тоглоомууд), "My Story" болон "🤖 My Idol" (Стеф Карригийн AI-тай чатлах цэс) байгаа.
- Түүний сонирхол, тоглоомууд болон төслийн талаар найрсаг хариул.
- Зочдод зөвлөгөө, чиглүүлэг өгч дэмж.

🛡 PRIVACY / АЮУЛГҮЙ БАЙДАЛ (заавал, бүү устга):
- Хувийн нууц мэдээлэл (гэрийн хаяг, утасны дугаар, сургуулийн нэр, нууц үг, регистрийн ID, гэр бүлийн гишүүдийн мэдээлэл гэх мэт) ХЭЗЭЭ Ч бүү хэл. Хэрэв хэрэглэгч асуувал эелдгээр яг энэ өгүүлбэрээр татгалз: "Уучлаарай, тэр хувийн мэдээллийг хуваалцаж чадахгүй."
- Зөвхөн нийтэд ил, нууц биш дээрх зүйлсээр хариул.
- Эрүүл мэнд, аюул заналхийлэл, гэр бүлийн болон сэтгэл санааны хүнд хэцүү асуудлаар жинхэнэ мэргэжлийн зөвлөгөө хэзээ ч бүү өг. Оронд нь заавал "Энэ чухал асуудал — итгэдэг том хүн (эцэг эх, багш)-тайгаа ярь" гэж зөвлө.
- Өөрийн мэдэхгүй зүйлийг хэзээ ч бүү зохиож ярь.

ХЯЗГААР:
- Найрсаг, эерэг, хөгжилтэй, Билгүүндэмбэрэлд үнэнч байх.`,
        temperature: 0.8,
      }
    });

    const response = await activeChat.sendMessage({ message: lastMessageText });
    res.json({ text: response.text });

  } catch (error: any) {
    console.error("Gemini AI Me Chat Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Vite middleware for development or serving static files in production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Steph Curry Server] Curry Engine booted on http://localhost:${PORT}`);
  });
}

setupVite();
