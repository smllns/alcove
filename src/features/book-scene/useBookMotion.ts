import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SceneSlot } from '@/entities/book/demo';
import { prefersReducedMotion } from '@/shared/lib/motion';
import { WALL_DEPTH } from './lighting';

const damp = THREE.MathUtils.damp;

// The entrance: each book waits its turn, then drifts in slowly before
// picking up the snappier speed used for hover.
const INTRO_STAGGER = 1.8;
const INTRO_EASE_IN = 3.5;
const INTRO_SPEED = 1.3;
const SPEED = 4;
// How far back a book starts, and how far it keeps in front of the wall
const ENTRANCE_DEPTH = -4;
const WALL_CLEARANCE = 0.3;

type MotionOptions = {
  slot: SceneSlot;
  index: number;
  hovered: boolean;
  // Scene clock time the entrance began, or null while it's still waiting
  introStart: RefObject<number | null>;
};

// Drives a book's entrance, idle levitation and hover lift. Attach `body` to
// the book's group (starting at `entrancePose`) and `cover` to the front cover's hinge.
export function useBookMotion({
  slot,
  index,
  hovered,
  introStart,
}: MotionOptions) {
  const body = useRef<THREE.Group>(null);
  const cover = useRef<THREE.Group>(null);
  const [rx, ry, rz] = slot.rotation;

  useFrame((state, delta) => {
    const group = body.current;
    const hinge = cover.current;
    if (!group || !hinge) return;

    const dt = Math.min(delta, 1 / 20);
    const since =
      introStart.current === null
        ? -1
        : state.clock.elapsedTime -
          introStart.current -
          slot.delay * INTRO_STAGGER;
    const started =
      prefersReducedMotion || (introStart.current !== null && since > 0);
    const intro = prefersReducedMotion
      ? 1
      : THREE.MathUtils.smoothstep(since, 0, INTRO_EASE_IN);

    // Left alone, each book levitates on its own slow rhythm: its own phase
    // and a slightly different tempo, so no two move in step
    const tempo = 1 + (index % 3) * 0.18;
    const time = (state.clock.elapsedTime + index * 1.7) * tempo;
    const drift = prefersReducedMotion ? 0 : intro;
    const bob = Math.sin(time * 0.7) * 0.18 * drift;
    const sway = {
      x: Math.sin(time * 0.5) * 0.09 * drift,
      y: Math.sin(time * 0.38 + 1) * 0.13 * drift,
      z: Math.cos(time * 0.45) * 0.07 * drift,
    };

    // Where the book wants to be, relative to its resting spot
    const target = hovered
      ? {
          x: 0,
          y: 0.1,
          z: 0.6,
          rx: rx * 0.5,
          ry: ry * 0.6,
          rz: rz * 0.5,
          s: 1.06,
        }
      : {
          x: 0,
          y: bob,
          z: 0,
          rx: rx + sway.x,
          ry: ry + sway.y,
          rz: rz + sway.z,
          s: 1,
        };

    const speed = started ? THREE.MathUtils.lerp(INTRO_SPEED, SPEED, intro) : 0;
    group.position.x = damp(group.position.x, target.x, speed, dt);
    group.position.y = damp(group.position.y, target.y, speed, dt);
    group.position.z = damp(group.position.z, target.z, speed, dt);
    group.rotation.x = damp(group.rotation.x, target.rx, speed, dt);
    group.rotation.y = damp(group.rotation.y, target.ry, speed * 0.8, dt);
    group.rotation.z = damp(group.rotation.z, target.rz, speed, dt);
    group.scale.setScalar(
      damp(group.scale.x, started ? target.s : 0.001, speed * 1.25, dt),
    );

    // Hover teases the cover open
    hinge.rotation.y = damp(hinge.rotation.y, hovered ? -0.22 : 0, 6, dt);
  });

  return { body, cover };
}

// Where a book starts before its entrance: deep in the scene, tiny, mid-spin.
// Never behind the wall that catches the shadows, though (`depth`: how deep
// the book hangs): the wall would cover it, and a book flying in through
// another's shadow would sit dark in it, then flash into the light
export function entrancePose(slot: SceneSlot, index: number, depth: number) {
  const [rx, ry, rz] = slot.rotation;
  const spin = index % 2 === 0 ? 1 : -1;
  const z = Math.max(ENTRANCE_DEPTH, WALL_DEPTH + WALL_CLEARANCE - depth);
  return {
    position: [0, -0.6, z] as [number, number, number],
    rotation: [rx, ry + spin * Math.PI * 2, rz] as [number, number, number],
    scale: 0.001,
  };
}

// Where a book hangs once its entrance is over
export function restPose(slot: SceneSlot) {
  return {
    position: [0, 0, 0] as [number, number, number],
    rotation: slot.rotation,
    scale: 1,
  };
}
