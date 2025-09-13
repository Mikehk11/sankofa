-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "assignees" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "projectId" DROP NOT NULL;
