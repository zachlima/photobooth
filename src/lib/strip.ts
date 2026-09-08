import { CELL_ASPECT, type FrameId } from '../types';

const W = 800;
const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

interface Cell {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Layout {
  width: number;
  height: number;
  cells: Cell[];
  footerY: number;
}

interface FrameSpec {
  bg: string;
  ink: string;
  padX?: number;
  padTop?: number;
  gutter?: number;
  footer?: number;
  layout?: (count: number) => Layout;
  coverPhotos?: boolean;
  standardCaption?: boolean;
  under?: (ctx: CanvasRenderingContext2D, layout: Layout) => void;
  over?: (ctx: CanvasRenderingContext2D, layout: Layout, date: Date) => void;
}

const SPROCKET_W = 56;

const SPECS: Record<FrameId, FrameSpec> = {
  black: {
    bg: '#171717', ink: '#fdfcf7', padX: 44, padTop: 44, gutter: 22, footer: 116,
    standardCaption: true,
  },
  white: {
    bg: '#ffffff', ink: '#1a1a1a', padX: 44, padTop: 44, gutter: 22, footer: 116,
    standardCaption: true,
    over: (ctx, layout) => {
      ctx.strokeStyle = '#ddd8c8';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, layout.width - 2, layout.height - 2);
    },
  },
  film: {
    bg: '#141414', ink: '#fdfcf7', padX: SPROCKET_W + 22, padTop: 48, gutter: 26,
    footer: 120, standardCaption: true,
    over: (ctx, layout) => {
      const holeW = 26;
      const holeH = 30;
      const pitch = 52;
      const count = Math.floor((layout.height - 20) / pitch);
      const offset = (layout.height - count * pitch) / 2 + (pitch - holeH) / 2;
      ctx.fillStyle = '#fdfcf7';
      for (let i = 0; i < count; i++) {
        const y = offset + i * pitch;
        roundRect(ctx, (SPROCKET_W - holeW) / 2, y, holeW, holeH, 6);
        ctx.fill();
        roundRect(ctx, layout.width - SPROCKET_W + (SPROCKET_W - holeW) / 2, y, holeW, holeH, 6);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(253,252,247,0.65)';
      ctx.font = '700 20px Gaegu, "Short Stack", cursive';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      layout.cells.forEach((cell, i) => ctx.fillText(`${i + 1}A`, cell.x + 2, cell.y - 11));
    },
  },
  japaneseId: {
    bg: '#fbfdff', ink: '#153c70', layout: gridLayout, under: drawIdPaper,
    over: drawIdDetails,
  },
  calendar2027: {
    bg: '#f5f1e9', ink: '#27231f', layout: calendarLayout, coverPhotos: true,
    under: drawCalendarCards, over: drawCalendars,
  },
  purikura: {
    bg: '#ffcce7', ink: '#9b2d68', layout: gridLayout, under: drawPurikuraPaper,
    over: drawPurikuraDetails,
  },
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function standardLayout(spec: FrameSpec, count: number): Layout {
  const padX = spec.padX ?? 44;
  const padTop = spec.padTop ?? 44;
  const gutter = spec.gutter ?? 22;
  const footer = spec.footer ?? 116;
  const width = W - padX * 2;
  const height = Math.round(width / CELL_ASPECT);
  const cells = Array.from({ length: count }, (_, i) => ({
    x: padX,
    y: padTop + i * (height + gutter),
    w: width,
    h: height,
  }));
  const footerY = padTop + count * height + Math.max(0, count - 1) * gutter;
  return { width: W, height: footerY + footer, cells, footerY };
}

function gridLayout(count: number): Layout {
  const padX = 58;
  const padTop = 58;
  const gutter = 28;
  const width = (W - padX * 2 - gutter) / 2;
  const height = Math.round(width / CELL_ASPECT);
  const rows = Math.ceil(count / 2);
  const cells = Array.from({ length: count }, (_, i) => ({
    x: padX + (i % 2) * (width + gutter),
    y: padTop + Math.floor(i / 2) * (height + gutter),
    w: width,
    h: height,
  }));
  const footerY = padTop + rows * height + Math.max(0, rows - 1) * gutter;
  return { width: W, height: footerY + 170, cells, footerY };
}

function calendarLayout(count: number): Layout {
  const padX = 28;
  const padTop = 92;
  const gapX = 18;
  const gapY = 20;
  const cardWidth = (W - padX * 2 - gapX * 2) / 3;
  const photoHeight = 178;
  const cardHeight = 292;
  const cells = Array.from({ length: count }, (_, i) => ({
    x: padX + (i % 3) * (cardWidth + gapX),
    y: padTop + Math.floor(i / 3) * (cardHeight + gapY),
    w: cardWidth,
    h: photoHeight,
  }));
  const rows = Math.ceil(count / 3);
  const footerY = padTop + rows * cardHeight + Math.max(0, rows - 1) * gapY;
  return { width: W, height: footerY + 62, cells, footerY };
}

function drawImageCover(ctx: CanvasRenderingContext2D, image: HTMLCanvasElement, cell: Cell) {
  const sourceAspect = image.width / image.height;
  const targetAspect = cell.w / cell.h;
  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;
  if (sourceAspect > targetAspect) {
    sw = image.height * targetAspect;
    sx = (image.width - sw) / 2;
  } else {
    sh = image.width / targetAspect;
    sy = (image.height - sh) / 2;
  }
  ctx.drawImage(image, sx, sy, sw, sh, cell.x, cell.y, cell.w, cell.h);
}

function drawIdPaper(ctx: CanvasRenderingContext2D, layout: Layout) {
  ctx.fillStyle = '#fbfdff';
  ctx.fillRect(0, 0, layout.width, layout.height);
  for (let p = 0; p <= layout.width; p += 16) {
    ctx.strokeStyle = p % 80 === 0 ? '#8fc8ea' : '#c8e4f5';
    ctx.lineWidth = p % 80 === 0 ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, layout.height);
    ctx.stroke();
  }
  for (let p = 0; p <= layout.height; p += 16) {
    ctx.strokeStyle = p % 80 === 0 ? '#8fc8ea' : '#c8e4f5';
    ctx.lineWidth = p % 80 === 0 ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(layout.width, p);
    ctx.stroke();
  }
}

function drawIdDetails(ctx: CanvasRenderingContext2D, layout: Layout, date: Date) {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 7;
  layout.cells.forEach((cell) => ctx.strokeRect(cell.x, cell.y, cell.w, cell.h));
  const y = layout.footerY + 28;
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  ctx.strokeStyle = '#263849';
  ctx.lineWidth = 2;
  ctx.fillRect(40, y, 340, 112);
  ctx.strokeRect(40, y, 340, 112);
  ctx.fillStyle = '#263849';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '700 22px system-ui, sans-serif';
  ctx.fillText('領収書', 58, y + 15);
  ctx.font = '500 18px ui-monospace, monospace';
  ctx.fillText(formatLocalDateTime(date), 58, y + 45);
  ctx.fillStyle = '#155ca0';
  ctx.font = '800 27px system-ui, sans-serif';
  ctx.fillText('¥800-', 58, y + 72);
  ctx.fillStyle = '#155ca0';
  ctx.textAlign = 'center';
  ctx.font = '800 42px system-ui, sans-serif';
  ctx.fillText('証明写真', 585, y + 20);
  ctx.strokeStyle = '#155ca0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(455, y + 66);
  ctx.lineTo(715, y + 66);
  ctx.stroke();
  ctx.fillStyle = '#d86675';
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.fillText('IDENTIFICATION PHOTOGRAPHS', 585, y + 82);
}

function drawCalendarCards(ctx: CanvasRenderingContext2D, layout: Layout) {
  const gradient = ctx.createLinearGradient(0, 0, layout.width, layout.height);
  gradient.addColorStop(0, '#f7f3eb');
  gradient.addColorStop(1, '#e8e0d2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, layout.width, layout.height);
  ctx.fillStyle = '#211e1b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 42px Gaegu, "Short Stack", cursive';
  ctx.fillText('OUR YEAR IN PHOTOS', layout.width / 2, 35);
  ctx.fillStyle = '#b42642';
  ctx.font = '700 24px ui-monospace, monospace';
  ctx.fillText('2027 · JANUARY — DECEMBER', layout.width / 2, 68);
  layout.cells.forEach((cell) => {
    ctx.save();
    ctx.shadowColor = 'rgba(45,35,25,0.18)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#fffefb';
    ctx.fillRect(cell.x - 6, cell.y - 6, cell.w + 12, 292);
    ctx.restore();
  });
}

function drawCalendars(ctx: CanvasRenderingContext2D, layout: Layout) {
  layout.cells.forEach((cell, month) => {
    ctx.strokeStyle = '#eee8dc';
    ctx.lineWidth = 2;
    ctx.strokeRect(cell.x, cell.y, cell.w, cell.h);
    drawMiniCalendar(ctx, 2027, month, cell.x + 8, cell.y + cell.h + 7, cell.w - 16, 96);
  });
  ctx.fillStyle = '#6b6259';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 18px Gaegu, "Short Stack", cursive';
  ctx.fillText('twelve little moments, one unforgettable year', layout.width / 2, layout.footerY + 30);
}

function drawMiniCalendar(
  ctx: CanvasRenderingContext2D,
  year: number,
  month: number,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const columnWidth = width / 7;
  const rowHeight = (height - 34) / 6;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#211e1b';
  ctx.font = '800 15px ui-monospace, monospace';
  ctx.fillText(String(month + 1).padStart(2, '0'), x, y);
  ctx.font = '700 10px ui-monospace, monospace';
  ctx.fillText(MONTHS[month], x + 26, y + 3);
  ctx.textAlign = 'center';
  ctx.font = '700 7px ui-monospace, monospace';
  ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((day, i) => {
    ctx.fillStyle = i === 0 ? '#b42642' : '#716960';
    ctx.fillText(day, x + columnWidth * (i + 0.5), y + 22);
  });
  ctx.font = '600 8px ui-monospace, monospace';
  for (let day = 1; day <= days; day++) {
    const index = firstDay + day - 1;
    const column = index % 7;
    const row = Math.floor(index / 7);
    ctx.fillStyle = column === 0 ? '#b42642' : '#211e1b';
    ctx.fillText(String(day), x + columnWidth * (column + 0.5), y + 34 + row * rowHeight);
  }
}

function drawPurikuraPaper(ctx: CanvasRenderingContext2D, layout: Layout) {
  const gradient = ctx.createLinearGradient(0, 0, layout.width, layout.height);
  gradient.addColorStop(0, '#fff0fa');
  gradient.addColorStop(0.45, '#ffc5e5');
  gradient.addColorStop(1, '#e3c9ff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, layout.width, layout.height);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let y = 18; y < layout.height; y += 34) {
    for (let x = (y / 34) % 2 ? 18 : 35; x < layout.width; x += 54) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawPurikuraDetails(ctx: CanvasRenderingContext2D, layout: Layout) {
  layout.cells.forEach((cell, i) => {
    ctx.strokeStyle = i % 2 ? '#d994ff' : '#ff74b9';
    ctx.lineWidth = 12;
    roundRect(ctx, cell.x - 3, cell.y - 3, cell.w + 6, cell.h + 6, 18);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    roundRect(ctx, cell.x + 2, cell.y + 2, cell.w - 4, cell.h - 4, 13);
    ctx.stroke();
  });
  const stickers = [
    [42, 52, 22, -0.15], [758, 72, 25, 0.12], [38, 540, 19, 0.08],
    [762, 705, 23, -0.12], [95, layout.footerY + 55, 18, 0.1],
    [700, layout.footerY + 58, 20, -0.08],
  ];
  stickers.forEach(([x, y, size, tilt]) => drawHeart(ctx, x, y, size, tilt));
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e74f9c';
  ctx.lineWidth = 3;
  roundRect(ctx, 205, layout.footerY + 28, 390, 88, 38);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#d83d91';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 42px Gaegu, "Short Stack", cursive';
  ctx.fillText('PURI ♥ CLUB', layout.width / 2, layout.footerY + 60);
  ctx.fillStyle = '#8f4b7c';
  ctx.font = '700 18px Gaegu, "Short Stack", cursive';
  ctx.fillText('kawaii forever!', layout.width / 2, layout.footerY + 94);
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  tilt: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.35);
  ctx.bezierCurveTo(-size * 0.8, -size * 0.15, -size * 0.45, -size * 0.75, 0, -size * 0.32);
  ctx.bezierCurveTo(size * 0.45, -size * 0.75, size * 0.8, -size * 0.15, 0, size * 0.35);
  ctx.fillStyle = '#ff4f9f';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, size * 0.13);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function formatDate(date: Date) {
  const pad = (number: number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

function formatLocalDateTime(date: Date) {
  const pad = (number: number) => String(number).padStart(2, '0');
  return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function layoutFor(frame: FrameId, count: number) {
  const spec = SPECS[frame];
  return spec.layout?.(count) ?? standardLayout(spec, count);
}

export async function renderStrip(
  photos: HTMLCanvasElement[],
  frame: FrameId,
  date = new Date(),
): Promise<string> {
  const spec = SPECS[frame];
  const layout = layoutFor(frame, photos.length);
  try {
    await document.fonts.ready;
  } catch {
    // Font loading is optional; the canvas has system fallbacks.
  }
  const canvas = document.createElement('canvas');
  canvas.width = layout.width;
  canvas.height = layout.height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = spec.bg;
  ctx.fillRect(0, 0, layout.width, layout.height);
  spec.under?.(ctx, layout);
  photos.forEach((photo, i) => {
    const cell = layout.cells[i];
    if (!cell) return;
    if (spec.coverPhotos) drawImageCover(ctx, photo, cell);
    else ctx.drawImage(photo, cell.x, cell.y, cell.w, cell.h);
  });
  spec.over?.(ctx, layout, date);
  if (spec.standardCaption) {
    const centerX = layout.width / 2;
    const centerY = layout.footerY + (spec.footer ?? 116) / 2;
    ctx.fillStyle = spec.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 40px Gaegu, "Short Stack", cursive';
    ctx.fillText('PHOTO BOOTH', centerX, centerY - 16);
    ctx.globalAlpha = 0.72;
    ctx.font = '400 34px Gaegu, "Short Stack", cursive';
    ctx.fillText(formatDate(date), centerX, centerY + 24);
    ctx.globalAlpha = 1;
  }
  return canvas.toDataURL('image/jpeg', 0.92);
}

export function stripAspect(frame: FrameId, count = 4): number {
  const layout = layoutFor(frame, count);
  return layout.width / layout.height;
}
