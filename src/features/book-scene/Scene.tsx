import { useRef } from 'react';
import { Sparkles } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ShowcaseBook } from '@/entities/book/demo';
import { prefersReducedMotion } from '@/shared/lib/motion';
import type { Theme } from '@/shared/theme';
import { FloatingBook } from './FloatingBook';
import { layoutBooks } from './layout';
import { LIGHTING } from './lighting';
import { SceneLighting } from './SceneLighting';

const damp = THREE.MathUtils.damp;

export type SceneProps = {
  books: ShowcaseBook[];
  // Flip to true to start the entrance
  started: boolean;
  // none: books are already hanging in place, e.g. when coming back to a page
  entrance?: 'slow' | 'none';
  theme: Theme;
};

export function Scene({
  books,
  started,
  theme,
  entrance = 'slow',
}: SceneProps) {
  const parallaxRef = useRef<THREE.Group>(null);
  const introStart = useRef<number | null>(null);
  const viewport = useThree((state) => state.viewport);
  const { placed, scale } = layoutBooks(books, viewport);
  const dust = LIGHTING[theme].dust;

  // The whole shelf leans gently toward the cursor
  useFrame((state, delta) => {
    if (started && introStart.current === null) {
      // Pretending the entrance ended long ago skips straight to levitating
      const head = entrance === 'none' ? 60 : 0;
      introStart.current = state.clock.elapsedTime - head;
    }

    const group = parallaxRef.current;
    if (!group || prefersReducedMotion) return;
    const dt = Math.min(delta, 1 / 20);
    group.rotation.y = damp(group.rotation.y, state.pointer.x * 0.14, 2.5, dt);
    group.rotation.x = damp(group.rotation.x, -state.pointer.y * 0.09, 2.5, dt);
    group.position.x = damp(group.position.x, state.pointer.x * 0.25, 2.5, dt);
  });

  return (
    <>
      <SceneLighting theme={theme} />

      <group ref={parallaxRef}>
        {placed.map(({ book, index, position }) => (
          <group key={book.title} scale={scale}>
            <FloatingBook
              book={book}
              position={position}
              index={index}
              introStart={introStart}
              settled={entrance === 'none'}
            />
          </group>
        ))}

        {/* Dust in the air */}
        {!prefersReducedMotion && (
          <Sparkles
            count={70}
            scale={[14, 8, 4]}
            size={dust.size}
            speed={dust.speed}
            noise={dust.noise}
            opacity={dust.opacity}
            color={dust.color}
          />
        )}
      </group>
    </>
  );
}
