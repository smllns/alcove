import { useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';
import { Modal } from './Modal';
import { solidRaisedClass } from './surfaces';

// A panel slid in over the page from its right edge (from the bottom, the
// whole width, on a phone), for something to look through without leaving
// the page under it: it closes on its cross, Escape, or a click beside it
export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  // Opened on its title, not its cross, so nothing's ringed as it comes in
  const heading = useRef<HTMLHeadingElement>(null);
  return (
    <Modal
      open={open}
      onClose={onClose}
      focus={heading}
      motion='slide'
      className={`fixed inset-x-0 bottom-0 top-10 overflow-hidden rounded-t-[22px] sm:inset-y-3 sm:left-auto sm:right-3 sm:w-[26rem] sm:rounded-[22px] ${solidRaisedClass}`}
    >
      <div className='flex h-full flex-col'>
        <div
          data-grab
          className='flex touch-none items-center justify-between border-b border-line/70 py-3 pl-6 pr-4 sm:touch-auto'
        >
          <h2
            ref={heading}
            tabIndex={-1}
            className='font-serif text-2xl tracking-[-0.01em] outline-none'
          >
            {title}
          </h2>
          <IconButton aria-label='Close' onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>
        <div className='flex-1 overflow-y-auto overscroll-contain'>
          {children}
        </div>
      </div>
    </Modal>
  );
}
