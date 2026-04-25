import 'dotenv/config';
import { Router, type Request, type Response } from "express";
import mammoth from "mammoth";
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { upload } from "../middleware/upload";


const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const ORGANIZE_PROMPT = `
You are a highly precise academic note organizer, cross-document synthesizer, and structured knowledge extractor.
Your task is to carefully analyze up to 5 separate raw note files and transform them into ONE unified, logically organized, academically rigorous JSON output.

CORE OBJECTIVE:
Combine all provided files into a single, clean, structured, information-dense academic summary.

MULTI-FILE PROCESSING RULES:
1. Treat all files as parts of one larger subject unless clearly unrelated.
2. Identify overlapping concepts across files and MERGE them intelligently.
3. Remove duplicated ideas across documents.
4. Resolve minor wording differences while preserving meaning.
5. If two files contradict each other, prioritize the more detailed/mathematically complete version.
6. Preserve logical academic flow (foundational concepts → definitions → formulas → methods → applications).

STRICT CONTENT RULES:
1. Extract ONLY essential academic, technical, scientific, or mathematical content.
2. STRICTLY IGNORE: prayers, motivational statements, title pages, greetings, repeated content, administrative announcements.
3. Preserve mathematical precision — keep formulas EXACTLY as written.
4. Do NOT invent missing definitions or formulas.
5. Maintain academic tone (formal, concise, precise).

OUTPUT RULES:
- Output must be VALID JSON only.
- Do NOT include markdown formatting or explanations outside the JSON.

JSON STRUCTURE (STRICT FORMAT):
{
  "summary": "2-4 sentence high-level synthesis of the unified academic concepts.",
  "keyPoints": ["Foundational concept", "Important formula", "Method or procedure"],
  "actionItems": ["Explicit academic task mentioned in the notes"]
}

QUALITY STANDARDS:
- keyPoints must contain 5-15 items, logically ordered (basic to advanced).
- Avoid vague phrasing and conversational language.
- Return ONLY valid JSON.
`;

router.post(
  "/organize-notes",
  upload.array("documents", 5),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ error: "No files uploaded." });
        return;
      }

      const aiParts: Part[] = [];

      for (const file of files) {
        const { buffer, mimetype } = file;

        if (mimetype === "application/pdf" || mimetype.startsWith("image/")) {
          aiParts.push({
            inlineData: {
              data: buffer.toString("base64"),
              mimeType: mimetype,
            },
          });
        } else if (
          mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          mimetype === "application/msword"
        ) {
          const { value } = await mammoth.extractRawText({ buffer });
          if (value.trim()) {
            aiParts.push({ text: `Raw Notes:\n"""\n${value.substring(0, 15000)}\n"""` });
          }
        } else {
          res.status(400).json({ error: `Unsupported file type: ${mimetype}` });
          return;
        }
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent([ORGANIZE_PROMPT, ...aiParts]);

      const rawText = result.response.text().trim();
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "");
      const organizedData = JSON.parse(cleanJson);

      res.json(organizedData);
    } catch (error: unknown) {
      console.error("Notes route error:", error);
      const message = error instanceof Error ? error.message : "Failed to process files.";
      res.status(500).json({ error: message });
    }
  }
);

export default router;