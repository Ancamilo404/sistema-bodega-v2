"use client";
import '@/app/style/style.css';
import { useRouter } from "next/navigation";
import { FaTools } from "react-icons/fa";
import { FiAlertTriangle } from "react-icons/fi";

export default function NoAutorizadoPage() {
  const router = useRouter();

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
      textAlign: "center"
    }}>
    <FiAlertTriangle size={68} />
      <h1> Esta En Planeación <FaTools size={18}/> </h1>
      <p style={{margin: '0 0  30px 0 ',}}>Se esta negociado y planeados si se va contruir esta parte de app</p>

      <button className="boton" onClick={() => router.back()}>
        Volver
      </button>
    </div>
  );
}
