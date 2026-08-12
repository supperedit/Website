export const SPRITE_SHEET_WIDTH = 747;
export const SPRITE_SHEET_HEIGHT = 929;

export interface SpriteRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const seasonalSpritePositions: Record<string, SpriteRect> = {
  apfel: { x: 391, y: 522, w: 114, h: 137 },
  aprikose: { x: 2, y: 522, w: 116, h: 142 },
  baerlauch: { x: 2, y: 4, w: 83, h: 201 },
  brennessel: { x: 515, y: 4, w: 139, h: 154 },
  chicoree: { x: 658, y: 4, w: 84, h: 153 },
  feldsalat: { x: 254, y: 522, w: 133, h: 138 },
  gruenkohl: { x: 2, y: 209, w: 137, h: 154 },
  gurken: { x: 2, y: 668, w: 129, h: 132 },
  heidelbeeren: { x: 245, y: 804, w: 126, h: 104 },
  johannisbeeren: { x: 383, y: 367, w: 84, h: 150 },
  kohlrabie: { x: 609, y: 209, w: 122, h: 152 },
  lauch: { x: 255, y: 209, w: 128, h: 153 },
  loewenzahn: { x: 648, y: 522, w: 97, h: 106 },
  meerrettich: { x: 387, y: 209, w: 98, h: 153 },
  palmkohl: { x: 387, y: 4, w: 124, h: 155 },
  paprika: { x: 471, y: 367, w: 123, h: 150 },
  pastinaken: { x: 2, y: 367, w: 112, h: 151 },
  pflaumen: { x: 415, y: 668, w: 143, h: 124 },
  portulak: { x: 118, y: 367, w: 126, h: 151 },
  radieschen: { x: 598, y: 367, w: 91, h: 144 },
  rhabarber: { x: 89, y: 4, w: 98, h: 189 },
  rosenkohl: { x: 562, y: 668, w: 122, h: 124 },
  rote_beete: { x: 248, y: 367, w: 131, h: 151 },
  schwarzwurzel: { x: 191, y: 4, w: 80, h: 157 },
  sellerie: { x: 489, y: 209, w: 116, h: 153 },
  spargel: { x: 275, y: 4, w: 108, h: 156 },
  spinat: { x: 2, y: 804, w: 123, h: 121 },
  stachelbeere: { x: 509, y: 522, w: 135, h: 135 },
  taubnessel: { x: 143, y: 209, w: 108, h: 154 },
  tomate: { x: 375, y: 804, w: 133, h: 104 },
  topinambur: { x: 277, y: 668, w: 134, h: 131 },
  vogelmiere: { x: 122, y: 522, w: 128, h: 139 },
  waldmeister: { x: 129, y: 804, w: 112, h: 118 },
  wirsing: { x: 135, y: 668, w: 138, h: 132 },
};
