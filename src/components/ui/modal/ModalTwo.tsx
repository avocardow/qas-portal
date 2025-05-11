import React, { useState, useEffect, useRef, ReactNode } from "react";
import Button from '@/components/ui/button/Button';

interface ModalTwoProps {
  trigger: ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

const ModalTwo: React.FC<ModalTwoProps> = ({ trigger, title, description, onConfirm, confirmLabel = 'Confirm', cancelLabel = 'Cancel', isLoading = false }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!modalRef.current || !triggerRef.current) return;
      if (!modalOpen || modalRef.current.contains(target) || triggerRef.current.contains(target)) return;
      setModalOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (!modalOpen || event.key !== 'Escape') return;
      setModalOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <div className="inline-block">
      <div ref={triggerRef} onClick={() => setModalOpen((prev) => !prev)}>
        {trigger}
      </div>
      <div
        className={`fixed inset-0 z-999999 flex items-center justify-center bg-black/90 px-4 py-5 ${
          modalOpen ? "block" : "hidden"
        }`}
      >
        <div
          ref={modalRef}
          className="w-full max-w-xl rounded-lg bg-white px-8 py-12 text-center dark:bg-boxdark md:px-16 md:py-15"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="mx-auto inline-block">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                opacity="0.1"
                width="60"
                height="60"
                rx="30"
                fill="#DC2626"
              />
              <path
                d="M30 27.2498V29.9998V27.2498ZM30 35.4999H30.0134H30ZM20.6914 41H39.3086C41.3778 41 42.6704 38.7078 41.6358 36.8749L32.3272 20.3747C31.2926 18.5418 28.7074 18.5418 27.6728 20.3747L18.3642 36.8749C17.3296 38.7078 18.6222 41 20.6914 41Z"
                stroke="#DC2626"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h3 className="mt-5.5 pb-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
            {title}
          </h3>
          <p className="mb-10 text-sm text-gray-500 whitespace-normal break-words mx-auto">
            {description}
          </p>
          <div className="-mx-3 flex flex-wrap gap-y-4">
            <div className="w-full px-3 2xsm:w-1/2">
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => setModalOpen(false)}
              >
                {cancelLabel}
              </Button>
            </div>
            <div className="w-full px-3 2xsm:w-1/2">
              <Button
                variant="danger"
                size="md"
                className="w-full"
                onClick={() => { onConfirm(); setModalOpen(false); }}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalTwo;
