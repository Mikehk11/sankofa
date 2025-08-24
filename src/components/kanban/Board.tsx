"use client";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from "@dnd-kit/core";
import styles from "./Kanban.module.scss";
import type { Status } from "@/data/tasks";
import { useTasks } from "@/state/tasks";
import Column from "./Column";

const STATUSES: Status[] = ["todo","doing","review","done"];

export default function Board(){
  const tasks = useTasks(s=>s.tasks);
  const move = useTasks(s=>s.moveTask);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function onDragEnd(e: DragEndEvent){
    const activeId = String(e.active.id);          // "task:xyz"
    const overId = e.over ? String(e.over.id) : "";
    if (!activeId.startsWith("task:") || !overId) return;

    // Destination: if dropped on a column, overId is the Status; if on a task, derive that task's status
    let dest: Status | null = null;
    if (STATUSES.includes(overId as Status)) dest = overId as Status;
    else if (overId.startsWith("task:")){
      const id = overId.replace("task:","");
      const t = tasks.find(x=>x.id===id);
      if (t) dest = t.status;
    }
    if (!dest) return;

    const taskId = activeId.replace("task:","");
    move(taskId, dest);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className={styles.board}>
        {STATUSES.map(s => (
          <Column key={s} status={s} items={tasks.filter(t=>t.status===s)} />
        ))}
      </div>
    </DndContext>
  );
}