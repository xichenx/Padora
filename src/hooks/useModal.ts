import { useCallback, useRef, useState } from "react";
import type { ModalState } from "../types";

export function useModal() {
  const [modal, setModal] = useState<ModalState | null>(null);
  const modalResolveRef = useRef<
    ((v: string | boolean | null) => void) | null
  >(null);
  const modalInputRef = useRef<HTMLInputElement>(null);

  const promptText = useCallback(
    (message: string, value = ""): Promise<string | null> =>
      new Promise((resolve) => {
        modalResolveRef.current = resolve as (v: string | boolean | null) => void;
        setModal({ kind: "prompt", message, value });
      }),
    [],
  );

  const confirmBox = useCallback(
    (message: string, danger = false): Promise<boolean> =>
      new Promise((resolve) => {
        modalResolveRef.current = resolve as (v: string | boolean | null) => void;
        setModal({ kind: "confirm", message, value: "", danger });
      }),
    [],
  );

  const closeModal = useCallback((result: string | boolean | null) => {
    const resolve = modalResolveRef.current;
    modalResolveRef.current = null;
    setModal(null);
    resolve?.(result);
  }, []);

  return {
    modal,
    modalInputRef,
    promptText,
    confirmBox,
    closeModal,
    setModal,
  };
}
