// Sankofa task model (simple for now)
export type Status = "todo" | "doing" | "review" | "done";
export type Category = "outreach" | "workshop" | "admin";

export interface Task {
  id: string;
  title: string;
  category: Category;
  status: Status;
  due?: string; // YYYY-MM-DD (optional)
}

// Seed: adjust/expand as you wish
export const TASKS: Task[] = [
  // Outreach (sensibilisation)
  { id: "t1", title: "Design civic-rights poster", category: "outreach", status: "done" },
  { id: "t2", title: "Instagram carousel (FR)",    category: "outreach", status: "doing" },
  { id: "t3", title: "Translate flyer to local langs", category: "outreach", status: "todo" },

  // Workshops / events
  { id: "t4", title: "Schedule Abidjan workshop",  category: "workshop", status: "done" },
  { id: "t5", title: "Book venue in Yopougon",     category: "workshop", status: "todo" },

  // Admin / ops
  { id: "t6", title: "Volunteer roster (Sept)",    category: "admin",    status: "review" },
];