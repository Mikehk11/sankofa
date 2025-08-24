"use client";

import { useState } from "react";

import GoalRow from "@/components/GoalRow";
import AvatarRow from "@/components/AvatarRow";
import ChatDrawer from "@/components/ChatDrawer";
import ProgressChart from "@/components/ProgressChart";
import MiniCalendar from "@/components/MiniCalendar";
import ProjectsOverview from "@/components/projects/ProjectsOverview";
import NewEvent from "@/components/calendar/NewEvent";

export default function DashboardPage() {
  const [chatUser, setChatUser] = useState<string | null>(null);

  return (
    <section style={{ display: "grid", gap: 16 }}>
      {/* Top: goals */}
      <GoalRow />

      {/* Middle: chart (left) + calendar stack (right) */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "2fr 1fr" }}>
        <ProgressChart />
        <div style={{ display: "grid", gap: 16 }}>
          <MiniCalendar />
          <NewEvent />
        </div>
      </div>

      {/* Projects overview */}
      <ProjectsOverview />

      {/* Bottom: who’s online */}
      <div
        style={{
          border: "1px solid var(--border)",
          background: "var(--card)",
          borderRadius: 18,
          padding: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Who’s online</h3>
        <AvatarRow onPick={(id) => setChatUser(id)} />
        <p style={{ opacity: 0.7, marginTop: 8 }}>Click an avatar to start a chat.</p>
      </div>

      {chatUser && <ChatDrawer userId={chatUser} onClose={() => setChatUser(null)} />}
    </section>
  );
}