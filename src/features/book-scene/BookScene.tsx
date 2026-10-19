import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Scene, type SceneProps } from './Scene';

// Full-bleed canvas of floating books. Sits behind page content; only the
// books themselves take pointer events.
export function BookScene(props: SceneProps) {
  return (
    <div className='pointer-events-none absolute inset-0 z-0'>
      <Canvas
        shadows='variance'
        camera={{ position: [0, 0, 10], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        // Neutral keeps printed colours close to the real cover instead of ACES's punchy look
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NeutralToneMapping;
          gl.toneMappingExposure = 1.12;
        }}
        style={{ pointerEvents: 'auto' }}
      >
        <Scene {...props} />
      </Canvas>
    </div>
  );
}
