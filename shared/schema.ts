import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface Clip {
  id: string;
  filename: string;
  startTime: number;
  endTime: number;
  duration: number;
  filepath: string;
}

export interface ClipJob {
  id: string;
  status: "pending" | "downloading" | "extracting" | "transcribing" | "detecting" | "generating" | "complete" | "error";
  progress: number;
  sourceType: "url" | "file";
  sourceUrl?: string;
  sourceFilename?: string;
  videoPath?: string;
  audioPath?: string;
  transcript?: TranscriptSegment[];
  clips: Clip[];
  error?: string;
}

export const insertClipJobSchema = z.object({
  sourceType: z.enum(["url", "file"]),
  sourceUrl: z.string().optional(),
  sourceFilename: z.string().optional(),
});

export type InsertClipJob = z.infer<typeof insertClipJobSchema>;
