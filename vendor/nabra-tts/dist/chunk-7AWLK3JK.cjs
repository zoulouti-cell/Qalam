"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } var _class;


var _chunkH77ZGL5Icjs = require('./chunk-H77ZGL5I.cjs');

// src/audio.ts
function concat(chunks) {
  const out = new Float32Array(chunks.reduce((n, c) => n + c.length, 0));
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}
function encodeWav(audio, sampleRate) {
  const buffer = new ArrayBuffer(44 + audio.length * 2);
  const view = new DataView(buffer);
  const str = (offset, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  str(0, "RIFF");
  view.setUint32(4, 36 + audio.length * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  str(36, "data");
  view.setUint32(40, audio.length * 2, true);
  for (let i = 0; i < audio.length; i++) {
    const s = Math.max(-1, Math.min(1, audio[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 32768 : s * 32767, true);
  }
  return buffer;
}
function toWavBlob(audio, sampleRate) {
  return new Blob([encodeWav(audio, sampleRate)], { type: "audio/wav" });
}
var sharedContext = null;
async function playAudio(audio, sampleRate, ctx) {
  ctx ??= sharedContext ??= new AudioContext();
  if (ctx.state === "suspended") await ctx.resume();
  const buf = ctx.createBuffer(1, audio.length, sampleRate);
  buf.copyToChannel(audio, 0);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  await new Promise((resolve) => {
    src.onended = () => resolve();
    src.start();
  });
}

// src/tts.ts
async function directBackend(config, opts) {
  const { Engine } = await Promise.resolve().then(() => _interopRequireWildcard(require("./engine-J4FHRCY5.cjs")));
  const engine = await Engine.create(config, opts.onProgress);
  const diacritize = opts.diacritize && (async (t) => opts.diacritize(t));
  let lock = Promise.resolve();
  const exclusive = async function* (gen) {
    let release;
    const prev = lock;
    lock = new Promise((r) => release = r);
    await prev;
    try {
      yield* gen();
    } finally {
      release();
    }
  };
  return {
    device: engine.device,
    stream: (text, speed) => exclusive(() => engine.stream(text, speed, diacritize)),
    phonemize: async (text) => (await engine.prepare(text, diacritize)).map((c) => c.phonemes),
    dispose: () => engine.dispose()
  };
}
async function workerBackend(config, opts) {
  const { default: code } = await Promise.resolve().then(() => _interopRequireWildcard(require("./worker-KNSCUB5M.cjs")));
  const url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
  const worker = new Worker(url, { type: "module", name: "nabra-tts" });
  const send = (msg) => worker.postMessage(msg);
  const listeners = /* @__PURE__ */ new Map();
  let nextId = 0;
  const ready = new Promise((resolve, reject) => {
    worker.onerror = (e) => reject(new Error(`nabra-tts worker failed: ${e.message}`));
    worker.onmessage = async (e) => {
      const msg = e.data;
      if (msg.type === "progress") _optionalChain([opts, 'access', _ => _.onProgress, 'optionalCall', _2 => _2(msg.progress)]);
      else if (msg.type === "ready") resolve(msg.device);
      else if (msg.type === "error" && msg.id === void 0) reject(new Error(msg.message));
      else if (msg.type === "diacritize") {
        try {
          send({ type: "diacritized", rid: msg.rid, text: await opts.diacritize(msg.text) });
        } catch (err) {
          send({ type: "diacritized", rid: msg.rid, error: String(_nullishCoalesce(_optionalChain([err, 'optionalAccess', _3 => _3.message]), () => ( err))) });
        }
      } else if ("id" in msg && msg.id !== void 0) _optionalChain([listeners, 'access', _4 => _4.get, 'call', _5 => _5(msg.id), 'optionalCall', _6 => _6(msg)]);
    };
  });
  send({ type: "load", config });
  let device;
  try {
    device = await ready;
  } catch (err) {
    worker.terminate();
    URL.revokeObjectURL(url);
    throw err;
  }
  function request(msg) {
    const buffered = [];
    let wake = null;
    listeners.set(msg.id, (m) => {
      buffered.push(m);
      _optionalChain([wake, 'optionalCall', _7 => _7()]);
    });
    send(msg);
    return (async function* () {
      try {
        for (; ; ) {
          if (!buffered.length) await new Promise((r) => wake = r);
          wake = null;
          const m = buffered.shift();
          if (m.type === "error") throw new Error(m.message);
          yield m;
          if (m.type === "done" || m.type === "phonemes") return;
        }
      } finally {
        listeners.delete(msg.id);
      }
    })();
  }
  return {
    device,
    async *stream(text, speed) {
      const id = nextId++;
      let finished = false;
      try {
        for await (const m of request({ type: "generate", id, text, speed, diacritize: !!opts.diacritize })) {
          if (m.type === "chunk") yield { graphemes: m.text, phonemes: m.phonemes, audio: m.audio };
          if (m.type === "done") finished = true;
        }
      } finally {
        if (!finished) send({ type: "cancel", id });
      }
    },
    async phonemize(text) {
      for await (const m of request({ type: "phonemize", id: nextId++, text, diacritize: !!opts.diacritize })) {
        if (m.type === "phonemes") return m.phonemes;
      }
      return [];
    },
    async dispose() {
      send({ type: "dispose" });
      URL.revokeObjectURL(url);
    }
  };
}
var NabraTTS = (_class = class _NabraTTS {
  constructor(backend) {;_class.prototype.__init.call(this);
    this.backend = backend;
  }
  
  /** Output sample rate (Hz). */
  static __initStatic() {this.SAMPLE_RATE = _chunkH77ZGL5Icjs.SAMPLE_RATE}
  __init() {this.sampleRate = _chunkH77ZGL5Icjs.SAMPLE_RATE}
  /** Download (or read from cache) the model and get ready to synthesize. */
  static async load(options = {}) {
    const config = {
      repo: _nullishCoalesce(options.repo, () => ( _chunkH77ZGL5Icjs.DEFAULT_REPO)),
      revision: _nullishCoalesce(options.revision, () => ( "main")),
      dtype: _nullishCoalesce(options.dtype, () => ( "fp32")),
      device: _nullishCoalesce(options.device, () => ( "auto")),
      modelUrl: options.modelUrl && new URL(options.modelUrl, _optionalChain([globalThis, 'access', _8 => _8.location, 'optionalAccess', _9 => _9.href])).href,
      voiceUrl: options.voiceUrl && new URL(options.voiceUrl, _optionalChain([globalThis, 'access', _10 => _10.location, 'optionalAccess', _11 => _11.href])).href,
      wasmPaths: options.wasmPaths && new URL(options.wasmPaths, _optionalChain([globalThis, 'access', _12 => _12.location, 'optionalAccess', _13 => _13.href])).href,
      numThreads: options.numThreads,
      cache: _nullishCoalesce(options.cache, () => ( true)),
      normalize: _nullishCoalesce(options.normalize, () => ( false))
    };
    const useWorker = _nullishCoalesce(options.worker, () => ( typeof Worker !== "undefined"));
    const backend = useWorker ? await workerBackend(config, options) : await directBackend(config, options);
    return new _NabraTTS(backend);
  }
  /** Execution provider in use. */
  get device() {
    return this.backend.device;
  }
  /** Synthesize chunk by chunk (sentences / lines) — start playing before the whole text is done. */
  async *stream(text, options = {}) {
    for await (const c of this.backend.stream(text, _nullishCoalesce(options.speed, () => ( 1)))) {
      yield { text: c.graphemes, phonemes: c.phonemes, audio: c.audio, sampleRate: _chunkH77ZGL5Icjs.SAMPLE_RATE };
    }
  }
  /** Synthesize the whole text into one 24 kHz mono buffer. */
  async generate(text, options = {}) {
    const parts = [];
    for await (const c of this.stream(text, options)) parts.push(c.audio);
    return { audio: concat(parts), sampleRate: _chunkH77ZGL5Icjs.SAMPLE_RATE };
  }
  /** Synthesize and play through Web Audio, chunk by chunk. Resolves when playback ends. */
  async speak(text, options = {}) {
    let playing = Promise.resolve();
    for await (const c of this.stream(text, options)) {
      const prev = playing;
      playing = prev.then(() => playAudio(c.audio, _chunkH77ZGL5Icjs.SAMPLE_RATE, options.audioContext));
    }
    await playing;
  }
  /** Text -> IPA phonemes per chunk (what the model actually sees). */
  phonemize(text) {
    return this.backend.phonemize(text);
  }
  /** Encode audio as a WAV Blob. */
  toWav(audio) {
    return toWavBlob(audio, _chunkH77ZGL5Icjs.SAMPLE_RATE);
  }
  /** Release the model and stop the worker. */
  dispose() {
    return this.backend.dispose();
  }
}, _class.__initStatic(), _class);






exports.encodeWav = encodeWav; exports.toWavBlob = toWavBlob; exports.playAudio = playAudio; exports.NabraTTS = NabraTTS;
