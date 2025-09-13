// at top of each route handler file
export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const { name, due } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const project = await prisma.project.create({
    data: { name, due: due ? new Date(due) : null },
  });
  return NextResponse.json(project, { status: 201 });
}