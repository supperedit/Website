import "./styles/globals.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import CursorEffect from "./components/CursorEffect";
import LoadingScreen from "./components/LoadingScreen";
import { useRecipes } from "./data/useRecipes";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import Recipe from "./pages/Recipe";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import NotFound from "./pages/NotFound";
import Favorites from "./pages/Favorites";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { recipes, loading } = useRecipes();
  const [imagesReady, setImagesReady] = useState(false);

  useEffect(() => {
    if (loading || recipes.length === 0) {
      return;
    }
    const previewImages = recipes
      .slice(-3)
      .map((r) => r.image)
      .filter((src): src is string => Boolean(src));

    if (previewImages.length === 0) {
      setImagesReady(true);
      return;
    }

    let remaining = previewImages.length;
    let settled = false;
    const markDone = () => {
      remaining -= 1;
      if (remaining <= 0 && !settled) {
        settled = true;
        setImagesReady(true);
      }
    };

    previewImages.forEach((src) => {
      const img = new Image();
      img.onload = markDone;
      img.onerror = markDone;
      img.src = src;
    });

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        setImagesReady(true);
      }
    }, 4000);

    return () => clearTimeout(timeout);
  }, [loading, recipes]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LoadingScreen visible={loading || !imagesReady} />
      <ScrollToTop />

      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rezepte" element={<Recipes />} />
          <Route path="/rezepte/:slug" element={<Recipe />} />
          <Route path="/about" element={<About />} />
          <Route path="/kontakt" element={<Contact />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/merkliste" element={<Favorites />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <CookieBanner />
    </BrowserRouter>
  );
}