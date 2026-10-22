import { useState, type RefObject } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { ShowcaseBook } from '@/entities/book/demo';
import { BookModel } from './BookModel';
import { bookDimensions } from './geometry';
import { entrancePose, restPose, useBookMotion } from './useBookMotion';
import { useBookTextures } from './useBookTextures';
import { useCoverImage } from './useCoverImage';
import { useHoverCursor } from './useHoverCursor';

type FloatingBookProps = {
  book: ShowcaseBook;
  position: [number, number, number];
  index: number;
  introStart: RefObject<number | null>;
  // Start in place instead of out of sight
  settled?: boolean;
};

// One book in the scene: spins in, levitates, lifts and peeks open on hover
export function FloatingBook({
  book,
  position,
  index,
  introStart,
  settled = false,
}: FloatingBookProps) {
  const [hovered, setHovered] = useState(false);
  useHoverCursor(hovered);

  const image = useCoverImage(book.cover);
  const size = bookDimensions(book, image);
  const textures = useBookTextures(book, image, size);
  const { body, cover } = useBookMotion({
    slot: book,
    index,
    hovered,
    introStart,
  });
  const pose = settled
    ? restPose(book)
    : entrancePose(book, index, position[2]);

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  };

  return (
    <group position={position}>
      <group
        ref={body}
        position={pose.position}
        rotation={pose.rotation}
        scale={pose.scale}
      >
        <BookModel
          size={size}
          textures={textures}
          color={book.color}
          coverRef={cover}
        />

        {/* Generous invisible hit area, so hover doesn't flicker at the edges */}
        <mesh onPointerOver={onOver} onPointerOut={() => setHovered(false)}>
          <boxGeometry
            args={[
              size.width * 1.15,
              size.height * 1.08,
              size.thickness + 0.15,
            ]}
          />
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
            colorWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}
