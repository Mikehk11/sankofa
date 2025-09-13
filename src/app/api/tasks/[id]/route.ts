// at top of each route handler file
export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({} as any));
  const { title, status, projectId, assignees } = body as {
    title?: unknown;
    status?: unknown;
    projectId?: unknown;
    assignees?: unknown;
  };

  const data: any = {};
  if (typeof title === "string") data.title = title;
  if (typeof status === "string") data.status = status;
  if (projectId === null || typeof projectId === "string") data.projectId = projectId;
  if (Array.isArray(assignees)) data.assignees = assignees.map(String);

  const updated = await prisma.task.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.task.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}