import React from 'react';
import {G, P, V3} from './parts';

export type Pose = {
  armL?: V3; // rotation of left arm (character's left = +x)
  armR?: V3;
  head?: V3;
  bob?: number;
  mouth?: number; // 0..1
  blink?: number; // 0 open .. 1 closed
  brow?: number; // + = raised/surprised, - = angry/sad
  lean?: number;
};

type Props = {
  p?: V3;
  ry?: number;
  scale?: number;
  shirt?: string;
  fur?: string;
  hat?: boolean;
  sash?: boolean;
  clipboard?: boolean;
  cap?: string | null;
  orange?: boolean;
  pose?: Pose;
  visible?: boolean;
};

const FUR = '#a8683a';
const FUR_DARK = '#7a4826';
const SNOUT = '#6e4127';

/** Low-poly capybara built from primitives (the mayor when hat+sash) */
export const Capy: React.FC<Props> = ({p = [0, 0, 0], ry = 0, scale = 1, shirt = '#2f8f9d', fur = FUR, hat = false, sash = false, clipboard = false, cap = null, orange = false, pose = {}, visible = true}) => {
  if (!visible || scale <= 0.001) return null;
  const {armL = [0, 0, 0.15], armR = [0, 0, -0.15], head = [0, 0, 0], bob = 0, mouth = 0, blink = 0, brow = 0, lean = 0} = pose;
  const eyeY = Math.max(0.08, 1 - blink);
  return (
    <group position={p} rotation={[0, ry, 0]} scale={scale}>
      <group position={[0, bob, 0]} rotation={[lean, 0, 0]}>
        {/* legs + feet */}
        {[-1, 1].map((sx) => (
          <group key={sx}>
            <P geo={G.cyl} color={FUR_DARK} p={[0.2 * sx, 0.2, 0]} s={[0.13, 0.4, 0.13]} o={0.04} />
            <P geo={G.ball} color="#4a2c17" p={[0.2 * sx, 0.06, 0.07]} s={[0.15, 0.08, 0.2]} o={0.04} />
          </group>
        ))}
        {/* torso (shirt) */}
        <P geo={G.ball} color={shirt} p={[0, 0.8, 0]} s={[0.52, 0.56, 0.44]} o={0.05} />
        {/* collar */}
        <P geo={G.cone4} color={shirt} p={[0.13, 1.2, 0.27]} r={[1.2, 0, -0.5]} s={[0.12, 0.16, 0.05]} o={0.03} />
        <P geo={G.cone4} color={shirt} p={[-0.13, 1.2, 0.27]} r={[1.2, 0, 0.5]} s={[0.12, 0.16, 0.05]} o={0.03} />
        {/* pocket + buttons */}
        <P geo={G.box} color="#25747f" p={[0.2, 0.92, 0.4]} r={[-0.25, 0.35, 0]} s={[0.15, 0.13, 0.03]} o={0} />
        {[0.98, 0.78, 0.58].map((y) => (
          <P key={y} geo={G.ball} color="#e8e2d0" p={[0, y, 0.44 - (0.98 - y) * 0.05]} s={0.028} o={0} />
        ))}
        {/* mayor sash */}
        {sash ? (
          <group position={[0, 0.82, 0.01]} rotation={[0, 0, 0.72]}>
            <mesh geometry={torusGeo} rotation={[Math.PI / 2, 0, 0]} scale={[0.98, 0.86, 1]} castShadow>
              <meshStandardMaterial color="#14a04c" flatShading roughness={0.8} />
            </mesh>
            <mesh geometry={torusGeo} rotation={[Math.PI / 2, 0, 0]} scale={[1.02, 0.9, 1.25]}>
              <meshBasicMaterial color="#1a1410" side={1} />
            </mesh>
          </group>
        ) : null}
        {sash ? <P geo={G.cyl} color="#ffcf2e" p={[0.26, 1.0, 0.39]} r={[1.35, 0, 0]} s={[0.075, 0.03, 0.075]} o={0.03} /> : null}
        {/* neck fur */}
        <P geo={G.ball} color={fur} p={[0, 1.18, 0.02]} s={[0.3, 0.2, 0.28]} o={0} />

        {/* arms */}
        <Arm side={1} rot={armL} shirt={shirt} fur={fur} clipboard={clipboard} />
        <Arm side={-1} rot={armR} shirt={shirt} fur={fur} />

        {/* head */}
        <group position={[0, 1.2, 0.02]} rotation={head}>
          <P geo={G.ball} color={fur} p={[0, 0.3, 0]} s={[0.44, 0.39, 0.46]} o={0.05} />
          {/* cheeks */}
          <P geo={G.ball} color={fur} p={[0, 0.2, 0.25]} s={[0.36, 0.25, 0.3]} o={0} />
          {/* snout */}
          <P geo={G.ball} color={SNOUT} p={[0, 0.2, 0.47]} s={[0.27, 0.2, 0.24]} o={0.045} />
          {/* nostrils */}
          <P geo={G.ball} color="#1d120a" p={[0.085, 0.29, 0.67]} s={[0.045, 0.03, 0.03]} o={0} shadow={false} />
          <P geo={G.ball} color="#1d120a" p={[-0.085, 0.29, 0.67]} s={[0.045, 0.03, 0.03]} o={0} shadow={false} />
          {/* mouth */}
          <P geo={G.ball} color="#3a0d0d" p={[0, 0.07, 0.6]} s={[0.11, 0.015 + 0.08 * mouth, 0.06]} o={0} shadow={false} />
          {/* smile line */}
          <P geo={G.box} color="#3b2414" p={[0, 0.085, 0.63]} r={[0, 0, 0]} s={[0.17, 0.018, 0.02]} o={0} shadow={false} visible={mouth < 0.25} />
          {/* eyes */}
          {[-1, 1].map((sx) => (
            <group key={sx} position={[0.19 * sx, 0.43, 0.37]} rotation={[0, 0.3 * sx, 0]} scale={[1, eyeY, 1]}>
              <P geo={G.ballHi} color="#ffffff" p={[0, 0, 0]} s={[0.1, 0.115, 0.075]} o={0.035} shadow={false} />
              <P geo={G.ballHi} color="#1a1008" p={[-0.005 * sx, -0.01, 0.05]} s={[0.062, 0.075, 0.04]} o={0} shadow={false} />
              <P geo={G.ball} color="#ffffff" p={[0.02, 0.025, 0.088]} s={0.02} o={0} shadow={false} />
            </group>
          ))}
          {/* brows */}
          {[-1, 1].map((sx) => (
            <P key={sx} geo={G.box} color="#3b2414" p={[0.19 * sx, 0.585 + brow * 0.05, 0.38]} r={[0, 0, sx * (0.18 + brow * 0.35)]} s={[0.17, 0.04, 0.05]} o={0} shadow={false} />
          ))}
          {/* ears */}
          {[-1, 1].map((sx) => (
            <P key={sx} geo={G.ball} color={FUR_DARK} p={[0.33 * sx, 0.62, -0.1]} s={[0.09, 0.08, 0.05]} o={0.03} />
          ))}
          {/* hard hat */}
          {hat ? (
            <group position={[0, 0.6, -0.03]}>
              <P geo={G.dome} color="#f2862a" p={[0, 0.02, 0]} s={[0.45, 0.36, 0.47]} o={0.04} />
              <P geo={G.cyl12} color="#e3741b" p={[0, 0.02, 0.06]} s={[0.5, 0.045, 0.54]} o={0.03} />
              <P geo={G.box} color="#f9a24e" p={[0, 0.34, 0]} s={[0.08, 0.09, 0.66]} o={0} />
              {/* house logo */}
              <group position={[0, 0.17, 0.43]} rotation={[-0.5, 0, 0]}>
                <P geo={G.box} color="#ffffff" p={[0, 0, 0]} s={[0.12, 0.08, 0.03]} o={0} shadow={false} />
                <P geo={G.cone4} color="#ffffff" p={[0, 0.07, 0]} r={[0, Math.PI / 4, 0]} s={[0.11, 0.07, 0.03]} o={0} shadow={false} />
              </group>
            </group>
          ) : null}
          {cap ? (
            <group position={[0, 0.5, -0.01]}>
              <P geo={G.dome} color={cap} s={[0.42, 0.25, 0.44]} o={0.04} />
              <P geo={G.box} color={cap} p={[0, 0.01, 0.42]} s={[0.36, 0.03, 0.26]} o={0.03} />
            </group>
          ) : null}
          {orange ? (
            <group position={[0, 0.72, 0]}>
              <P geo={G.ball} color="#ff9d1a" s={0.17} o={0.03} />
              <P geo={G.ball} color="#3fae3f" p={[0.05, 0.17, 0]} s={[0.07, 0.03, 0.04]} o={0} />
            </group>
          ) : null}
        </group>
      </group>
    </group>
  );
};

import * as THREE from 'three';
const torusGeo = new THREE.TorusGeometry(0.55, 0.065, 5, 18);

const Arm: React.FC<{side: number; rot: V3; shirt: string; fur: string; clipboard?: boolean}> = ({side, rot, shirt, fur, clipboard}) => (
  <group position={[0.5 * side, 1.05, 0]} rotation={rot}>
    <P geo={G.cyl} color={shirt} p={[0, -0.12, 0]} s={[0.12, 0.28, 0.12]} o={0.04} />
    <P geo={G.cyl} color={fur} p={[0, -0.36, 0]} s={[0.095, 0.28, 0.095]} o={0.04} />
    <P geo={G.ball} color={fur} p={[0, -0.54, 0]} s={0.11} o={0.035} />
    {clipboard ? (
      <group position={[-0.06 * side, -0.52, 0.2]} rotation={[0.25, 0, 0]}>
        <P geo={G.box} color="#3a7bd5" s={[0.34, 0.44, 0.035]} o={0.03} />
        <P geo={G.box} color="#e9f1ff" p={[0, -0.02, 0.022]} s={[0.27, 0.34, 0.01]} o={0} />
        <P geo={G.box} color="#9aa6b2" p={[0, 0.22, 0.03]} s={[0.12, 0.05, 0.03]} o={0} />
      </group>
    ) : null}
  </group>
);
