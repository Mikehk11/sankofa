export type Project = {
  id: string;
  name: string;
  progress: number;   // 0–100
  due?: string;       // YYYY-MM-DD (optional)
  ownerId?: string;   // optional link to a user
};

export const PROJECTS: Project[] = [
  { id: "p1", name: "Youth Training Program", progress: 60, due: "2025-09-15" },
  { id: "p2", name: "Civic Workshops – Abidjan", progress: 45, due: "2025-10-01" },
  { id: "p3", name: "Partner Onboarding", progress: 30 }
];