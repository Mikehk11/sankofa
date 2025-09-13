// at top of each route handler file
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Helper: safe parse of `due` coming from JSON (string | null | undefined) */
function parseDue(due: unknown): Date | null | undefined {
  // If the key wasn't sent at all, return undefined (means "don't change")
  if (typeof due === "undefined") return undefined;
  // Allow clearing via null or empty string
  if (due === null || due === "") return null;
  if (typeof due === "string") {
    const d = new Date(due);
    if (Number.isNaN(d.getTime())) {
      throw new Error("INVALID_DUE");
    }
    return d;
  }
  throw new Error("INVALID_DUE");
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json().catch(() => ({} as any));

    const data: {
      name?: string;
      archived?: boolean;
      due?: Date | null;
    } = {};

    if (typeof body.name === "string") data.name = body.name;
    if (typeof body.archived === "boolean") data.archived = body.archived;

    // Only set `due` if the key exists; supports ISO string or null/"" to clear.
    if (Object.prototype.hasOwnProperty.call(body ?? {}, "due")) {
      data.due = parseDue(body.due);
    }

    const updated = await prisma.project.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err?.code === "P2025") {
      // Prisma "record not found"
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (err?.message === "INVALID_DUE") {
      return NextResponse.json({ error: "Invalid due date" }, { status: 400 });
    }
    console.error("[projects/[id] PATCH] unexpected error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Remove child tasks first, then project — atomic via transaction.
    await prisma.$transaction([
      prisma.task.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    console.error("[projects/[id] DELETE] unexpected error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}