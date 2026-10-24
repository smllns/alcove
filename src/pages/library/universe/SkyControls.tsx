import {
  Circle,
  Maximize,
  Minus,
  Plus,
  RectangleVertical,
  Squircle,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Tooltip } from '@/shared/ui/Tooltip';
import { shapeNames, type SkyShape } from './shape';
import { cn } from '@/shared/lib/cn';
import { capsuleClass } from '@/shared/ui/surfaces';
import { softClass } from '@/shared/ui/buttonStyles';

const shapeIcons: Record<SkyShape, ReactNode> = {
  circle: <Circle size={15} />,
  rounded: <Squircle size={15} />,
  cover: <RectangleVertical size={15} />,
};

function Control({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip label={label} side='left'>
      <button
        type='button'
        onClick={onClick}
        aria-label={label}
        className={softClass(false, 'grid size-9 place-items-center')}
      >
        {children}
      </button>
    </Tooltip>
  );
}

// The shape of the stars, zooming without a trackpad, and a way back to
// the sky as it first opens
export function SkyControls({
  shape,
  onShape,
  onZoomIn,
  onZoomOut,
  onFit,
}: {
  shape: SkyShape;
  onShape: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}) {
  return (
    <div
      className={cn(
        'absolute bottom-5 right-5 z-2 flex flex-col sm:bottom-8 sm:right-8',
        capsuleClass,
      )}
    >
      <Control label={`Shape: ${shapeNames[shape]}`} onClick={onShape}>
        {shapeIcons[shape]}
      </Control>
      <Control label='Zoom in' onClick={onZoomIn}>
        <Plus size={16} />
      </Control>
      <Control label='Zoom out' onClick={onZoomOut}>
        <Minus size={16} />
      </Control>
      <Control label='Reset view' onClick={onFit}>
        <Maximize size={14} />
      </Control>
    </div>
  );
}
