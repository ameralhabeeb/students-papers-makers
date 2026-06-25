import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/analyze-notes", async (req, res) => {
    try {
      const { notes } = req.body;
      if (!notes) {
        return res.status(400).json({ error: "Notes are required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `الرجاء تحليل الملاحظات التالية وتقديم اقتراحات حول هيكلية المقالة أو تحسين صياغة الأفكار المدونة. قدم الإجابة باللغة العربية.\n\nالملاحظات:\n${notes}`,
      });

      res.json({ result: response.text });
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "Failed to analyze notes" });
    }
  });

  app.post("/api/check-originality", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key is not configured on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `قم بتحليل النص التالي كمحترف أكاديمي.
توقع نسبة كتابته باستخدام أدوات الذكاء الاصطناعي (AI) وتوقع نسبة الاستلال (السرقة الأدبية / Plagiarism) بناءً على أسلوب الكتابة وتكرار الأنماط والمحتوى المشابه للمصادر المعروفة (وهذا فحص تقديري مجاني).
قدم تقريراً منظماً باللغة العربية يحتوي على:
1. نسبة الذكاء الاصطناعي المقدرة (كنسبة مئوية).
2. نسبة الاستلال المقدرة (كنسبة مئوية).
3. تقرير مفصل حول الأجزاء التي تبدو مستلة أو مولدة بالذكاء الاصطناعي مع تقديم مبررات.
4. نصائح لتحسين أصالة النص.

النص:
${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ result: response.text });
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "Failed to check originality" });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
