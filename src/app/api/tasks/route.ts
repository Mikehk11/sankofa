// at top of each route handler file
export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const { title, projectId, status, assignees } = body as {
    title?: string;
    projectId?: string | null;
    status?: string;
    assignees?: unknown;
  };

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title,
      status: status ?? "todo",
      projectId: projectId ?? null,
      // ensure an array
      assignees: Array.isArray(assignees) ? assignees.map(String) : [],
    },
  });

  return NextResponse.json(task);
}