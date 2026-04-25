import 'dotenv/config';
import { Router, type Request, type Response } from "express";
import mammoth from "mammoth";
import { GoogleGenerativeAI, SchemaType, type Part } from "@google/generative-ai";
import { upload } from "../middleware/upload";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const quizSchema = {
  description: "A list of multiple-choice quiz questions",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      question: { type: SchemaType.STRING },
      options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      correctAnswer: { type: SchemaType.STRING },
    },
    required: ["question", "options", "correctAnswer"],
  },
};

router.post("/generate-quiz", upload.single("file"), async (req: MulterRequest, res: Response) => {
  try {
    const { topicPrompt, numItems, difficulty } = req.body as {
      topicPrompt: string;
      numItems: string;
      difficulty: string;
    };
    const file = req.file as Express.Multer.File | undefined;

    let extractedText = topicPrompt ?? "";
    const parts: Part[] = [];

    if (file) {
      if (
        file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const { value } = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText += `\nSource Content from Document:\n${value}`;
      } else if (
        file.mimetype === "application/pdf" ||
        file.mimetype.startsWith("image/")
      ) {
        parts.push({
          inlineData: {
            data: file.buffer.toString("base64"),
            mimeType: file.mimetype,
          },
        });
      }
    }

    const promptText = `You are an expert teacher. Generate a ${numItems ?? 5}-question multiple-choice quiz.
Difficulty: ${difficulty ?? "Medium"}.
Context: ${extractedText || "Use the attached file."}.
Return ONLY valid JSON.`;

    parts.unshift({ text: promptText });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: quizSchema as any,
      },
    });

    const result = await model.generateContent(parts);
    const quiz = JSON.parse(result.response.text());

    res.json(quiz);
  } catch (error: unknown) {
    console.error("Quiz route error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate quiz.";
    res.status(500).json({ error: message });
  }
});

export default router;
