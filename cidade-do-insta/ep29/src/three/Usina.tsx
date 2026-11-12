import React, {useMemo} from 'react';
import * as THREE from 'three';
import {G, P, mat, rng, textTexture, texMat, V3} from './parts';
import {Capy} from './Capy';
import {NameTag} from './World';
import {pop, ramp, clamp, easeOut, easeIn, U, LOOP_AT, TOTAL_SEC, NIGHT} from '../timeline';
import PEOPLE from '../people.json';

export const USINA: [number, number] = [60, 0]; // block (2,0)

/** piece that is lowered from the sky, lands with a bounce and a dust puff */
const Drop: React.FC<{t: number; t0: number; h?: number; dur?: number; p?: V3; children: React.ReactNode}> = ({t, t0, h = 14, dur = 0.42, p = [0, 0, 0], children}) => {
  if (t < t0) return null;
  const k = clamp((t - t0) / dur);
  const y = (1 - easeIn(k)) * h;
  const land = t - (t0 + dur);
  const squash = land > 0 && land < 0.25 ? 1 - 0.12 * Math.sin((land / 0.25) * Math.PI) : 1;
  return (
    <group position={p}>
      <group position={[0, y, 0]} scale={[1 + (1 - squash) * 0.6, squash, 1 + (1 - squash) * 0.6]}>{children}</group>
      {land > 0 && land < 0.7 ? <Dust k={land / 0.7} /> : null}
    </group>
  );
};
const Dust: React.FC<{k: number}> = ({k}) => (
  <>
    {Array.from({length: 12}).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const r = 1.5 + easeOut(k) * 3.5;
      return <mesh key={i} geometry={G.ballLo} material={mat('#d8c9a8', {basic: true})} position={[Math.cos(a) * r, 0.3 + k * 0.8, Math.sin(a) * r]} scale={0.55 * (1 - k)} />;
    })}
  </>
);

/** hyperboloid cooling tower */
const towerGeo = (() => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 10; i++) {
    const y = i / 10;
    const r = 1 - 0.38 * Math.sin(y * Math.PI * 0.85);
    pts.push(new THREE.Vector2(r, y));
  }
  return new THREE.LatheGeometry(pts, 16);
})();
const OUT = new THREE.MeshBasicMaterial({color: '#1a1410', side: THREE.BackSide});

const Steam: React.FC<{tt: number; on: number; p: V3}> = ({tt, on, p}) => {
  if (on <= 0) return null;
  return (
    <group position={p}>
      {Array.from({length: 7}).map((_, i) => {
        const ph = (tt * 0.35 + i / 7) % 1;
        return <mesh key={i} geometry={G.ballLo} material={mat('#f1f4f8', {basic: true})} position={[Math.sin(i * 2.1 + tt) * 0.6 + ph * 2.5, ph * 7, Math.cos(i * 1.7) * 0.5]} scale={(1.2 + ph * 2.2) * on * (1 - ph * 0.6)} />;
      })}
    </group>
  );
};

const WindTurbine: React.FC<{tt: number; spin: number}> = ({tt, spin}) => (
  <group>
    <P geo={G.cyl} color="#f4f6fb" p={[0, 5.5, 0]} s={[0.28, 11, 0.28]} o={0.03} />
    <P geo={G.box} color="#f4f6fb" p={[0, 11.1, 0.2]} s={[0.7, 0.7, 1.4]} o={0.03} />
    <group position={[0, 11.1, 1.0]} rotation={[0, 0, tt * 2.6 * spin]}>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
          <P geo={G.box} color="#ffffff" p={[0, 2.0, 0]} s={[0.35, 4.0, 0.08]} o={0.03} />
        </group>
      ))}
      <P geo={G.ball} color="#e2483d" s={0.32} o={0.02} />
    </group>
  </group>
);

// ---------- LEGO bricks ----------
type Brick = {x: number; y: number; z: number; w: number; ry: number; c: string; t0: number};
const BH = 0.55, BD = 0.5;
function boxShell(cx: number, cz: number, w: number, d: number, h: number, colors: string[], t0: number, dur: number, y0 = 0.4): Brick[] {
  const out: Brick[] = [];
  const layers = Math.round(h / BH);
  for (let L = 0; L < layers; L++) {
    const off = L % 2 ? 0.8 : 0;
    const sides: [number, number, number, number, number][] = [ // x0,z0, dx,dz along, length
      [cx - w / 2, cz + d / 2, 1, 0, w], [cx + w / 2, cz + d / 2, 0, -1, d], [cx + w / 2, cz - d / 2, -1, 0, w], [cx - w / 2, cz - d / 2, 0, 1, d],
    ];
    for (const [x0, z0, dx, dz, len] of sides) {
      let p = -off;
      while (p < len - 0.05) {
        const a = Math.max(0, p), b2 = Math.min(len, p + 1.6);
        const m = (a + b2) / 2;
        out.push({x: x0 + dx * m, y: y0 + BH / 2 + L * BH, z: z0 + dz * m, w: b2 - a - 0.04, ry: Math.atan2(dz, dx) * -1, c: colors[(L + Math.floor(m)) % colors.length], t0: 0});
        p += 1.6;
      }
    }
  }
  out.forEach((b, i) => (b.t0 = t0 + (i / out.length) * dur));
  return out;
}
function cylShell(cx: number, cz: number, rAt: (y: number) => number, h: number, colorAt: (L: number, n: number) => string, t0: number, dur: number, y0 = 0.4): Brick[] {
  const out: Brick[] = [];
  const layers = Math.round(h / BH);
  for (let L = 0; L < layers; L++) {
    const r = rAt((L + 0.5) / layers);
    const n = Math.max(6, Math.ceil((2 * Math.PI * r) / 1.25));
    for (let k = 0; k < n; k++) {
      const a = ((k + (L % 2) * 0.5) / n) * Math.PI * 2;
      const chord = 2 * r * Math.sin(Math.PI / n);
      out.push({x: cx + Math.cos(a) * r, y: y0 + BH / 2 + L * BH, z: cz + Math.sin(a) * r, w: chord + 0.06, ry: -a + Math.PI / 2, c: colorAt(L, layers), t0: 0});
    }
  }
  out.forEach((b, i) => (b.t0 = t0 + (i / out.length) * dur));
  return out;
}
const BRICKS: Brick[] = [
  ...boxShell(-4.2, -3, 9, 6.5, 4.4, ['#f4f6fb', '#e3e9f2'], U.HALL, 0.85),
  ...cylShell(4.8, -5.2, (y) => 2.9 * (1 - 0.38 * Math.sin(y * Math.PI * 0.85)), 7.7, (L, n) => (L >= n - 2 ? '#e2483d' : L % 2 ? '#dfe3e8' : '#eef1f4'), U.TORRES, 0.8),
  ...cylShell(4.8, 1.8, (y) => 2.9 * (1 - 0.38 * Math.sin(y * Math.PI * 0.85)), 7.7, (L, n) => (L >= n - 2 ? '#e2483d' : L % 2 ? '#dfe3e8' : '#eef1f4'), U.TORRES + 0.1, 0.8),
  ...cylShell(-8.6, -8, (y) => 0.95 - 0.2 * y, 12.6, (L) => (Math.floor(L / 3) % 2 ? '#ffffff' : '#e2483d'), U.CHAMINE, 0.75),
];
const SNAP = 0.12;
const Bricks: React.FC<{t: number; list?: Brick[]}> = ({t, list = BRICKS}) => {
  const m = useMemo(() => {
    const body = new THREE.InstancedMesh(new THREE.BoxGeometry(1, BH * 0.96, BD), new THREE.MeshStandardMaterial({flatShading: true, roughness: 0.55}), list.length);
    const studs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.17, 0.17, 0.14, 10), new THREE.MeshStandardMaterial({flatShading: true, roughness: 0.55}), list.length * 2);
    list.forEach((b, i) => {
      const c = new THREE.Color(b.c);
      body.setColorAt(i, c);
      studs.setColorAt(i * 2, c); studs.setColorAt(i * 2 + 1, c);
    });
    body.castShadow = true; body.receiveShadow = true;
    body.frustumCulled = false; studs.frustumCulled = false;
    return {body, studs};
  }, []);
  const q = new THREE.Quaternion(), e = new THREE.Euler(), M = new THREE.Matrix4(), P3 = new THREE.Vector3(), S3 = new THREE.Vector3();
  list.forEach((b, i) => {
    const k = clamp((t - b.t0) / SNAP);
    const vis = k > 0 ? 1 : 0.0001;
    const y = b.y + (1 - easeOut(k)) * 1.4;
    q.setFromEuler(e.set(0, b.ry, 0));
    M.compose(P3.set(b.x, y, b.z), q, S3.set(b.w * vis, vis, vis)); m.body.setMatrixAt(i, M);
    for (const sgn of [-1, 1]) {
      const lx = sgn * b.w * 0.25;
      M.compose(P3.set(b.x + Math.cos(b.ry) * lx, y + BH / 2 + 0.06, b.z - Math.sin(b.ry) * lx), q, S3.set(vis, vis, vis));
      m.studs.setMatrixAt(i * 2 + (sgn > 0 ? 1 : 0), M);
    }
  });
  m.body.instanceMatrix.needsUpdate = true; m.studs.instanceMatrix.needsUpdate = true;
  return (
    <>
      <primitive object={m.body} />
      <primitive object={m.studs} />
    </>
  );
};
/** stud grid on the baseplate, popping in from the centre */
const BasePlateStuds: React.FC<{t: number; t0?: number}> = ({t, t0 = U.FUND}) => {
  const list = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let x = -9.5; x <= 9.5; x += 1) for (let z = -9.5; z <= 8.5; z += 1) out.push([x, z, Math.hypot(x, z + 0.5)]);
    return out;
  }, []);
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 10), new THREE.MeshStandardMaterial({color: '#5cc160', flatShading: true}), list.length);
    m.frustumCulled = false; m.receiveShadow = true;
    return m;
  }, [list]);
  const M = new THREE.Matrix4(), P3 = new THREE.Vector3(), S3 = new THREE.Vector3(), q = new THREE.Quaternion();
  list.forEach(([x, z, d], i) => {
    const k = Math.max(0.0001, easeOut(clamp((t - t0 - 0.1 - d * 0.025) / 0.15)));
    M.compose(P3.set(x, 0.47, z), q, S3.set(k, k, k)); mesh.setMatrixAt(i, M);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

const POWER_CREW: string[] = (PEOPLE as any).power;

export const Usina: React.FC<{t: number; tt: number}> = ({t, tt}) => {
  const word = useMemo(() => texMat(textTexture('USINA DE ENERGIA', {bg: '#ffd21e', fg: '#14110c', border: '#14110c', w: 1024, h: 180, size: 104})), []);
  const lotSign = useMemo(() => texMat(textTexture('TERRENO DA USINA', {bg: '#ffffff', fg: '#14110c', border: '#14110c', w: 1024, h: 180, size: 100})), []);
  const [cx, cz] = USINA;
  const built = t >= U.FUND;
  const on = easeOut(ramp(t, U.LIGHT, U.LIGHT + 0.8)) * (t >= U.OFF ? 0 : 1);
  const craneOn = t >= U.FUND - 0.2 && t < U.CREW + 0.5;
  return (
    <group position={[cx, 0.06, cz]}>
      {/* empty dirt lot before the build */}
      <mesh geometry={G.box} material={mat('#b58b5a')} position={[0, 0.03, 0]} scale={[21, 0.05, 21]} receiveShadow />
      {!built ? (
        <group position={[0, 0, 9.5]}>
          {[-3.6, 3.6].map((x) => <P key={x} geo={G.box} color="#6b4423" p={[x, 1.0, 0]} s={[0.18, 2.0, 0.18]} o={0.02} />)}
          <mesh geometry={G.box} material={lotSign} position={[0, 2.0, 0.05]} scale={[7.6, 1.3, 0.1]} castShadow />
        </group>
      ) : null}
      {/* scorch mark where the bolt hit */}
      {t >= U.BOLT && t < U.FUND ? <mesh geometry={G.cyl12} material={mat('#3a2a1c')} position={[0, 0.07, 0]} scale={[3.2 * easeOut(ramp(t, U.BOLT, U.BOLT + 0.3)), 0.02, 3.2 * easeOut(ramp(t, U.BOLT, U.BOLT + 0.3))]} /> : null}

      {/* LEGO build: baseplate + bricks */}
      {t >= U.FUND ? (
        <group scale={[easeOut(ramp(t, U.FUND, U.FUND + 0.25)), 1, easeOut(ramp(t, U.FUND, U.FUND + 0.25))]}>
          <P geo={G.box} color="#4caf50" p={[0, 0.2, -0.5]} s={[20, 0.4, 19]} o={0.04} />
        </group>
      ) : null}
      <BasePlateStuds t={t} />
      <Bricks t={t} />
      {/* hall details snap on once the walls are up */}
      <Drop t={t} t0={U.HALL + 0.85} h={3} dur={0.18} p={[-4.2, 0.4, -3]}>
        <P geo={G.box} color="#e2483d" p={[0, 4.6, 0]} s={[9.6, 0.4, 7.0]} o={0.04} />
        {[-3, -1, 1, 3].map((x) => <P key={x} geo={G.box} color="#8fd3ff" p={[x, 2.4, 3.27]} s={[1.3, 2.2, 0.05]} o={0.02} />)}
        <mesh geometry={G.box} material={word} position={[0, 5.5, 2.2]} scale={[8.6, 1.5, 0.12]} castShadow />
      </Drop>
      <Steam tt={tt} on={easeOut(ramp(t, U.TORRES + 0.8, U.TORRES + 1.6))} p={[4.8, 8.3, -5.2]} />
      <Steam tt={tt + 1.3} on={easeOut(ramp(t, U.TORRES + 1.0, U.TORRES + 1.8))} p={[4.8, 8.3, 1.8]} />
      <Steam tt={tt + 0.6} on={easeOut(ramp(t, U.CHAMINE + 0.6, U.CHAMINE + 1.2)) * 0.5} p={[-8.6, 13.4, -8]} />
      {/* 4. wind turbines */}
      {[[-9.4, 8.6], [9.6, -9.6], [9.6, 8.8]].map(([x, z], i) => (
        <Drop key={i} t={t} t0={U.TURB + i * 0.15} h={20} p={[x, 0.4, z]}>
          <WindTurbine tt={tt} spin={ramp(t, U.TURB + 0.5, U.TURB + 1.2)} />
        </Drop>
      ))}
      {/* transformer yard */}
      <Drop t={t} t0={U.TURB + 0.4} h={12} p={[-4.5, 0.4, 5.2]}>
        {[-2.4, 0, 2.4].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <P geo={G.box} color="#7d8794" p={[0, 0.8, 0]} s={[1.6, 1.6, 1.4]} o={0.03} />
            {[-0.45, 0, 0.45].map((dx) => <P key={dx} geo={G.cyl} color="#c8a26a" p={[dx, 2.0, 0]} s={[0.12, 0.9, 0.12]} o={0.02} />)}
          </group>
        ))}
      </Drop>
      {/* 5. solar panels */}
      {Array.from({length: 8}).map((_, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        return (
          <Drop key={i} t={t} t0={U.PAINEIS + i * 0.07} h={8} dur={0.3} p={[2.2 + col * 2.0, 0.4, 6.6 + row * 2.2]}>
            <P geo={G.box} color="#9aa0a6" p={[0, 0.45, 0]} s={[0.1, 0.9, 0.1]} o={0} />
            <group position={[0, 0.95, 0]} rotation={[-0.55, 0, 0]}>
              <P geo={G.box} color="#1e3a8a" s={[1.8, 0.08, 1.6]} o={0.03} />
              <mesh geometry={G.box} material={mat('#5aa9ff', {basic: true})} position={[0, 0.05, 0]} scale={[1.6, 0.01, 0.04]} />
            </group>
          </Drop>
        );
      })}
      {/* construction crane */}
      {craneOn ? (
        <group position={[-9.6, 0.4, 2]} scale={easeOut(ramp(t, U.FUND - 0.2, U.FUND + 0.2)) * (1 - easeOut(ramp(t, U.CREW, U.CREW + 0.5)))}>
          <P geo={G.box} color="#ffd21e" p={[0, 8, 0]} s={[0.7, 16, 0.7]} o={0.03} />
          <group position={[0, 16.2, 0]} rotation={[0, 0.6 + Math.sin(tt * 0.9) * 0.6, 0]}>
            <P geo={G.box} color="#ffd21e" p={[5, 0, 0]} s={[13, 0.6, 0.6]} o={0.03} />
            <P geo={G.box} color="#3b3f46" p={[-2.6, -0.2, 0]} s={[1.6, 1.2, 1.2]} o={0.03} />
            <P geo={G.box} color="#3b3f46" p={[9, -4, 0]} s={[0.05, 8, 0.05]} o={0} />
            <P geo={G.box} color="#e2483d" p={[9, -8.2, 0]} s={[0.6, 0.5, 0.6]} o={0.02} />
          </group>
        </group>
      ) : null}
      {/* site floodlights */}
      {built && NIGHT ? <pointLight position={[0, 9, 9]} intensity={on > 0 ? 0 : 160} distance={40} color="#ffd9a0" /> : null}
      {/* the drawn workers, with hard hats */}
      {POWER_CREW.map((w, i) => {
        const kk = pop(t, U.CREW + i * 0.25, 0.4) * (t >= LOOP_AT ? 0 : 1);
        if (kk <= 0) return null;
        return (
          <group key={w} position={[-3 + i * 3, 0.45, 10.2 + (i === 1 ? 0.6 : 0)]}>
            <Capy scale={0.8 * kk} shirt={i === 0 ? '#ff8f1f' : '#ffd21e'} cap="#ffd21e"
              pose={{armL: [0, 0, 0.3 + Math.max(0, Math.sin(tt * 6 + i)) * 1.9], armR: [0, 0, -0.2], mouth: 0.35, brow: 0.3, blink: (Math.floor(tt * 30) + i * 17) % 100 < 4 ? 1 : 0, head: [0, 0, Math.sin(tt * 2 + i) * 0.08]}} />
            <NameTag name={w} k={kk} />
          </group>
        );
      })}
    </group>
  );
};

/** jagged lightning bolt from the sky into the plant lot */
export const Bolt: React.FC<{t: number}> = ({t}) => {
  const segs = useMemo(() => {
    const R = rng(13);
    const pts: THREE.Vector3[] = [];
    let x = 0, z = 0;
    for (let i = 0; i <= 14; i++) {
      pts.push(new THREE.Vector3(x, 70 - i * 5, z));
      x += (R() - 0.5) * 6; z += (R() - 0.5) * 4;
    }
    pts[pts.length - 1].set(0, 0, 0);
    return pts.slice(1).map((b, i) => {
      const a = pts[i];
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const len = a.distanceTo(b);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      return {mid, len, q};
    });
  }, []);
  const dt = t - U.BOLT;
  if (dt < 0 || dt > 0.35) return null;
  if (Math.floor(dt * 30) % 3 === 2) return null; // flicker
  return (
    <group position={[USINA[0], 0, USINA[1]]}>
      {segs.map((s, i) => (
        <group key={i} position={s.mid} quaternion={s.q}>
          <mesh geometry={G.box} material={mat('#fffbe0', {basic: true})} scale={[0.7, s.len, 0.7]} />
          <mesh geometry={G.box} material={mat('#8fd0ff', {basic: true})} scale={[1.6, s.len, 1.6]} />
        </group>
      ))}
      <pointLight position={[0, 6, 0]} intensity={900} distance={120} color="#cfe6ff" />
    </group>
  );
};

/** big lever next to the mayor */
export const Lever: React.FC<{t: number}> = ({t}) => {
  const k = pop(t, U.LEVER - 0.6, 0.4);
  if (k <= 0 || t >= LOOP_AT || t >= U.OFF) return null;
  const pull = easeOut(ramp(t, U.LIGHT - 0.25, U.LIGHT));
  return (
    <group position={[1.15, 0.1, 0.9]} scale={k}>
      <P geo={G.box} color="#3b3f46" p={[0, 0.55, 0]} s={[0.6, 1.1, 0.5]} o={0.04} />
      <P geo={G.box} color="#ffd21e" p={[0, 0.75, 0.26]} s={[0.4, 0.25, 0.02]} o={0} />
      <group position={[0, 1.1, 0]} rotation={[0, 0, 0.7 - pull * 1.4]}>
        <P geo={G.cyl} color="#9aa0a6" p={[0, 0.35, 0]} s={[0.05, 0.7, 0.05]} o={0.02} />
        <P geo={G.ball} color="#e2483d" p={[0, 0.72, 0]} s={0.13} o={0.02} />
      </group>
    </group>
  );
};

export const litAt = (t: number) => (t >= U.OFF || t < U.LIGHT ? 0 : 1);

export {Bricks, BasePlateStuds, boxShell, cylShell, Drop, Dust};
export type {Brick};
