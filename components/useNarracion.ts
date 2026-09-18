"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useNarracion(texto: string, vozActiva: boolean) {
  const [visible, setVisible] = useState("");
  const [terminado, setTerminado] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const saltar = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setVisible(texto);
    setTerminado(true);
  }, [texto]);

  useEffect(() => {
    setVisible("");
    setTerminado(false);

    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      setVisible(texto.slice(0, i));
      if (i >= texto.length) {
        if (timer.current) clearInterval(timer.current);
        setTerminado(true);
      }
    }, 28);

    if (vozActiva && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "es-CO";
      u.rate = 1.0;
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    }

    return () => {
      if (timer.current) clearInterval(timer.current);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, [texto, vozActiva]);

  return { visible, terminado, saltar };
}
