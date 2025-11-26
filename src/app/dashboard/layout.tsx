"use client";
// import "./layout.css";
import '@/app/style/style.css';
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      <main className="dashboard-content">
        {children}
        <Toaster position="top-right" />
      </main>
    </div>
  );
}
