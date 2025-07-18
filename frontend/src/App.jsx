// App.jsx
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";
import SplashScreen from "./components/SplashScreen";
import { AuthProvider } from "./contexts/AuthContext";

const Home = lazy(() => import("./pages/Home"));
const Analyzer = lazy(() => import("./pages/Analyzer"));
const FaceScanner = lazy(() => import("./pages/FaceScanner"));
const Insights = lazy(() => import("./pages/Insights"));

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<SplashScreen />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="analyze" element={<Analyzer />} />
            <Route path="face-scan" element={<FaceScanner />} />
            <Route path="insights" element={<Insights />} />
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
