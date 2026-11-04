/** Spring: critically damped by default, interruptible, velocity-aware. */
export class Spring {
  x: number;
  v = 0;
  on: (x: number) => void;
  private raf = 0;

  constructor(x: number, on: (x: number) => void) {
    this.x = x;
    this.on = on;
  }

  set(x: number) {
    cancelAnimationFrame(this.raf);
    this.x = x;
    this.v = 0;
    this.on(x);
  }

  stop() {
    cancelAnimationFrame(this.raf);
  }

  to(target: number, { damping = 1, response = 0.35, velocity }: { damping?: number; response?: number; velocity?: number } = {}, done?: () => void) {
    cancelAnimationFrame(this.raf);
    if (velocity != null) this.v = velocity;
    const k = Math.pow((2 * Math.PI) / response, 2), c = (4 * Math.PI * damping) / response;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.034, (now - last) / 1000);
      last = now;
      const h = dt / 4;
      for (let i = 0; i < 4; i++) {
        const a = -k * (this.x - target) - c * this.v;
        this.v += a * h;
        this.x += this.v * h;
      }
      if (Math.abs(this.v) < 4 && Math.abs(this.x - target) < 0.4) {
        this.x = target; this.v = 0; this.on(target); done?.(); return;
      }
      this.on(this.x);
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }
}

export const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Distance a flick at velocity v (px/s) would travel with deceleration d. */
export const project = (v: number, d = 0.998) => ((v / 1000) * d) / (1 - d);

/** Rubber-band resistance past an edge. */
export const rubber = (o: number, dim: number, c = 0.55) => (o * dim * c) / (dim + c * Math.abs(o));

/** +1 for LTR, -1 for RTL. */
export const dir = () => (typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? -1 : 1);

export interface PointerSample { x: number; t: number }
