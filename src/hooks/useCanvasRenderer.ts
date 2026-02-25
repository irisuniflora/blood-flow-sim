import { useRef, useEffect, useCallback } from 'react';
import { useSimulationStore } from '../store/simulation-store';
import { renderVelocityMagnitude } from '../visualization/render-velocity';
import { renderVorticity } from '../visualization/render-vorticity';
import { renderStreamlines } from '../visualization/render-streamlines';
import { viridis, coolwarm } from '../visualization/colormap';
import type { SimulationFrame, VizMode } from '../engine/types';

// Offscreen canvas for rendering at grid resolution, then upscale
let offscreen: OffscreenCanvas | null = null;
let offCtx: CanvasRenderingContext2D | null = null;

function getOffscreenCtx(nx: number, ny: number): CanvasRenderingContext2D | null {
  if (!offscreen || offscreen.width !== nx || offscreen.height !== ny) {
    offscreen = new OffscreenCanvas(nx, ny);
    offCtx = offscreen.getContext('2d') as unknown as CanvasRenderingContext2D;
  }
  return offCtx;
}

function renderFrame(ctx: CanvasRenderingContext2D, frame: SimulationFrame, vizMode: VizMode): void {
  const { nx, ny } = frame;
  const srcCtx = getOffscreenCtx(nx, ny);
  if (!srcCtx) return;

  // Render at native grid resolution
  switch (vizMode) {
    case 'velocity':
    case 'wss':
      renderVelocityMagnitude(srcCtx, frame, viridis);
      break;
    case 'vorticity':
      renderVorticity(srcCtx, frame, coolwarm);
      break;
    case 'streamlines':
      renderStreamlines(srcCtx, frame, viridis);
      break;
  }

  // Upscale to display canvas with smooth interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(offscreen!, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function useCanvasRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useSimulationStore((s) => s.currentFrame);
  const vizMode = useSimulationStore((s) => s.vizMode);

  const updateSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frame) return;

    updateSize();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderFrame(ctx, frame, vizMode);
  }, [frame, vizMode, updateSize]);

  // Re-render on resize
  useEffect(() => {
    const handler = () => {
      const canvas = canvasRef.current;
      const f = useSimulationStore.getState().currentFrame;
      const v = useSimulationStore.getState().vizMode;
      if (!canvas || !f) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);

      const ctx = canvas.getContext('2d');
      if (ctx) renderFrame(ctx, f, v);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return canvasRef;
}
