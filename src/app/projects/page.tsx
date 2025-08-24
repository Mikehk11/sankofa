"use client";
import styles from "@/components/projects/Projects.module.scss";
import { useProjects } from "@/state/projects";
import { useState } from "react";

export default function ProjectsPage(){
  const { projects, add, update, remove } = useProjects();
  const [name, setName] = useState("");
  const [due, setDue] = useState("");

  return (
    <section style={{ display:"grid", gap:16 }}>
      <h1 style={{margin:0}}>Projects</h1>

      {/* Add new */}
      <form
        className={styles.form}
        onSubmit={(e)=>{ e.preventDefault(); if(!name.trim()) return; add({ name, progress:0, due: due || undefined }); setName(""); setDue(""); }}
      >
        <input className={styles.input} value={name} onChange={e=>setName(e.target.value)} placeholder="Project name…" />
        <input className={styles.date} type="date" value={due} onChange={e=>setDue(e.target.value)} />
        <button className={styles.smallBtn} type="submit">Add Project</button>
      </form>

      {/* List */}
      <div className={styles.grid}>
        {projects.map(p=>(
          <div key={p.id} className={styles.card}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <strong style={{flex:1}}>{p.name}</strong>
              <button className={styles.del} onClick={()=>remove(p.id)} title="Delete">🗑️</button>
            </div>

            <div style={{display:"grid",gap:6,marginTop:6}}>
              <label style={{fontSize:12,opacity:.8}}>Progress: <span className="mono">{p.progress}%</span></label>
              <input type="range" min={0} max={100} value={p.progress} onChange={e=>update(p.id,{progress: Number(e.target.value)})}/>
              <div className={styles.bar}><div className={styles.fill} style={{width:`${p.progress}%`}}/></div>

              <label style={{fontSize:12,opacity:.8}}>Due date</label>
              <input className={styles.date} type="date" value={p.due || ""} onChange={e=>update(p.id,{due:e.target.value})}/>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}