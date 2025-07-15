// App.jsx
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";

const Home = lazy(() => import("./pages/Home"));
const Analyzer = lazy(() => import("./pages/Analyzer"));
const FaceScanner = lazy(() => import("./pages/FaceScanner"));
const Insights = lazy(() => import("./pages/Insights"));

function App() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="analyze" element={<Analyzer />} />
          <Route path="face-scan" element={<FaceScanner />} />
          <Route path="insights" element={<Insights />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
