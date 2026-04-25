import multer from "multer";

// Keep files in memory — no disk writes needed
export const upload = multer({ storage: multer.memoryStorage() });
