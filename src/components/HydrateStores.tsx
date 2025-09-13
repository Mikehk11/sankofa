"use client";
import { useEffect } from "react";
import { useProjects } from "@/state/projects";
import { useTasks } from "@/state/tasks";

export default function HydrateStores() {
  const loadProjects = useProjects((s) => s.load);
  const loadTasks = useTasks((s) => s.load);

  useEffect(() => {
    loadProjects();
    loadTasks();
  }, [loadProjects, loadTasks]);

  return null;
}