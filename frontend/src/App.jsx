import { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Practice from "./pages/Practice.jsx";

export default function App() {
  const [page, setPage] = useState("practice");

  return (
    <div className="min-h-screen bg-stone-50 text-zinc-950">
      <Navbar currentPage={page} onNavigate={setPage} />
      <main>{page === "home" ? <Home onStart={() => setPage("practice")} /> : <Practice />}</main>
    </div>
  );
}

