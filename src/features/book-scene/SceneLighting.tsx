import { Environment, Lightformer } from '@react-three/drei';
import type { Theme } from '@/shared/theme';
import { LIGHTING, WALL_DEPTH } from './lighting';

// Soft studio reflections, one key light that casts shadows, and an invisible
// wall behind the books to catch them
export function SceneLighting({ theme }: { theme: Theme }) {
  const lighting = LIGHTING[theme];

  return (
    <>
      <Environment resolution={256} environmentIntensity={lighting.env}>
        <Lightformer
          form='rect'
          intensity={2.2}
          color='#fff1dc'
          position={[-5, 5, 6]}
          scale={[10, 6, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form='rect'
          intensity={1.2}
          color='#ffffff'
          position={[6, 1, 5]}
          scale={[3, 9, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form='ring'
          intensity={0.6}
          color='#ffe2b8'
          position={[0, -5, 4]}
          scale={5}
          target={[0, 0, 0]}
        />
      </Environment>

      <ambientLight intensity={lighting.ambient} />
      <directionalLight
        position={[3, 5, 9]}
        intensity={lighting.key}
        color={lighting.keyColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={14}
        shadow-blurSamples={20}
        shadow-bias={-0.0004}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />

      <mesh position={[0, 0, WALL_DEPTH]} receiveShadow>
        <planeGeometry args={[60, 40]} />
        <shadowMaterial
          transparent
          opacity={lighting.shadowOpacity}
          color={lighting.shadow}
        />
      </mesh>
    </>
  );
}
