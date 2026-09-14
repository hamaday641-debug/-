import express from "express";
import path from "path";
import http from "http";
import https from "https";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Google Gen AI
  const getAIClient = () => {
    const key = process.env.GEMINI_API_KEY || "";
    if (!key) return null;
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  };

  // --- API Routes ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Helper to stream external audio / radio following all redirects over HTTPS
  const streamAudioWithRedirects = (targetUrl: string, clientRes: express.Response, clientReq: express.Request, maxRedirects = 5) => {
    if (maxRedirects <= 0) {
      if (!clientRes.headersSent) clientRes.status(502).send("Too many redirects");
      return;
    }

    try {
      const parsed = new URL(targetUrl);
      const isHttps = parsed.protocol === "https:";
      const lib = isHttps ? https : http;

      const proxyReq = lib.get(
        targetUrl,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "Icy-MetaData": "0"
          },
          timeout: 10000
        },
        (remoteRes) => {
          // Handle 301 / 302 / 307 / 308 redirects
          if (
            remoteRes.statusCode &&
            remoteRes.statusCode >= 300 &&
            remoteRes.statusCode < 400 &&
            remoteRes.headers.location
          ) {
            const nextUrl = new URL(remoteRes.headers.location, targetUrl).toString();
            remoteRes.destroy();
            return streamAudioWithRedirects(nextUrl, clientRes, clientReq, maxRedirects - 1);
          }

          if (!remoteRes.statusCode || remoteRes.statusCode >= 400) {
            if (!clientRes.headersSent) {
              clientRes.status(remoteRes.statusCode || 502).send("Upstream radio stream error");
            }
            remoteRes.destroy();
            return;
          }

          // Forward headers to client with CORS and audio content-type
          const contentType = remoteRes.headers["content-type"] || "audio/mpeg";
          clientRes.setHeader("Content-Type", contentType);
          clientRes.setHeader("Access-Control-Allow-Origin", "*");
          clientRes.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          clientRes.setHeader("Connection", "keep-alive");

          remoteRes.pipe(clientRes);

          clientReq.on("close", () => {
            remoteRes.destroy();
            proxyReq.destroy();
          });
        }
      );

      proxyReq.on("error", (err) => {
        console.warn("Radio proxy stream error:", err.message);
        if (!clientRes.headersSent) {
          clientRes.status(502).json({ error: "Failed to connect to radio stream", details: err.message });
        }
      });

      proxyReq.on("timeout", () => {
        proxyReq.destroy();
        if (!clientRes.headersSent) {
          clientRes.status(504).json({ error: "Radio stream upstream timeout" });
        }
      });
    } catch (err: any) {
      if (!clientRes.headersSent) {
        clientRes.status(500).json({ error: "Invalid stream URL", details: err.message });
      }
    }
  };

  // Dedicated Cairo Quran Radio Stream (إذاعة القرآن الكريم من القاهرة)
  app.get("/api/radio/cairo", (req, res) => {
    // Primary official broadcast source for Cairo Quran Radio
    const cairoPrimaryUrl = "https://stream.radiojar.com/8s5u5tpdtwzuv";
    streamAudioWithRedirects(cairoPrimaryUrl, res, req);
  });

  // Dedicated Saudi Quran Radio Stream
  app.get("/api/radio/saudi", (req, res) => {
    const saudiPrimaryUrl = "https://stream.radiojar.com/4wqre23fytzuv";
    streamAudioWithRedirects(saudiPrimaryUrl, res, req);
  });

  // Generic Radio / Audio Proxy
  app.get("/api/radio/stream", (req, res) => {
    const stationUrl = req.query.url as string;
    if (!stationUrl) {
      return res.status(400).json({ error: "Missing url query param" });
    }
    streamAudioWithRedirects(stationUrl, res, req);
  });

  // Audio download proxy for offline caching fallback
  app.get("/api/audio-proxy", (req, res) => {
    const target = req.query.url as string;
    if (!target) {
      return res.status(400).json({ error: "Missing audio url" });
    }
    streamAudioWithRedirects(target, res, req);
  });

  // 1. AI Islamic Scholar Assistant Endpoint
  app.post("/api/ai/ask", async (req, res) => {
    try {
      const { question, history } = req.body;

      if (!question || typeof question !== "string" || question.trim().length === 0) {
        return res.status(400).json({ error: "الرجاء كتابة سؤال ديني صالح." });
      }

      const ai = getAIClient();
      if (!ai) {
        return res.status(503).json({
          error: "خدمة الذكاء الاصطناعي تحتاج إلى مفتاح API. تأكد من تفعيل المفتاح في إعدادات البيئة."
        });
      }

      const systemPrompt = `أنت "المرشد الإسلامي الذكي" في منصة طريق الهدى القرآنية.
مهمتك: تقديم إجابات إسلامية شرعية وتفسيرية وتاريخية موثوقة، واضحة، معتدلة ومستندة دائماً إلى القرآن الكريم والسنة النبوية الشريفة وأقوال أئمة التفسير والحديث المعتبرين.

شروط وإرشادات صارمة يجب الالتزام بها في كل رد:
1. اذكر دائماً "المصدر والمراجع" بدقة وتفصيل في نهاية كل إجابة وفي متنها:
   - للآيات القرآنية: اذكر (اسم السورة، ورقم الآية).
   - للتفاسير: اذكر مَن مِن المفسرين (مثال: تفسير ابن كثير، تفسير السعدي، تفسير الطبري، أو القرطبي).
   - للأحاديث النبوية: اذكر نص الحديث الشريف، ومن رواه (صحيح البخاري: كتاب... رقم...، صحيح مسلم، سنن أبي داود، الترمذي، إلخ) وحكم المحدثين عليه (صحيح/حسن).
   - للمسائل الفقهية العامة: اذكر أقوال المذاهب الفقهية المعتمدة بتوازن وأدب.
2. تذييل الإجابة دائماً بقسم واضح باسم: "📚 المصادر والمراجع الموثوقة:".
3. تنبيه إخلاء مسؤولية أدبي في المسائل الفقهية الخلافية أو الفتاوى الشخصية الحساسة مثل (الميراث، الطلاق، النوازل المعاصرة): وجّه السائل بأدب إلى استشارة دار الإفتاء الرسمية أو عالم ثقة مؤهل.
4. الأسلوب: لغة عربية فصحى راقية، أسلوب رحيم، مشجع، مؤدب ومطمئن. استخدم التشكيل على الآيات والأدعية.
5. نسّق الإجابة باستخدام Markdown (عناوين، نقاط، واقتباسات للآيات والأحاديث).`;

      // Build conversation contents
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item.sender === 'user') {
            contents.push({ role: 'user', parts: [{ text: item.text }] });
          } else if (item.sender === 'ai') {
            contents.push({ role: 'model', parts: [{ text: item.text }] });
          }
        }
      }

      contents.push({ role: 'user', parts: [{ text: question.trim() }] });

      let replyText = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
            topP: 0.95,
          }
        });
        replyText = response.text || "";
      } catch (geminiErr: any) {
        console.warn("Primary Gemini generation error, retrying:", geminiErr?.message);
        const fallbackRes = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2,
          }
        });
        replyText = fallbackRes.text || "";
      }

      if (!replyText) {
        replyText = "عذراً، لم أتمكن من استخراج إجابة دقيقة في الوقت الحالي. يرجى إعادة صياغة السؤال.";
      }

      return res.json({
        success: true,
        answer: replyText,
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      return res.status(500).json({
        error: "حدث خطأ أثناء معالجة السؤال. الرجاء المحاولة مجدداً.",
        details: error?.message || "Internal server error"
      });
    }
  });

  // 1.1 AI Quranic Recitation Verification & Audit Endpoint (التدقيق القرآني الذكي للتسميع)
  app.post("/api/ai/verify-recitation", async (req, res) => {
    try {
      const { surahName, ayahRange, expectedVerses, userRecitation, recitationStyle = 'murattal' } = req.body;

      if (!expectedVerses || !userRecitation) {
        return res.status(400).json({ error: "الرجاء توفير الآيات الأصلية وتلاوة المستخدم." });
      }

      const ai = getAIClient();
      if (!ai) {
        return res.status(503).json({
          error: "خدمة الذكاء الاصطناعي غير مفعلة حالياً."
        });
      }

      const isTajweed = recitationStyle === 'mujawwad';

      const systemPrompt = `أنت "المحكم والمقرئ القرآني المتقن" في منصة طريق الهدى القرآنية.
مهمتك: التدقيق الصارم لتسميع المستخدم للقرآن الكريم بنمط (${isTajweed ? 'تسميع مُجوَّد بأحكام التجويد' : 'تسميع مُرتَّل بصحة الحفظ'}).
القاعدة الأساسية: "هذا كتاب الله الكريم، الدقة والأمانة فيه مطلقة".

نوع التسميع المطلوب: ${isTajweed ? '💎 مجوَّد (التركيز على أحكام التجويد ومخارج الحروف وصحة الحفظ)' : '🎵 مرتَّل (التركيز على صحة الحفظ وترتيب الآيات والكلمات)'}.

عليك بمقارنة ما قرأه المستخدم مع الآيات القرآنية الأصلية المعتمدة:
1. استخرج "مواضع الخطأ فقط" بوضوح تام:
   - الكلمات المحرفة أو المبدلة (ذكر ما نطقه المستخدم وما هو الصواب القرآني برسم المصحف والتشكيل).
   - الكلمات المنسية أو الساقطة.
   - تقديم أو تأخير الآيات أو الكلمات.
${isTajweed ? `2. تدقيق أحكام التجويد للمقطع (تنبيهات خاصة بالتجويد):
   - أحكام النون الساكنة والتنوين (إظهار، إدغام، إقلاب، إخفاء).
   - أحكام الميم الساكنة والمشددة والغنة.
   - المدود وأنواعها (المتصل، المنفصل، اللازم، العارض للسكون).
   - حروف القلقلة (قطب جد).
   - مخارج الحروف والصفات (الهمس، التفخيم والترقيق كالراء ولام لفظ الجلالة).
   - مواضع الوقف والابتداء السليمة.` : '2. تنبيه خاص بحفظ المقطع وضبط المتشابهات.'}
3. بيان أثر الخطأ في المعنى إن وُجد.
4. إعطاء نصيحة ذهبية لتثبيت حفظ هذه الآيات.
5. تقديم التقرير بشكل مركز ومباشر دون إطالة حشو، بأسلوب راقٍ ومطمئن باستخدام Markdown.`;

      const promptContent = `السورة: ${surahName || 'سورة من القرآن'} (الآيات: ${ayahRange || 'محددة'})
نمط التسميع المختار من المستخدم: ${isTajweed ? 'مجوَّد (مع تدقيق أحكام التجويد والمخارج)' : 'مرتَّل (صحة الحفظ والترتيب)'}

الآيات القرآنية الأصلية المعتمدة:
"${expectedVerses}"

تسميع / تلاوة المستخدم المسجلة:
"${userRecitation}"

المطلوب: بيان مواضع الأخطاء بدقة ${isTajweed ? 'مع أحكام التجويد الخاصة بالمقطع' : ''} وتقديم التصويب الشرعي المعتمد.`;

      let reply = "";
      try {
        const result = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ role: 'user', parts: [{ text: promptContent }] }],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2,
          }
        });
        reply = result.text || "";
      } catch (e: any) {
        console.warn("Recitation audit retry:", e?.message);
        const fallback = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ role: 'user', parts: [{ text: promptContent }] }],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.1,
          }
        });
        reply = fallback.text || "";
      }

      return res.json({
        success: true,
        auditReport: reply,
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error("Quran Recitation Audit Error:", error);
      return res.status(500).json({
        error: "حدث خطأ أثناء تدقيق التسميع. يرجى المحاولة لاحقاً.",
        details: error?.message || "Verification failed"
      });
    }
  });

  // --- Vite Middleware for Development / Static for Production ---
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  const port = Number(process.env.PORT) || PORT;
  app.listen(port, "0.0.0.0", () => {
    console.log(`طريق الهدى الخادم يعمل بنجاح على المنفذ ${port}`);
  });
}

startServer();
