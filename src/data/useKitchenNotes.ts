import { useEffect, useState } from 'react';
export type NoteBlock = { id: string; type: string; depth?: number; text: { text: string; href?: string; bold?: boolean; italic?: boolean }[]; image?: string; caption?: string };
export type NotePost = { slug: string; title: string; intro: string; category: string; date?: string | null; image?: string; imageAlt?: string; blocks?: NoteBlock[] };
type Result = { configured: boolean; posts?: NotePost[]; post?: NotePost; error?: string };
export function useKitchenNotes(slug?: string) {
  const [state, setState] = useState<{ loading: boolean; data?: Result; error?: string }>({ loading: true });
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true });
    fetch(`/api/kitchen-notes${slug ? `?slug=${encodeURIComponent(slug)}` : ''}`, { signal: controller.signal })
      .then(async response => {
        const data = await response.json() as Result;
        if (!response.ok) throw new Error(data.error ?? 'Kitchen Notes sind gerade nicht erreichbar.');
        return data;
      }).then(data => setState({ loading: false, data }))
      .catch(error => { if (!controller.signal.aborted) setState({ loading: false, error: error.message }); });
    return () => controller.abort();
  }, [slug]);
  return state;
}
