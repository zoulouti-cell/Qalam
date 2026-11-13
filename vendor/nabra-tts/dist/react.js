import {
  NabraTTS
} from "./chunk-NUIVUSSH.js";
import "./chunk-X5KXFIX3.js";

// src/react.ts
import { useCallback, useEffect, useRef, useState } from "react";
function useNabraTTS(options = {}) {
  const [tts, setTts] = useState(null);
  const [status, setStatus] = useState("loading");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  useEffect(() => {
    let disposed = false;
    let instance = null;
    const files = {};
    setStatus("loading");
    NabraTTS.load({
      ...optionsRef.current,
      diacritize: optionsRef.current.diacritize && ((t) => optionsRef.current.diacritize(t)),
      onProgress: (p) => {
        files[p.file] = p;
        const all = Object.values(files);
        const total = all.reduce((n, f) => n + f.total, 0);
        if (total) setProgress(all.reduce((n, f) => n + f.loaded, 0) / total);
        optionsRef.current.onProgress?.(p);
      }
    }).then(
      (t) => {
        if (disposed) return void t.dispose();
        instance = t;
        setTts(t);
        setProgress(1);
        setStatus("ready");
      },
      (err) => {
        if (disposed) return;
        setError(err);
        setStatus("error");
      }
    );
    return () => {
      disposed = true;
      instance?.dispose();
    };
  }, []);
  const run = useCallback(
    async (fn) => {
      if (!tts) throw new Error("nabra-tts: model not loaded yet");
      setStatus("generating");
      try {
        return await fn(tts);
      } finally {
        setStatus("ready");
      }
    },
    [tts]
  );
  const generate = useCallback((text, o) => run((t) => t.generate(text, o)), [run]);
  const speak = useCallback((text, o) => run((t) => t.speak(text, o)), [run]);
  return { status, progress, error, tts, generate, speak };
}
export {
  NabraTTS,
  useNabraTTS
};
