import React from 'react';
import {G, P, mat} from './parts';
import {Capy} from './Capy';
import {Mansion, Shack, NameTag} from './World';
import {pop, clamp} from '../timeline';
import PEOPLE from '../people.json';

/** ep19 insert: "cada seguidor vira uma casa" — shacks for who only commented, mansions for who followed+liked+reposted.
 * Set lives far west of the city at BX. u = time inside the insert. */
export const BX = -330;
export const MZ = -40; // mansion street centre
const CAS: string[] = (PEOPLE as any).casinhas_ep19;
const MAN: string[] = (PEOPLE as any).mansoes_ep19;

export const Bairro: React.FC<{u: number; tm: number}> = ({u, tm}) => (
  <group position={[BX, 0, 0]}>
    {/* dirt lane + shacks */}
    <mesh geometry={G.box} material={mat('#c9a876')} position={[0, 0.04, 0]} scale={[16, 0.04, 24]} receiveShadow />
    <mesh geometry={G.box} material={mat('#a88a5c')} position={[0, 0.07, 0]} scale={[2.4, 0.04, 24]} receiveShadow />
    {CAS.map((name, i) => {
      const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
      const z = 1.5 - row * 4.2;
      const k = pop(u, 0.15 + i * 0.12, 0.4);
      const wob = Math.sin(u * 7 + i) * 0.05 + (i === 0 ? clamp((u - 6.3) / 0.35) * 0.32 : 0);
      return (
        <group key={name}>
          <group position={[side * 2.7, 0.06, z]} rotation={[0, side > 0 ? -Math.PI / 2 + 0.5 : Math.PI / 2 - 0.5, wob]} scale={1.9}>
            <Shack k={k} i={i} />
          </group>
          {k > 0 ? (
            <group position={[side * 0.9, 0.08, z + 1.2]} rotation={[0, side > 0 ? -0.9 : 0.9, 0]}>
              <Capy scale={0.55 * k} shirt="#8d8478" cap={null} pose={{armL: [0, 0, 0.1], armR: [0, 0, -0.1], mouth: 0.1, brow: -0.5, head: [0.25, 0, 0], blink: 0}} />
              <group scale={1.15}><NameTag name={name} k={k * 0.85} /></group>
            </group>
          ) : null}
        </group>
      );
    })}
    {/* mansion avenue */}
    <mesh geometry={G.box} material={mat('#9fd86a')} position={[0, 0.04, MZ]} scale={[34, 0.04, 34]} receiveShadow />
    <mesh geometry={G.box} material={mat('#4a4f57')} position={[0, 0.07, MZ]} scale={[4, 0.04, 34]} receiveShadow />
    {[-1, 1].flatMap((sd) => [0, 1, 2, 3, 4, 5].map((j) => <P key={sd + '_' + j} geo={G.box} color="#ffd21e" p={[sd * 2.3, 0.1, MZ + 14 - j * 6]} s={[0.25, 0.08, 3]} o={0} />))}
    {MAN.map((name, i) => {
      const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
      const z = MZ + 6 - row * 12;
      const k = pop(tm, [7.7, 8.33, 8.85, 10.15][i], 0.45);
      return (
        <group key={name}>
          <group position={[side * 6.6, 0.06, z]} rotation={[0, side > 0 ? -Math.PI / 2 + 0.6 : Math.PI / 2 - 0.6, 0]} scale={1.05}>
            <Mansion k={k} />
          </group>
          {k > 0 ? (
            <group position={[side * 1.5, 0.08 + Math.max(0, Math.sin(u * 8 + i)) * 0.25, z + 1.5]} rotation={[0, side > 0 ? -0.9 : 0.9, 0]}>
              <Capy scale={0.75 * k} shirt={['#ffd21e', '#2fb5ff', '#ff7aa8', '#5ec26a'][i % 4]} cap="#ffd21e" sash pose={{armL: [0, 0, 0.4 + Math.max(0, Math.sin(u * 8 + i)) * 2], armR: [0, 0, -0.4 - Math.max(0, Math.sin(u * 8 + i + 1)) * 2], mouth: 0.9, brow: 0.5, blink: 0}} />
              <group scale={1.5}><NameTag name={name} k={k} /></group>
            </group>
          ) : null}
        </group>
      );
    })}
    {/* gold sparkles */}
    {tm > 7.6 ? Array.from({length: 24}).map((_, i) => {
      const ph = (u * 0.6 + i / 24) % 1;
      return <mesh key={i} geometry={G.ballLo} material={mat('#ffe066', {basic: true})} position={[((i * 37) % 22) - 11, 1 + ph * 9, MZ + 10 - ((i * 13) % 26)]} scale={0.18 * clamp(1 - ph)} />;
    }) : null}
  </group>
);
