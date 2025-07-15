import Header from "./Header";
import { Outlet } from "react-router-dom";
import OldBackground from "./OldBackground";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#040D12] text-white font-roboto">
      <OldBackground />
      <Header />
      <main className="pt-20 min-h-screen bg-[#040D12]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
} 