import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://www.supperedit.de";
const SITE_NAME = "Supper Edit";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SEOProps {
  title: string;
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

export default function SEO({ title, description, image, imageAlt, ogTitle, ogDescription }: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    const url = `${SITE_URL}${location.pathname}`;
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

    if (imageAlt) {
      upsertMeta("property", "og:image:alt", imageAlt);
    }
  }, [title, description, image, imageAlt, ogTitle, ogDescription, location.pathname]);

  return null;
}
