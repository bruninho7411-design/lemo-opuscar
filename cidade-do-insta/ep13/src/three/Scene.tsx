import React from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {City} from './City';
import {camAt, shotAt, worldTime, clamp, ramp, LOOP_AT, U} from '../timeline';
import {litAt} from './Usina';
import mouthEnv from '../mouth.json';

const CameraRig: React.FC<{t: number; cam?: any}> = ({t, cam}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const scene = useThree((s) => s.scene);
  const c = cam ?? camAt(t);
  camera.position.set(...c.pos);
  camera.fov = c.fov;
  camera.near = 0.1;
  camera.far = 2400;
  camera.updateProjectionMatrix();
  camera.lookAt(new THREE.Vector3(...c.look));
  if (!scene.fog) {
    scene.fog = new THREE.Fog('#0e1a3a', 260, 1300);
    scene.background = new THREE.Color('#0e1a3a');
  }
  return null;
};

function mayorPose(t: number) {
  const s = shotAt(t);
  const f = Math.floor(t * 30);
  const env = mouthEnv as number[];
  const m = t < LOOP_AT && f < env.length ? Math.max(env[f] ?? 0, ((env[f - 1] ?? 0) + (env[f + 1] ?? 0)) / 2) : 0;
  const blink = (f + 40) % 103 < 4 || (f + 7) % 241 < 3 ? 1 : 0;
  const pose: any = {
    armL: [-0.55, 0.1, 0.12],
    armR: [0, 0, -0.15 - Math.sin(t * 2) * 0.03],
    head: [Math.sin(t * 2.3) * 0.03, Math.sin(t * 1.3) * 0.05, 0],
    bob: Math.sin(t * 4) * 0.012,
    mouth: clamp(m * 1.1),
    blink,
    brow: 0.1,
    clipboard: true,
  };
  const ALIAS: Record<string, string> = {bora: 'hello', prefeito: 'curte', bio: 'segue', g_site: 'segue', senao: 'senao'};
  switch (ALIAS[s.id] ?? s.id) {
    case 'aerial':
    case 'hello': {
      const k = clamp((t - s.start - 0.05) / 0.3);
      pose.armR = [-0.2 * k, 0, -0.15 - 2.45 * k + Math.sin(t * 11) * 0.35 * k];
      pose.brow = 0.35;
      pose.head = [0, 0, Math.sin(t * 5) * 0.06];
      break;
    }
    case 'gente':
      pose.head = [0.3, 0.2, 0.05];
      pose.brow = -0.35;
      pose.armL = [0, 0, 0.08];
      pose.armR = [0, 0, -0.08];
      pose.lean = 0.06;
      break;
    case 'voce': {
      const k = clamp((t - 8.2) / 0.3);
      pose.armR = [-1.5 * k, 0.1 * k, -0.15 + 0.05 * k];
      pose.brow = 0.1 + 0.3 * k;
      pose.head = [0, -0.05 * k, 0.05 * k];
      break;
    }
    case 'seguiu': {
      const k = clamp((t - 10.9) / 0.3);
      pose.clipboard = k < 0.5;
      pose.armL = [-0.55 * (1 - k), 0, 0.12 + (2.4 + Math.sin(t * 9) * 0.25) * k];
      pose.armR = [0, 0, -0.15 - (2.4 + Math.sin(t * 9 + 1) * 0.25) * k];
      pose.bob = Math.max(0, Math.sin(t * 9)) * 0.12 * k;
      pose.brow = 0.4;
      break;
    }
    case 'comentou':
      break;
    case 'curte':
      pose.clipboard = false;
      pose.armL = [0, 0, 2.3 + Math.sin(t * 8) * 0.3];
      pose.armR = [0, 0, -2.3 - Math.sin(t * 8 + 1) * 0.3];
      pose.bob = Math.max(0, Math.sin(t * 8)) * 0.14;
      pose.brow = 0.45;
      break;
    case 'votado':
      pose.armR = [-0.75, 0, -0.25];
      pose.head = [0.25, 0, 0];
      pose.brow = 0.2;
      break;
    case 'naoda':
      pose.head = [0.05, Math.sin(t * 20) * 0.38, 0];
      pose.brow = -0.3;
      pose.armL = [0, 0, 0.1];
      pose.armR = [0, 0, -0.1];
      pose.clipboard = false;
      break;
    case 'segue':
      pose.armR = [-1.35 + Math.sin(t * 9) * 0.35, 0, -0.25];
      pose.brow = 0.3;
      break;
    case 'alavanca': {
      const pull = clamp((t - (U.LIGHT - 0.3)) / 0.3);
      pose.clipboard = false;
      pose.armL = [-1.0 + 1.3 * pull, 0, 0.5 + 0.2 * pull];
      pose.head = [0.1, -0.35, 0];
      pose.brow = 0.35;
      if (t > U.LIGHT + 0.2) { pose.armL = [0, 0, 2.4 + Math.sin(t * 9) * 0.3]; pose.armR = [0, 0, -2.4 - Math.sin(t * 9) * 0.3]; pose.head = [0, 0, 0]; pose.mouth = 0.8; }
      break;
    }
    case 'senao':
      pose.brow = -0.45;
      pose.head = [0.08, -0.15, 0.18];
      pose.armR = [0, 0, -0.1];
      break;
  }
  return pose;
}

export const Scene: React.FC<{t: number; cam?: any}> = ({t, cam}) => {
  const s = shotAt(t);
  const c = cam ?? camAt(t);
  const target = React.useMemo(() => new THREE.Object3D(), []);
  const lk = c.look as [number, number, number];
  const far = Math.hypot(c.pos[0] - lk[0], c.pos[1] - lk[1], c.pos[2] - lk[2]);
  const ext = Math.min(140, Math.max(32, far * 0.55));
  const wt = worldTime(t);
  const lit = litAt(wt) > 0;
  const cheer = ['luz', 'prefeito'].includes(s.id) || (s.id === 'alavanca' && t > U.LIGHT) ? 1 : s.id === 'bio' ? 0.6 : 0;
  return (
    <>
      <CameraRig t={t} cam={cam} />
      <hemisphereLight args={[lit ? '#b9c6ff' : '#8ea6e6', lit ? '#4a3a22' : '#22301f', lit ? 1.15 : 0.5]} />
      <primitive object={target} position={lk} />
      <directionalLight
        target={target}
        position={[lk[0] + 22 * (ext / 32), 38 * (ext / 32), lk[2] + 26 * (ext / 32)]}
        intensity={lit ? 1.0 : 0.55}
        color="#b8c8ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-ext}
        shadow-camera-right={ext}
        shadow-camera-top={ext}
        shadow-camera-bottom={-ext}
        shadow-camera-near={1}
        shadow-camera-far={ext * 5}
        shadow-bias={-0.0006}
      />
      <City t={t} wt={wt} mayorPose={mayorPose(t)} cheer={cheer} />
    </>
  );
};
