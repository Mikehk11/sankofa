"use client";
import styles from "./Projects.module.scss";
import { useProjects } from "@/state/projects";

export default function ProjectsOverview(){
  const projects = useProjects(s=>s.projects);
  return (
    <div className="card">
      <h3 style={{marginTop:0}}>Projects Overview</h3>
      <div className={styles.grid}>
        {projects.map(p=>(
          <div key={p.id} className={styles.card}>
            <div className={styles.row}>
              <strong>{p.name}</strong>
              {p.due && <div style={{fontSize:12,opacity:.7}}>Due: <span className="mono">{p.due}</span></div>}
              <div className={styles.bar}><div className={styles.fill} style={{width:`${Math.max(0,Math.min(100,p.progress))}%`}}/></div>
              <div style={{display:"flex",gap:8,alignItems:"baseline"}}>
                <span>Progress:</span>
                <span className="mono">{p.progress}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}