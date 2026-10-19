import type { Ref } from 'react';
import { RoundedBox } from '@react-three/drei';
import type * as THREE from 'three';
import { getGrainTexture } from './textures/grain';
import { PAPER } from './textures/canvas';
import { SPINE_FLATTEN, type BookDimensions } from './geometry';
import type { BookTextures } from './useBookTextures';

type BookModelProps = {
  size: BookDimensions;
  textures: BookTextures;
  color: string;
  // The front cover pivots on this group, at the spine
  coverRef?: Ref<THREE.Group>;
};

// A closed book: page block, spine, back and front covers. Origin is its centre.
export function BookModel({ size, textures, color, coverRef }: BookModelProps) {
  const {
    paperback,
    width: w,
    height: h,
    thickness: t,
    board,
    radius,
    pages,
  } = size;
  const pagesX = -w / 2 + pages.width / 2;

  // Printed card or jacket paper: roughness comes from the wear map, with a faint tooth
  const printed = {
    roughness: 1,
    roughnessMap: textures.surface,
    bumpMap: getGrainTexture(),
    bumpScale: 0.6,
    clearcoat: paperback ? 0.08 : 0.3,
    clearcoatRoughness: paperback ? 0.7 : 0.45,
  };
  // The cut edge of a paperback shows pale card; a jacket folds over in its own colour
  const edge = paperback ? '#ece3d0' : color;

  const boardMesh = paperback ? (
    <mesh position={[w / 2, 0, 0]} castShadow>
      <boxGeometry args={[w, h, board]} />
      <meshStandardMaterial color={edge} roughness={0.9} />
    </mesh>
  ) : (
    <RoundedBox
      args={[w, h, board]}
      radius={0.012}
      smoothness={3}
      position={[w / 2, 0, 0]}
      castShadow
    >
      <meshStandardMaterial color={edge} roughness={0.75} />
    </RoundedBox>
  );

  return (
    <>
      {/* Page block */}
      <mesh position={[pagesX, 0, 0]} castShadow>
        <boxGeometry args={[pages.width, pages.height, pages.thickness]} />
        <meshStandardMaterial
          attach='material-0'
          map={textures.foreEdge}
          roughness={1}
        />
        <meshStandardMaterial attach='material-1' color={PAPER} roughness={1} />
        <meshStandardMaterial
          attach='material-2'
          map={textures.topEdge}
          roughness={1}
        />
        <meshStandardMaterial
          attach='material-3'
          map={textures.bottomEdge}
          roughness={1}
        />
        <meshStandardMaterial attach='material-4' color={PAPER} roughness={1} />
        <meshStandardMaterial attach='material-5' color={PAPER} roughness={1} />
      </mesh>

      {/* Spine */}
      {paperback ? (
        <mesh position={[-w / 2 - 0.001, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[t, h]} />
          <meshPhysicalMaterial map={textures.spine} {...printed} />
        </mesh>
      ) : (
        <mesh
          position={[-w / 2, 0, 0]}
          scale={[SPINE_FLATTEN, 1, 1]}
          castShadow
        >
          <cylinderGeometry
            args={[radius, radius, h, 32, 1, false, Math.PI, Math.PI]}
          />
          <meshPhysicalMaterial
            attach='material-0'
            map={textures.spine}
            {...printed}
          />
          <meshStandardMaterial
            attach='material-1'
            color={edge}
            roughness={0.8}
          />
          <meshStandardMaterial
            attach='material-2'
            color={edge}
            roughness={0.8}
          />
        </mesh>
      )}

      {/* Back cover, printed side facing out */}
      <group position={[-w / 2, 0, -t / 2 + board / 2]}>
        {boardMesh}
        <mesh
          position={[w / 2, 0, -board / 2 - 0.001]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[w - 0.002, h - 0.002]} />
          <meshPhysicalMaterial map={textures.back} {...printed} />
        </mesh>
      </group>

      {/* Front cover, hinged at the spine */}
      <group ref={coverRef} position={[-w / 2, 0, t / 2 - board / 2]}>
        {boardMesh}
        <mesh position={[w / 2, 0, board / 2 + 0.001]}>
          <planeGeometry args={[w - 0.002, h - 0.002]} />
          <meshPhysicalMaterial map={textures.front} {...printed} />
        </mesh>

        {/* Inside of the cover */}
        <mesh
          position={[w / 2, 0, -board / 2 - 0.001]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[w - 0.01, h - 0.01]} />
          <meshStandardMaterial
            color={paperback ? '#f2ead9' : '#e6dbc4'}
            roughness={0.95}
          />
        </mesh>
      </group>
    </>
  );
}
