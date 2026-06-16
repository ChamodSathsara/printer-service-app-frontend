import fs from "fs";
import path from "path";
import { Machine, Manager, Technician, Visit } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(file: string): T {
  const filePath = path.join(DATA_DIR, file);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJson<T>(file: string, data: T): void {
  const filePath = path.join(DATA_DIR, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export interface UsersFile {
  managers: Manager[];
  technicians: Technician[];
}

export const db = {
  getUsers(): UsersFile {
    return readJson<UsersFile>("users.json");
  },
  saveUsers(data: UsersFile) {
    writeJson("users.json", data);
  },
  getMachines(): Machine[] {
    return readJson<Machine[]>("machines.json");
  },
  getVisits(): Visit[] {
    return readJson<Visit[]>("visits.json");
  },
  saveVisits(visits: Visit[]) {
    writeJson("visits.json", visits);
  },
  getCategories(): string[] {
    return readJson<string[]>("categories.json");
  },
};
