import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint for AI daily meditation insight / reflection
  app.post("/api/meditation/daily-insight", async (req, res) => {
    try {
      const { theme = "마음의 평온" } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `사용자가 '${theme}' 주제로 명상을 하려 합니다. 마음을 차분하게 가라앉히고 명상에 깊이 집중할 수 있도록 돕는 따뜻하고 영감을 주는 명상 지혜와 짧은 안내 메시지를 한국어로 작성해주세요. JSON 형식으로 title(제목), quote(짧은 명언), guide(초기 호흡 안내 3줄) 필드를 포함해서 반환해주세요.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              quote: { type: Type.STRING },
              guide: { type: Type.STRING }
            },
            required: ["title", "quote", "guide"]
          }
        }
      });

      const jsonStr = (response.text ?? "{}").trim();
      res.json(JSON.parse(jsonStr));
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      res.status(500).json({
        title: "호흡과 함께하는 평온",
        quote: "지금 이 순간, 당신의 숨결 속에 온전한 휴식이 있습니다.",
        guide: "편안한 자세로 눈을 감고, 코로 깊게 숨을 들이쉬며 내쉬는 숨에 모든 긴장을 흘려보내세요."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.use("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`ZenTime server running on http://localhost:${port}`);
  });
}

startServer();
