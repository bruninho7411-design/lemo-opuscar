import React from 'react';
import {G, P, mat} from './parts';
import {Capy} from './Capy';
import {Mansion, Shack, MiniHouse, NameTag} from './World';
import {pop, clamp, BA} from '../timeline';
import PEOPLE from '../people.json';

/** follower neighbourhood far west of the city: shacks (only commented), mansions (follow+like+repost+print), new followers' houses */
export const BX = -330;
export const MZ = -40;
const CAS: string[] = [...(PEOPLE as any).casinhas_ep21, ...(PEOPLE as any).casinhas_ep19];
const MAN: string[] = [...(PEOPLE as any).mansoes_ep20, ...(PEOPLE as any).mansoes_ep19];
const NEWH: string[] = (PEOPLE as any).casas_ep20;
const HZ = 30;

export const Bairro: React.FC<{t: number; tt: number}> = ({t, tt}) => (
  <group position={[BX, 0, 0]}>
    <mesh geometry={G.box} material={mat('#c9a876')} position={[0, 0.04, 0]} scale={[16, 0.04, 24]} receiveShadow />
    <mesh geometry={G.box} material={mat('#a88a5c')} position={[0, 0.07, 0]} scale={[2.4, 0.04, 24]} receiveShadow />
    {CAS.map((name, i) => {
      const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
      const z = 1.5 - row * 4.2;
      return (
        <group key={name}>
          <group position={[side * 2.7, 0.06, z]} rotation={[0, side > 0 ? -Math.PI / 2 + 0.5 : Math.PI / 2 - 0.5, (i === 0 ? clamp((t - BA.SHACK - 0.7) / 0.35) * 0.32 : 0) + Math.sin(tt * 7 + i) * 0.04]} scale={1.9}><Shack k={i < 4 ? pop(t, BA.SHACK + i * 0.12, 0.4) : 1} i={i} /></group>
          {(i < 4 ? pop(t, BA.SHACK + i * 0.12, 0.4) : 1) > 0 ? <group position={[side * 0.9, 0.08, z + 1.2]} rotation={[0, side > 0 ? -0.9 : 0.9, 0]}>
            <Capy scale={0.55} shirt="#8d8478" cap={null} pose={{brow: -0.5, head: [0.25, 0, 0], blink: 0}} />
            <group scale={1.15}><NameTag name={name} k={0.85 * (i < 4 ? pop(t, BA.SHACK + i * 0.12, 0.4) : 1)} /></group>
          </group> : null}
        </group>
      );
    })}
    {/* mansion avenue: row 0 = this episode's winners */}
    <mesh geometry={G.box} material={mat('#9fd86a')} position={[0, 0.04, MZ]} scale={[34, 0.04, 40]} receiveShadow />
    <mesh geometry={G.box} material={mat('#4a4f57')} position={[0, 0.07, MZ]} scale={[4, 0.04, 40]} receiveShadow />
    {[-1, 1].flatMap((sd) => [0, 1, 2, 3, 4, 5].map((j) => <P key={sd + '_' + j} geo={G.box} color="#ffd21e" p={[sd * 2.3, 0.1, MZ + 16 - j * 6.5]} s={[0.25, 0.08, 3]} o={0} />))}
    {MAN.map((name, i) => {
      const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
      const z = MZ + 8 - row * 11;
      const k = i === 0 ? pop(t, BA.LARA, 0.5) : i === 1 ? pop(t, BA.LET, 0.5) : 1;
      const hop = Math.max(0, Math.sin(tt * 8 + i)) * (i < 2 ? 0.25 : 0.1);
      return (
        <group key={name}>
          <group position={[side * 6.6, 0.06, z]} rotation={[0, side > 0 ? -Math.PI / 2 + 0.6 : Math.PI / 2 - 0.6, 0]} scale={1.05}><Mansion k={k} /></group>
          {k > 0 ? (
            <group position={[side * 1.5, 0.08 + hop, z + 1.5]} rotation={[0, side > 0 ? -0.9 : 0.9, 0]}>
              <Capy scale={0.75 * k} shirt={['#ff7aa8', '#7a4fd0', '#ffd21e', '#2fb5ff', '#5ec26a', '#ff8f1f'][i % 6]} cap="#ffd21e" sash pose={{armL: [0, 0, 0.4 + hop * 7], armR: [0, 0, -0.4 - hop * 7], mouth: 0.9, brow: 0.5, blink: 0}} />
              <group scale={1.5}><NameTag name={name} k={k} /></group>
            </group>
          ) : null}
        </group>
      );
    })}
    {t > BA.LARA ? Array.from({length: 24}).map((_, i) => {
      const ph = (tt * 0.6 + i / 24) % 1;
      return <mesh key={i} geometry={G.ballLo} material={mat('#ffe066', {basic: true})} position={[((i * 37) % 22) - 11, 1 + ph * 9, MZ + 12 - ((i * 13) % 30)]} scale={0.18 * clamp(1 - ph)} />;
    }) : null}
    {/* new followers' street */}
    <mesh geometry={G.box} material={mat('#9fd86a')} position={[0, 0.04, HZ]} scale={[26, 0.04, 24]} receiveShadow />
    <mesh geometry={G.box} material={mat('#5b6068')} position={[0, 0.07, HZ]} scale={[3, 0.04, 24]} receiveShadow />
    {NEWH.map((name, i) => {
      const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
      const z = HZ + 9 - row * 4.4;
      const k = pop(t, BA.CASAS + i * 0.16, 0.4);
      return (
        <group key={name}>
          <group position={[side * 5, 0.06, z]} rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]} scale={1.9}><MiniHouse i={i + 3} k={k} /></group>
          {k > 0 ? <group position={[side * 2.4, 0.08, z]}><group scale={1.3}><NameTag name={name} k={k} /></group></group> : null}
        </group>
      );
    })}
  </group>
);
