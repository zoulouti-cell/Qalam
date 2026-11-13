"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

var _chunk7AWLK3JKcjs = require('./chunk-7AWLK3JK.cjs');
require('./chunk-H77ZGL5I.cjs');

// src/react.ts
var _react = require('react');
function useNabraTTS(options = {}) {
  const [tts, setTts] = _react.useState.call(void 0, null);
  const [status, setStatus] = _react.useState.call(void 0, "loading");
  const [progress, setProgress] = _react.useState.call(void 0, 0);
  const [error, setError] = _react.useState.call(void 0, null);
  const optionsRef = _react.useRef.call(void 0, options);
  optionsRef.current = options;
  _react.useEffect.call(void 0, () => {
    let disposed = false;
    let instance = null;
    const files = {};
    setStatus("loading");
    _chunk7AWLK3JKcjs.NabraTTS.load({
      ...optionsRef.current,
      diacritize: optionsRef.current.diacritize && ((t) => optionsRef.current.diacritize(t)),
      onProgress: (p) => {
        files[p.file] = p;
        const all = Object.values(files);
        const total = all.reduce((n, f) => n + f.total, 0);
        if (total) setProgress(all.reduce((n, f) => n + f.loaded, 0) / total);
        _optionalChain([optionsRef, 'access', _ => _.current, 'access', _2 => _2.onProgress, 'optionalCall', _3 => _3(p)]);
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
      _optionalChain([instance, 'optionalAccess', _4 => _4.dispose, 'call', _5 => _5()]);
    };
  }, []);
  const run = _react.useCallback.call(void 0, 
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
  const generate = _react.useCallback.call(void 0, (text, o) => run((t) => t.generate(text, o)), [run]);
  const speak = _react.useCallback.call(void 0, (text, o) => run((t) => t.speak(text, o)), [run]);
  return { status, progress, error, tts, generate, speak };
}



exports.NabraTTS = _chunk7AWLK3JKcjs.NabraTTS; exports.useNabraTTS = useNabraTTS;
