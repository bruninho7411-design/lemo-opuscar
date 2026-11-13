import React, {useMemo} from 'react';
import * as THREE from 'three';

export type V3 = [number, number, number];

// ---- shared geometries (low-poly) ----
export const G = {
  ball: new THREE.IcosahedronGeometry(1, 1),
  ballHi: new THREE.IcosahedronGeometry(1, 2),
  ballLo: new THREE.IcosahedronGeometry(1, 0),
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 8),
  cyl12: new THREE.CylinderGeometry(1, 1, 1, 14),
  cone6: new THREE.ConeGeometry(1, 1, 6),
  cone4: new THREE.ConeGeometry(1, 1, 4),
  dome: new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
  plane: new THREE.PlaneGeometry(1, 1),
};

const matCache = new Map<string, THREE.Material>();
export const mat = (color: string, opts: {flat?: boolean; emissive?: string; basic?: boolean} = {}) => {
  const key = `${color}|${opts.flat ?? true}|${opts.emissive ?? ''}|${opts.basic ?? false}`;
  let m = matCache.get(key);
  if (!m) {
    m = opts.basic
      ? new THREE.MeshBasicMaterial({color})
      : new THREE.MeshStandardMaterial({color, flatShading: opts.flat ?? true, roughness: 0.85, metalness: 0, emissive: opts.emissive ? new THREE.Color(opts.emissive) : undefined, emissiveIntensity: opts.emissive ? 0.35 : 0});
    matCache.set(key, m);
  }
  return m;
};
export const OUTLINE = new THREE.MeshBasicMaterial({color: '#1a1410', side: THREE.BackSide});

type PProps = {
  geo: THREE.BufferGeometry;
  color: string;
  p?: V3;
  r?: V3;
  s?: V3 | number;
  o?: number; // outline thickness (relative), 0 = none
  shadow?: boolean;
  material?: THREE.Material;
  visible?: boolean;
};
/** a mesh with an inverted-hull cartoon outline */
export const P: React.FC<PProps> = ({geo, color, p = [0, 0, 0], r = [0, 0, 0], s = 1, o = 0.06, shadow = true, material, visible = true}) => {
  const sc: V3 = typeof s === 'number' ? [s, s, s] : s;
  if (!visible) return null;
  return (
    <group position={p} rotation={r}>
      <mesh geometry={geo} material={material ?? mat(color)} scale={sc} castShadow={shadow} receiveShadow />
      {o > 0 ? <mesh geometry={geo} material={OUTLINE} scale={[sc[0] + o, sc[1] + o, sc[2] + o]} /> : null}
    </group>
  );
};

// ---- canvas text textures ----
const texCache = new Map<string, THREE.Texture>();
export function textTexture(text: string, opt: {bg?: string; fg?: string; w?: number; h?: number; size?: number; border?: string; circle?: boolean} = {}) {
  const {bg = '#f2dfb4', fg = '#2b1a0e', w = 512, h = 160, size = 70, border = '#5a3a1e', circle = false} = opt;
  const key = [text, bg, fg, w, h, size, border, circle].join('|');
  const c = texCache.get(key);
  if (c) return c;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  if (circle) {
    g.fillStyle = border;
    g.beginPath();
    g.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = bg;
    g.beginPath();
    g.arc(w / 2, h / 2, w / 2 - 22, 0, Math.PI * 2);
    g.fill();
  } else {
    g.fillStyle = border;
    g.fillRect(0, 0, w, h);
    g.fillStyle = bg;
    g.fillRect(10, 10, w - 20, h - 20);
  }
  g.fillStyle = fg;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  let fs = size;
  g.font = `900 ${fs}px Inter, "DejaVu Sans", sans-serif`;
  while (g.measureText(text).width > w - 50 && fs > 10) {
    fs -= 2;
    g.font = `900 ${fs}px Inter, "DejaVu Sans", sans-serif`;
  }
  g.fillText(text, w / 2, h / 2 + fs * 0.04);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  texCache.set(key, tex);
  return tex;
}

export function stripeTexture(a: string, b: string, n = 8) {
  const key = `stripe|${a}|${b}|${n}`;
  const c = texCache.get(key);
  if (c) return c;
  const cv = document.createElement('canvas');
  cv.width = 256;
  cv.height = 64;
  const g = cv.getContext('2d')!;
  for (let i = 0; i < n; i++) {
    g.fillStyle = i % 2 ? b : a;
    g.fillRect((i * 256) / n, 0, 256 / n + 1, 64);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, tex);
  return tex;
}

export const texMat = (tex: THREE.Texture) => {
  const key = `tex|${tex.uuid}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({map: tex, roughness: 0.9, flatShading: true});
    matCache.set(key, m);
  }
  return m;
};

/** wooden sign on a post, board faces +z */
export const Sign: React.FC<{text: string; p: V3; ry?: number; s?: number; bg?: string; fg?: string; postH?: number; w?: number}> = ({text, p, ry = 0, s = 1, bg, fg, postH = 0.9, w = 1.3}) => {
  const tex = useMemo(() => textTexture(text, {bg, fg, w: 512, h: 150}), [text, bg, fg]);
  const h = (w * 150) / 512;
  return (
    <group position={p} rotation={[0, ry, 0]} scale={s}>
      <P geo={G.box} color="#6b4423" p={[0, postH / 2, 0]} s={[0.09, postH, 0.09]} o={0.03} />
      <group position={[0, postH + h / 2 - 0.05, 0.06]}>
        <mesh geometry={G.box} material={texMat(tex)} scale={[w, h, 0.06]} castShadow />
        <mesh geometry={G.box} material={OUTLINE} scale={[w + 0.06, h + 0.06, 0.1]} />
      </group>
    </group>
  );
};

// deterministic PRNG
export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
