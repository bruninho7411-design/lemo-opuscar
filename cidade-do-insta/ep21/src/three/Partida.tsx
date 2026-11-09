import React from 'react';
import {Capy} from './Capy';
import {NameTag} from './World';
import {G, P, V3} from './parts';
import {clamp, easeOut, LOOP_AT} from '../timeline';
import {M, SC, PITCH_Y, ballAt} from './match';
import PEOPLE from '../people.json';

const SEL: string[] = (PEOPLE as any).selecao; // gk, zag, zag, meia, ponta, ata, ata
const CAP: string = (PEOPLE as any).capitao;
// formation: cidade defends +x, attacks -x
const CID_F: [number, number][] = [[6.6, 0], [4.0, 1.8], [4.0, -1.8], [1.4, 0], [-1.0, 2.8], [-3.0, 1.2], [-3.0, -1.2]];
const SAN_F: [number, number][] = CID_F.map(([x, z]) => [-x, -z]);
const lineX = (i: number) => -4.5 + i * 1.5;

const Ball: React.FC<{p: V3; spin: number}> = ({p, spin}) => (
  <group position={p} rotation={[spin, spin * 0.7, 0]}>
    <P geo={G.ball} color="#ffffff" s={0.3} o={0.03} />
    {[[0.29, 0, 0], [-0.2, 0.2, 0], [0, -0.2, 0.2], [0, 0.1, -0.28]].map((q, i) => <mesh key={i} geometry={G.ballLo} position={q as V3} scale={0.09}><meshStandardMaterial color="#14110c" flatShading /></mesh>)}
  </group>
);

export const Partida: React.FC<{tt: number}> = ({tt}) => {
  const t = tt >= LOOP_AT ? 0 : tt;
  const b = ballAt(t);
  const bx = b[0] - SC[0], bz = b[2] - SC[1];
  const form = easeOut(clamp((t - M.KICK) / 0.7)) * (t < M.RESET ? 1 : 0);
  const party = t >= M.PARTY && t < M.RESET;
  const carrier = (side: 'c' | 's') => (t >= M.KICK && t < M.G1 ? (side === 's' ? 5 : -1) : t >= 14.31 && t < M.G2 ? (side === 'c' ? 5 : -1) : t >= 16.91 && t < M.G3 ? (side === 'c' ? 6 : -1) : -1);
  const players = (side: 'c' | 's') => (side === 'c' ? CID_F : SAN_F).map(([fx, fz], i) => {
    // lined up at kickoff, then formation drifting with the ball
    const lx = lineX(i), lz = side === 'c' ? 1.3 : -1.3;
    const drift = i === 0 ? 0 : bx * 0.35;
    let x = lx + (fx + drift - lx) * form, z = lz + (fz + bz * 0.15 - lz) * form;
    if (carrier(side) === i) { x = bx + (side === 'c' ? 0.5 : -0.5); z = bz + 0.2; }
    if (party && side === 'c') { const a = (i / 7) * Math.PI * 2; x = -4.5 + Math.cos(a) * 1.3; z = 1.5 + Math.sin(a) * 1.3; }
    const run = form > 0 && !party ? Math.abs(Math.sin(tt * 10 + i)) * 0.12 : 0;
    const hop = party && side === 'c' ? Math.max(0, Math.sin(tt * 9 + i)) * 0.4 : 0;
    const face = t < M.KICK ? (side === 'c' ? Math.PI : 0) : Math.atan2(bx - x, bz - z);
    return {x, z, y: run + hop, ry: face, i};
  });
  const dive = (tg: number) => clamp((t - (tg - 0.25)) / 0.3) * (t < tg + 1.2 ? 1 : 0);
  const mayorOn = tt >= M.MAYOR && tt < LOOP_AT;
  return (
    <group>
      {!mayorOn && players('c').map((p) => {
        const gk = p.i === 0;
        const d = gk ? dive(M.G1) : 0;
        return (
          <group key={'c' + p.i} position={[SC[0] + p.x, PITCH_Y + p.y + d * 0.5, SC[1] + p.z + d * 1.2]} rotation={[0, p.ry, d * 1.2]}>
            <Capy scale={0.72} shirt={gk ? '#2f6fd6' : '#ffd21e'} cap={gk ? '#2f6fd6' : '#2d9a5a'} sash={SEL[p.i] === CAP}
              pose={{armL: [0, 0, party ? 2.5 : 0.3 + d * 2], armR: [0, 0, party ? -2.5 : -0.3 - d * 2], mouth: party ? 0.9 : 0.3, brow: 0.3, blink: 0}} />
            {SEL[p.i] ? <group scale={0.72}><NameTag name={SEL[p.i]} k={1} /></group> : null}
          </group>
        );
      })}
      {!mayorOn && players('s').map((p) => {
        const gk = p.i === 0;
        if (gk && mayorOn) return null;
        const d = gk ? Math.max(dive(M.G2), dive(M.G3)) : 0;
        return (
          <group key={'s' + p.i} position={[SC[0] + p.x, PITCH_Y + p.y + d * 0.5, SC[1] + p.z - d * 1.2]} rotation={[0, p.ry, -d * 1.2]}>
            <Capy scale={0.72} fur="#8a5a32" shirt={gk ? '#14110c' : '#ffffff'} cap={gk ? '#14110c' : '#14110c'}
              pose={{armL: [0, 0, 0.3 + d * 2], armR: [0, 0, -0.3 - d * 2], mouth: 0.3, brow: party ? -0.4 : 0.1, blink: 0}} />
          </group>
        );
      })}
      {/* referee */}
      <group position={[SC[0] + bx * 0.5, PITCH_Y, SC[1] - 3.6]} rotation={[0, Math.atan2(bx * 0.5, 3.6), 0]}>
        <Capy scale={0.7} shirt="#14110c" cap={null} pose={{armR: [0, 0, t >= M.KICK && t < M.KICK + 0.6 ? -2.6 : -0.2], armL: [0, 0, 0.2], mouth: t >= M.KICK && t < M.KICK + 0.6 ? 0.8 : 0.2}} />
      </group>
      {/* the mayor as goalkeeper (ending gag) */}
      {mayorOn ? (
        <group position={[SC[0] - 6.8, PITCH_Y + clamp((tt - M.MG + 0.35) / 0.3) * 0.6, SC[1] - 1.4 * clamp((tt - M.MG + 0.35) / 0.3)]} rotation={[0, Math.PI / 2, -clamp((tt - M.MG + 0.35) / 0.3) * 1.2]}>
          <Capy scale={0.8} hat sash pose={{armL: [0, 0, 2.6], armR: [0, 0, -2.6], mouth: 0.8, brow: 0.5}} />
        </group>
      ) : null}
      <Ball p={b} spin={tt * 12} />
    </group>
  );
};
