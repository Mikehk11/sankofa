import Board from "@/components/kanban/Board";

export default function TasksPage(){
  return (
    <section style={{ display:"grid", gap:16 }}>
      <h1 style={{ margin: 0 }}>Tasks</h1>
      <Board />
      <p style={{ opacity:.7 }}>Tip: drag cards between columns; use “Add” to create new tasks.</p>
    </section>
  );
}