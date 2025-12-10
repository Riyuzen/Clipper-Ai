import { type User, type InsertUser, type ClipJob, type InsertClipJob, type Clip } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createClipJob(job: InsertClipJob): Promise<ClipJob>;
  getClipJob(id: string): Promise<ClipJob | undefined>;
  updateClipJob(id: string, updates: Partial<ClipJob>): Promise<ClipJob | undefined>;
  getClip(jobId: string, clipId: string): Promise<Clip | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private clipJobs: Map<string, ClipJob>;

  constructor() {
    this.users = new Map();
    this.clipJobs = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createClipJob(job: InsertClipJob): Promise<ClipJob> {
    const id = randomUUID();
    const clipJob: ClipJob = {
      id,
      status: "pending",
      progress: 0,
      sourceType: job.sourceType,
      sourceUrl: job.sourceUrl,
      sourceFilename: job.sourceFilename,
      clips: [],
    };
    this.clipJobs.set(id, clipJob);
    return clipJob;
  }

  async getClipJob(id: string): Promise<ClipJob | undefined> {
    return this.clipJobs.get(id);
  }

  async updateClipJob(id: string, updates: Partial<ClipJob>): Promise<ClipJob | undefined> {
    const job = this.clipJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.clipJobs.set(id, updatedJob);
    return updatedJob;
  }

  async getClip(jobId: string, clipId: string): Promise<Clip | undefined> {
    const job = this.clipJobs.get(jobId);
    if (!job) return undefined;
    return job.clips.find(c => c.id === clipId);
  }
}

export const storage = new MemStorage();
