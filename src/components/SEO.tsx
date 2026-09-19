import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { SITE_URL, canonicalPath, jsonLdText } from "../data/seo";
const SITE_NAME = "Supper Edit";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SEOProps {
  title: string;
  noindex?: boolean;
  structuredData?: unknown;
  description: string;
  image?: string;
  imageAlt?: string;
  ogTitle?: string;
  ogDescription?: string;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function SEO({ title, description, image, imageAlt, ogTitle, ogDescription, noindex = false, structuredData }: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    const url = `${SITE_URL}${canonicalPath(location.pathname, location.search)}`;
    const resolvedImage = image
      ? image.startsWith("http")
        ? image
        : `${SITE_URL}${image}`
      : DEFAULT_IMAGE;
    const resolvedOgTitle = ogTitle ?? title;
    const resolvedOgDescription = ogDescription ?? description;

    document.title = `${title} · ${SITE_NAME}`;

    upsertMeta("name", "description", description);
    upsertCanonical(url);

    upsertMeta("property", "og:title", resolvedOgTitle);
    upsertMeta("property", "og:description", resolvedOgDescription);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", resolvedImage);

    upsertMeta("name", "twitter:title", resolvedOgTitle);
    upsertMeta("name", "twitter:description", resolvedOgDescription);
    upsertMeta("name", "twitter:image", resolvedImage);

    upsertMeta("property", "og:image:alt", imageAlt || title);
    upsertMeta("name", "twitter:image:alt", imageAlt || title);
    upsertMeta("property", "og:type", "website");
    upsertMeta("name", "robots", noindex ? "noindex, follow" : "index, follow, max-image-preview:large");
    let script = document.getElementById("page-jsonld");
    if (structuredData) {
      if (!script) {
        script = document.createElement("script");
        script.id = "page-jsonld";
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = jsonLdText(structuredData);
    } else script?.remove();
    return () => { document.getElementById("page-jsonld")?.remove(); };
  }, [title, description, image, imageAlt, ogTitle, ogDescription, location.pathname, location.search, noindex, structuredData]);

  return null;
}
