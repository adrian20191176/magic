import { pointer } from "./pointer";

/**
 * Floating gold dust drawn on a single canvas: motes drift upwards with depth
 * parallax, part around the pointer, and a burst of glints greets every reveal.
 */

const TAU = Math.PI * 2;

type Mote = {
  x: number;
  y: number;
  z: number; // depth 0.15 (far) … 1 (near)
  vx: number;
  vy: number;
  ox: number; // displacement from the pointer
  oy: number;
  phase: number;
  speed: number;
  size: number;
  warm: boolean;
};

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  rot: number;
  spin: number;
  glint: boolean;
};

export type DustSystem = {
  burst: (x: number, y: number, width: number, height: number) => void;
  destroy: () => void;
};

function sprite(paint: (ctx: CanvasRenderingContext2D, size: number) => void, size = 64) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) paint(ctx, size);
  return canvas;
}

const glow = (core: string, mid: string, edge: string) =>
  sprite((ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, core);
    g.addColorStop(0.16, mid);
    g.addColorStop(0.45, edge);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });

const glintSprite = () =>
  sprite((ctx, s) => {
    const c = s / 2;
    ctx.translate(c, c);
    for (const [len, width] of [
      [c, 1.6],
      [c * 0.55, 1.1],
    ] as const) {
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        const g = ctx.createLinearGradient(0, 0, len, 0);
        g.addColorStop(0, "rgba(255, 246, 220, 1)");
        g.addColorStop(1, "rgba(255, 220, 150, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, -width);
        ctx.lineTo(len, 0);
        ctx.lineTo(0, width);
        ctx.closePath();
        ctx.fill();
      }
      ctx.rotate(Math.PI / 4);
    }
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, c * 0.35);
    core.addColorStop(0, "rgba(255, 250, 235, 1)");
    core.addColorStop(1, "rgba(255, 215, 140, 0)");
    ctx.fillStyle = core;
    ctx.fillRect(-c, -c, s, s);
  });

export function createDust(canvas: HTMLCanvasElement, { reducedMotion }: { reducedMotion: boolean }): DustSystem {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { burst: () => undefined, destroy: () => undefined };

  const warm = glow("rgba(255, 238, 200, 1)", "rgba(244, 200, 120, 0.8)", "rgba(200, 150, 70, 0.2)");
  const pale = glow("rgba(255, 252, 240, 1)", "rgba(250, 232, 190, 0.75)", "rgba(220, 190, 130, 0.18)");
  const glint = glintSprite();

  const motes: Mote[] = [];
  const sparks: Spark[] = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let last = performance.now();
  let parallaxX = 0;
  let parallaxY = 0;

  const spawn = (anywhere: boolean): Mote => {
    const z = 0.15 + Math.pow(Math.random(), 1.7) * 0.85;
    return {
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + 12,
      z,
      vx: (Math.random() - 0.5) * 8 * z,
      vy: -(5 + Math.random() * 16) * z,
      ox: 0,
      oy: 0,
      phase: Math.random() * TAU,
      speed: 0.5 + Math.random() * 1.6,
      size: 0.7 + z * 2.6,
      warm: Math.random() < 0.6,
    };
  };

  const resize = () => {
    // Soft glows don't need retina pixels; capping the backing store keeps phones cool.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.round(Math.min(110, Math.max(34, (width * height) / 15000)) * (reducedMotion ? 0.5 : 1));
    while (motes.length < target) motes.push(spawn(true));
    motes.length = target;
  };

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    const tx = pointer.active ? pointer.x / width - 0.5 : 0;
    const ty = pointer.active ? pointer.y / height - 0.5 : 0;
    const ease = 1 - Math.exp(-dt * 2);
    parallaxX += (tx - parallaxX) * ease;
    parallaxY += (ty - parallaxY) * ease;
    const relax = Math.exp(-dt * 1.2);

    for (const m of motes) {
      if (!reducedMotion) {
        m.x += (m.vx + Math.sin(t * 0.35 * m.speed + m.phase) * 6 * m.z) * dt;
        m.y += m.vy * dt;
      }
      const x = m.x + m.ox - parallaxX * 46 * m.z;
      const y = m.y + m.oy - parallaxY * 30 * m.z;

      if (pointer.active && !reducedMotion) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const d2 = dx * dx + dy * dy;
        const radius = 150;
        if (d2 < radius * radius && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const push = (1 - d / radius) ** 2 * 320 * dt;
          m.ox += (dx / d) * push;
          m.oy += (dy / d) * push;
        }
      }
      m.ox *= relax;
      m.oy *= relax;

      if (m.y < -24) Object.assign(m, spawn(false));
      if (m.x < -24) m.x += width + 48;
      else if (m.x > width + 24) m.x -= width + 48;

      const twinkle = 0.55 + 0.45 * Math.sin(t * m.speed * 1.4 + m.phase);
      ctx.globalAlpha = (0.16 + 0.62 * m.z) * twinkle;
      const s = m.size * 7;
      ctx.drawImage(m.warm ? warm : pale, x - s / 2, y - s / 2, s, s);
    }

    const drag = Math.exp(-dt * 2.4);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.age += dt;
      if (p.age >= p.life) {
        sparks[i] = sparks[sparks.length - 1];
        sparks.pop();
        continue;
      }
      p.vx *= drag;
      p.vy = p.vy * drag - 14 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;

      const k = p.age / p.life;
      const alpha = k < 0.12 ? k / 0.12 : Math.pow(1 - (k - 0.12) / 0.88, 1.6);
      ctx.globalAlpha = alpha;
      if (p.glint) {
        const s = p.size * 4.2 * (0.6 + 0.4 * Math.sin(p.age * 9 + p.rot));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * 0.15);
        ctx.drawImage(glint, -s / 2, -s / 2, s, s);
        ctx.restore();
      } else {
        const s = p.size * 3.2;
        ctx.drawImage(warm, p.x - s / 2, p.y - s / 2, s, s);
      }
    }

    ctx.globalAlpha = 1;
    frame = requestAnimationFrame(draw);
  };

  const burst = (x: number, y: number, w: number, h: number) => {
    if (reducedMotion) return;
    const count = Math.round(Math.min(90, 46 + (w * h) / 2600));
    for (let i = 0; i < count; i++) {
      const a = Math.random() * TAU;
      const ex = Math.cos(a);
      const ey = Math.sin(a);
      // Start on the card's edge and fly outwards.
      const reach = 1 / Math.max(Math.abs(ex) / (w / 2), Math.abs(ey) / (h / 2));
      const speed = 50 + Math.random() * 240;
      sparks.push({
        x: x + ex * reach * (0.9 + Math.random() * 0.1),
        y: y + ey * reach * (0.9 + Math.random() * 0.1),
        vx: ex * speed,
        vy: ey * speed - 24,
        age: 0,
        life: 0.9 + Math.random() * 1.1,
        size: 2.5 + Math.random() * 6,
        rot: Math.random() * TAU,
        spin: (Math.random() - 0.5) * 6,
        glint: Math.random() < 0.32,
      });
    }
  };

  resize();
  window.addEventListener("resize", resize);
  frame = requestAnimationFrame((now) => {
    last = now;
    draw(now);
  });

  return {
    burst,
    destroy() {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    },
  };
}
