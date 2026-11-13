"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }





var _chunkQPICMBNJcjs = require('./chunk-QPICMBNJ.cjs');


var _chunkH77ZGL5Icjs = require('./chunk-H77ZGL5I.cjs');

// src/engine.ts
var _onnxruntimeweb = require('onnxruntime-web'); var ort = _interopRequireWildcard(_onnxruntimeweb);

// src/g2p/punctuation.ts
var DEFAULT_MARKS = ';:,.!?\xA1\xBF\u2014\u2026"\xAB\xBB\u201C\u201D(){}[]';
var escapeClass = (s) => s.replace(/[\\\]\[^-]/g, "\\$&");
var MARKS_RE = new RegExp(`(\\s*[${escapeClass(DEFAULT_MARKS)}]+\\s*)+`, "gu");
function preserveLine(line, num) {
  const matches = [...line.matchAll(MARKS_RE)];
  if (matches.length === 0) return [[line], []];
  if (matches.length === 1 && matches[0][0] === line) return [[], [{ index: num, mark: line, position: "A" }]];
  const marks = matches.map((m, i) => {
    let position = "I";
    if (i === 0 && line.startsWith(m[0])) position = "B";
    else if (i === matches.length - 1 && line.endsWith(m[0])) position = "E";
    return { index: num, mark: m[0], position };
  });
  const preserved = [];
  for (const mark of marks) {
    const split = line.split(mark.mark);
    preserved.push(split[0]);
    line = split.slice(1).join(mark.mark);
  }
  return [[...preserved, line], marks];
}
function preserve(lines) {
  const text = [];
  const marks = [];
  lines.forEach((line, num) => {
    const [l, m] = preserveLine(line, num);
    text.push(...l);
    marks.push(...m);
  });
  return [text.filter(Boolean), marks];
}
function restore(text, marks) {
  const sep = " ";
  text = [...text];
  marks = [...marks];
  const out = [];
  let pos = 0;
  while (text.length || marks.length) {
    if (!marks.length) {
      for (let line of text) {
        if (!line.endsWith(sep)) line += sep;
        out.push(line);
      }
      text = [];
    } else if (!text.length) {
      out.push(marks.map((m) => m.mark).join(""));
      marks = [];
    } else {
      const current = marks[0];
      if (current.index === pos) {
        const mark = current.mark;
        marks = marks.slice(1);
        if (text[0].endsWith(sep)) text[0] = text[0].slice(0, -sep.length);
        if (current.position === "B") {
          text[0] = mark + text[0];
        } else if (current.position === "E") {
          out.push(text[0] + mark + (mark.endsWith(sep) ? "" : sep));
          text = text.slice(1);
          pos += 1;
        } else if (current.position === "A") {
          out.push(mark + (mark.endsWith(sep) ? "" : sep));
          pos += 1;
        } else if (text.length === 1) {
          text[0] = text[0] + mark;
        } else {
          const first = text[0];
          text = text.slice(1);
          text[0] = first + mark + text[0];
        }
      } else {
        out.push(text[0]);
        text = text.slice(1);
        pos += 1;
      }
    }
  }
  return out;
}

// src/g2p/espeak.ts
var PHONEME_MODE = 2 | 1 << 7 | 865 << 8;
var E2M = Object.entries({
  "a^\u026A": "I",
  "a^\u028A": "W",
  "d^z": "\u02A3",
  "d^\u0292": "\u02A4",
  "e^\u026A": "A",
  "o^\u028A": "O",
  "\u0259^\u028A": "Q",
  "s^s": "S",
  "t^s": "\u02A6",
  "t^\u0283": "\u02A7",
  "\u0254^\u026A": "Y"
}).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
var modulePromise = null;
function loadEspeak() {
  modulePromise ??= Promise.resolve().then(() => _interopRequireWildcard(require("./espeak-ng-ar-3W4KSYMQ.cjs"))).then(async ({ default: createEspeak }) => {
    const mod = await createEspeak();
    const rc = mod.ccall("nabra_init", "number", ["string", "string"], ["/espeak-ng-data", "ar"]);
    if (rc !== 0) throw new Error(`espeak-ng init failed (${rc})`);
    return mod;
  });
  return modulePromise;
}
async function initEspeak() {
  await loadEspeak();
}
var replaceAll = (s, a, b) => s.split(a).join(b);
function postprocessLine(line) {
  line = replaceAll(line.trim().replace(/\n/g, " "), "  ", " ");
  line = line.replace(/_+/g, "_").replace(/_ /g, " ");
  line = line.replace(/\(.+?\)/g, "");
  if (!line) return "";
  let out = "";
  for (const word of line.split(" ")) out += replaceAll(word.trim(), "\u0361", "^") + " ";
  return out;
}
async function espeakPhonemize(text) {
  const mod = await loadEspeak();
  text = text.replace(/«/g, "\u201C").replace(/»/g, "\u201D");
  text = text.replace(/\(/g, "\xAB").replace(/\)/g, "\xBB");
  const [chunks, marks] = preserve([text]);
  const phonemized = chunks.map(
    (chunk) => postprocessLine(mod.ccall("nabra_text_to_phonemes", "string", ["string", "number"], [chunk, PHONEME_MODE]))
  );
  const restored = restore(phonemized, marks);
  if (!restored.length) return "";
  let ps = restored[0].trim();
  for (const [a, b] of E2M) ps = replaceAll(ps, a, b);
  ps = replaceAll(ps, "^", "");
  ps = replaceAll(ps, "-", "");
  return ps.replace(/«/g, "(").replace(/»/g, ")");
}

// src/vocab.ts
var VOCAB = {
  ";": 1,
  ":": 2,
  ",": 3,
  ".": 4,
  "!": 5,
  "?": 6,
  "\u2014": 9,
  "\u2026": 10,
  '"': 11,
  "(": 12,
  ")": 13,
  "\u201C": 14,
  "\u201D": 15,
  " ": 16,
  "\u0303": 17,
  "\u02A3": 18,
  "\u02A5": 19,
  "\u02A6": 20,
  "\u02A8": 21,
  "\u1D5D": 22,
  "\uAB67": 23,
  "A": 24,
  "I": 25,
  "O": 31,
  "Q": 33,
  "S": 35,
  "T": 36,
  "W": 39,
  "Y": 41,
  "\u1D4A": 42,
  "a": 43,
  "b": 44,
  "c": 45,
  "d": 46,
  "e": 47,
  "f": 48,
  "h": 50,
  "i": 51,
  "j": 52,
  "k": 53,
  "l": 54,
  "m": 55,
  "n": 56,
  "o": 57,
  "p": 58,
  "q": 59,
  "r": 60,
  "s": 61,
  "t": 62,
  "u": 63,
  "v": 64,
  "w": 65,
  "x": 66,
  "y": 67,
  "z": 68,
  "\u0251": 69,
  "\u0250": 70,
  "\u0252": 71,
  "\xE6": 72,
  "\u03B2": 75,
  "\u0254": 76,
  "\u0255": 77,
  "\xE7": 78,
  "\u0256": 80,
  "\xF0": 81,
  "\u02A4": 82,
  "\u0259": 83,
  "\u025A": 85,
  "\u025B": 86,
  "\u025C": 87,
  "\u025F": 90,
  "\u0261": 92,
  "\u0265": 99,
  "\u0268": 101,
  "\u026A": 102,
  "\u029D": 103,
  "\u026F": 110,
  "\u0270": 111,
  "\u014B": 112,
  "\u0273": 113,
  "\u0272": 114,
  "\u0274": 115,
  "\xF8": 116,
  "\u0278": 118,
  "\u03B8": 119,
  "\u0153": 120,
  "\u0279": 123,
  "\u027E": 125,
  "\u027B": 126,
  "\u0281": 128,
  "\u027D": 129,
  "\u0282": 130,
  "\u0283": 131,
  "\u0288": 132,
  "\u02A7": 133,
  "\u028A": 135,
  "\u028B": 136,
  "\u028C": 138,
  "\u0263": 139,
  "\u0264": 140,
  "\u03C7": 142,
  "\u028E": 143,
  "\u0292": 147,
  "\u0294": 148,
  "\u02C8": 156,
  "\u02CC": 157,
  "\u02D0": 158,
  "\u02B0": 162,
  "\u02B2": 164,
  "\u2193": 169,
  "\u2192": 171,
  "\u2197": 172,
  "\u2198": 173,
  "\u1D7B": 177
};

// src/g2p/index.ts
var MAX_PHONEMES = 510;
var CHUNK_SIZE = 400;
var TOKENS = { ...VOCAB, ..._chunkQPICMBNJcjs.EXTRA_SYMBOLS };
var cpLength = (s) => Array.from(s).length;
async function phonemize(text) {
  return _chunkQPICMBNJcjs.cleanPhonemes.call(void 0, await espeakPhonemize(text));
}
function tokenize(phonemes) {
  const ids = [0];
  for (const ch of phonemes) {
    const id = TOKENS[ch];
    if (id !== void 0) ids.push(id);
  }
  ids.push(0);
  return ids;
}
function splitText(text) {
  const out = [];
  for (const graphemes of text.trim().split(/\n+/)) {
    if (!graphemes.trim()) continue;
    const sentences = graphemes.split(/([.!?]+)/);
    const chunks = [];
    let current = "";
    for (let i = 0; i < sentences.length; i += 2) {
      let sentence = sentences[i];
      if (i + 1 < sentences.length) sentence += sentences[i + 1];
      if (cpLength(current) + cpLength(sentence) <= CHUNK_SIZE) {
        current += sentence;
      } else {
        if (current) chunks.push(current.trim());
        current = sentence;
      }
    }
    if (current) chunks.push(current.trim());
    if (!chunks.length) {
      const cps = Array.from(graphemes);
      for (let i = 0; i < cps.length; i += CHUNK_SIZE) chunks.push(cps.slice(i, i + CHUNK_SIZE).join(""));
    }
    out.push(...chunks.filter((c) => c.trim()));
  }
  return out;
}
async function prepare(text, opts = {}) {
  const chunks = [];
  for (let graphemes of splitText(text)) {
    if (opts.normalize) graphemes = _chunkQPICMBNJcjs.normalizeText.call(void 0, graphemes);
    let g2pInput = graphemes;
    if (opts.diacritize && !_chunkQPICMBNJcjs.isDiacritized.call(void 0, graphemes)) g2pInput = await opts.diacritize(graphemes);
    let cps = Array.from(await phonemize(g2pInput));
    if (!cps.length) continue;
    if (cps.length > MAX_PHONEMES) cps = cps.slice(0, MAX_PHONEMES);
    const phonemes = cps.join("");
    chunks.push({ graphemes, phonemes, inputIds: tokenize(phonemes), styleIndex: cps.length - 1 });
  }
  return chunks;
}

// src/engine.ts
var hfUrl = (repo, revision, file) => `https://huggingface.co/${repo}/resolve/${revision}/${file}`;
async function pickDevice(device) {
  if (device !== "auto") return device;
  const gpu = _optionalChain([globalThis, 'access', _ => _.navigator, 'optionalAccess', _2 => _2.gpu]);
  if (!gpu) return "wasm";
  try {
    return await gpu.requestAdapter() ? "webgpu" : "wasm";
  } catch (e) {
    return "wasm";
  }
}
var Engine = class _Engine {
  constructor(session, voice, config, device) {
    this.session = session;
    this.voice = voice;
    this.config = config;
    this.device = device;
  }
  
  
  
  
  static async create(config, onProgress) {
    const modelFile = config.dtype === "fp16" ? "onnx/model_fp16.onnx" : "onnx/model.onnx";
    const modelUrl = _nullishCoalesce(config.modelUrl, () => ( hfUrl(config.repo, config.revision, modelFile)));
    const voiceUrl = _nullishCoalesce(config.voiceUrl, () => ( hfUrl(config.repo, config.revision, "voices/af_msa.bin")));
    ort.env.wasm.wasmPaths = _nullishCoalesce(config.wasmPaths, () => ( `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ort.env.versions.web}/dist/`));
    ort.env.wasm.numThreads = _nullishCoalesce(config.numThreads, () => ( 1));
    const [modelBytes, voiceBytes, device] = await Promise.all([
      _chunkQPICMBNJcjs.fetchCached.call(void 0, modelUrl, config.cache, (loaded, total) => _optionalChain([onProgress, 'optionalCall', _3 => _3({ file: "model", loaded, total })])),
      _chunkQPICMBNJcjs.fetchCached.call(void 0, voiceUrl, config.cache, (loaded, total) => _optionalChain([onProgress, 'optionalCall', _4 => _4({ file: "voice", loaded, total })])),
      pickDevice(config.device),
      initEspeak()
    ]);
    const voice = new Float32Array(voiceBytes.buffer, voiceBytes.byteOffset, voiceBytes.byteLength / 4);
    let session;
    let used = device;
    try {
      session = await ort.InferenceSession.create(modelBytes, { executionProviders: [device], logSeverityLevel: 3 });
    } catch (err) {
      if (device !== "webgpu" || config.device === "webgpu") throw err;
      session = await ort.InferenceSession.create(modelBytes, { executionProviders: ["wasm"], logSeverityLevel: 3 });
      used = "wasm";
    }
    return new _Engine(session, voice, config, used);
  }
  prepare(text, diacritize) {
    return prepare(text, { diacritize, normalize: this.config.normalize });
  }
  async synthesize(chunk, speed = 1) {
    const row = Math.min(chunk.styleIndex, this.voice.length / _chunkH77ZGL5Icjs.STYLE_DIM - 1);
    const style = this.voice.slice(row * _chunkH77ZGL5Icjs.STYLE_DIM, (row + 1) * _chunkH77ZGL5Icjs.STYLE_DIM);
    const feeds = {
      input_ids: new ort.Tensor("int64", BigInt64Array.from(chunk.inputIds, BigInt), [1, chunk.inputIds.length]),
      style: new ort.Tensor("float32", style, [1, _chunkH77ZGL5Icjs.STYLE_DIM]),
      speed: new ort.Tensor("float32", new Float32Array([speed]), [1])
    };
    const out = await this.session.run(feeds);
    const audio = out.waveform.data.slice();
    for (const t of Object.values(out)) _optionalChain([t, 'access', _5 => _5.dispose, 'optionalCall', _6 => _6()]);
    return audio;
  }
  async *stream(text, speed = 1, diacritize) {
    for (const chunk of await this.prepare(text, diacritize)) {
      yield { graphemes: chunk.graphemes, phonemes: chunk.phonemes, audio: await this.synthesize(chunk, speed) };
    }
  }
  async dispose() {
    await this.session.release();
  }
};


exports.Engine = Engine;
