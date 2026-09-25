import type { JournalEntry } from './useJournal';

type CardEntry = JournalEntry & { tastingNotesShort?: string | null };
const WIDTH = 1000;
const HEIGHT = 1500;

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n/)) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width <= maxWidth) { line = candidate; continue; }
      if (line) { lines.push(line); line = ''; }
      if (context.measureText(word).width <= maxWidth) { line = word; continue; }
      for (const character of word) {
        if (line && context.measureText(line + character).width > maxWidth) { lines.push(line); line = ''; }
        line += character;
      }
    }
    lines.push(line);
  }
  return lines;
}

function drawText(context: CanvasRenderingContext2D, text: string, family: string, size: number,
  x: number, y: number, width: number, height: number, centered = false) {
  let lines: string[] = [];
  let lineHeight = 0;
  for (; size >= 16; size--) {
    context.font = `400 ${size}px "${family}"`;
    lineHeight = size * (family === 'Homemade Apple' ? 1.65 : 1.3);
    lines = wrapText(context, text, width);
    if (lines.length * lineHeight <= height && lines.every(line => context.measureText(line).width <= width)) break;
  }
  if (size < 16) throw new Error('Der Text ist zu lang für die Karte. Bitte „Geschmack kurz“ in Notion kürzen.');
  context.textAlign = centered ? 'center' : 'left';
  context.textBaseline = 'alphabetic';
  const top = y + (height - lines.length * lineHeight) / 2;
  lines.forEach((line, index) => {
    const metrics = context.measureText(line);
    const ascent = metrics.actualBoundingBoxAscent;
    const descent = metrics.actualBoundingBoxDescent;
    const baseline = top + index * lineHeight + (lineHeight + ascent - descent) / 2;
    context.fillText(line, centered ? x + width / 2 : x, baseline);
  });
}

async function loadFont(family: string, text: string) {
  const loaded = await document.fonts.load(`400 32px "${family}"`, text);
  if (!loaded.length || !document.fonts.check(`400 32px "${family}"`, text)) {
    throw new Error('Die Kartenschrift konnte nicht geladen werden. Bitte kurz warten und erneut versuchen.');
  }
}

export async function exportHerbariumCard(entry: CardEntry): Promise<Blob> {
  if (!entry.image) throw new Error('Für diese Pflanze ist noch kein Kartenbild hinterlegt.');
  const taste = entry.tastingNotesShort || entry.tastingNotes || '–';
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);
  let imageUrl: string | undefined;
  try {
    const fontTask = Promise.all([
      loadFont('Homemade Apple', `${entry.title} ${entry.season || '–'}`),
      loadFont('Elms Sans', `Saison Geschmack: ${taste}`),
    ]);
    const [response] = await Promise.all([
      fetch(`/img/herbarium/${encodeURIComponent(entry.slug)}`, { signal: controller.signal }),
      fontTask,
    ]);
    if (!response.ok) throw new Error('Das Pflanzenbild konnte nicht geladen werden. Bitte erneut versuchen.');
    const imageBlob = await response.blob();
    if (!imageBlob.type.startsWith('image/')) throw new Error('Der Bildserver hat kein gültiges Pflanzenbild geliefert.');
    imageUrl = URL.createObjectURL(imageBlob);
    const image = new Image();
    image.src = imageUrl;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('Das Pflanzenbild ist leer.');

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Dein Browser unterstützt diesen Bildexport nicht.');
    const theme = getComputedStyle(document.documentElement);
    const cream = theme.getPropertyValue('--color-cream').trim() || '#F7F6EC';
    const maroon = theme.getPropertyValue('--color-maroon').trim() || '#430908';
    context.fillStyle = cream;
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.save();
    context.beginPath();
    context.roundRect(1.5, 1.5, 997, 1497, 28);
    context.clip();
    const imageHeight = 1228;
    const scale = Math.max(997 / image.naturalWidth, imageHeight / image.naturalHeight);
    const cropWidth = 997 / scale;
    const cropHeight = imageHeight / scale;
    context.drawImage(image, (image.naturalWidth - cropWidth) / 2,
      (image.naturalHeight - cropHeight) / 2, cropWidth, cropHeight, 1.5, 1.5, 997, imageHeight);
    context.fillStyle = maroon;
    drawText(context, entry.title, 'Homemade Apple', 58, 48, 1238, 530, 114);
    drawText(context, 'Saison', 'Elms Sans', 24, 630, 1238, 336, 32, true);
    drawText(context, entry.season || '–', 'Homemade Apple', 42, 630, 1275, 336, 77, true);
    drawText(context, 'Geschmack:', 'Elms Sans', 24, 48, 1370, 164, 108);
    drawText(context, taste, 'Elms Sans', 30, 236, 1370, 716, 108);
    context.strokeStyle = maroon;
    context.globalAlpha = 0.42;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(0, 1230); context.lineTo(1000, 1230);
    context.moveTo(0, 1365); context.lineTo(1000, 1365);
    context.moveTo(622, 1230); context.lineTo(622, 1365);
    context.stroke();
    context.restore();
    context.strokeStyle = maroon;
    context.globalAlpha = 0.42;
    context.lineWidth = 3;
    context.beginPath();
    context.roundRect(1.5, 1.5, 997, 1497, 28);
    context.stroke();
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Das PNG konnte nicht erstellt werden.')), 'image/png',
    ));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new Error('Das Laden dauert zu lange. Bitte den Download erneut versuchen.');
    throw error;
  } finally {
    window.clearTimeout(timeout);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }
}
