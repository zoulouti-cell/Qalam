# nabra-tts

Arabic text-to-speech that runs **entirely in the browser**: no server, no API key, works offline after the first load.
It runs [Nabra-7M-Distill](https://huggingface.co/oddadmix/Nabra-7M-Distill) (7.5M params, 24 kHz, Modern Standard Arabic) through ONNX Runtime Web on WebGPU or WASM.

Works with plain JS, React, Angular, Vue, Svelte, and any bundler. You don't need to configure workers or assets.

```bash
npm i nabra-tts
```

```ts
import { NabraTTS } from 'nabra-tts';

const tts = await NabraTTS.load();                      // downloads ~30 MB once, then cached
const { audio, sampleRate } = await tts.generate('مَرْحَبًا بِكُمْ');
audioEl.src = URL.createObjectURL(tts.toWav(audio));    // or: await tts.speak('...')
```

## How it works

```
text ─► chunking ─► [diacritize hook] ─► espeak-ng (WASM) ─► phonemes ─► ONNX model ─► 24 kHz PCM
          (lines / sentences ≤400 chars)        Arabic G2P, identical to the Python pipeline
```

- Everything runs in an inline **Web Worker**, so the UI never blocks.
- **G2P parity:** espeak-ng 1.52 (the same version and data the model was trained with) is compiled to WASM. The phonemizer and misaki post-processing is ported 1:1. The phonemes, token ids and chunking match the Python reference exactly (`npm test`).
- **WebGPU** is used when available. Otherwise it falls back to WASM.
- The model and voice are fetched from [`oddadmix/Nabra-7M-Distill-ONNX`](https://huggingface.co/oddadmix/Nabra-7M-Distill-ONNX) and stored in Cache Storage.

## API

### `NabraTTS.load(options?)`

| option | default | |
|---|---|---|
| `dtype` | `'fp32'` | `'fp16'` halves the download (16 MB) with the same quality. |
| `device` | `'auto'` | `'webgpu'` \| `'wasm'` \| `'auto'` |
| `diacritize` | none | `(text) => string \| Promise<string>`. Adds tashkeel before G2P (see below). |
| `normalize` | `false` | Drops `[citations]` and Latin-script words, as was done for the training data. |
| `worker` | `true` in browsers | `false` runs on the calling thread (Node, strict CSPs). |
| `onProgress` | none | `({ file, loaded, total }) => void` for the model and voice downloads. |
| `modelUrl`, `voiceUrl` | HF repo | Self-host the files. |
| `repo`, `revision` | `oddadmix/Nabra-7M-Distill-ONNX`, `main` | Pin a revision for reproducibility. |
| `wasmPaths` | jsDelivr | Where onnxruntime-web loads its `.wasm` from. Set this to self-host or work fully offline. |
| `numThreads` | `1` | WASM threads. More than 1 requires a cross-origin-isolated page. |
| `cache` | `true` | Use Cache Storage for the model files. |

### Instance

```ts
await tts.generate(text, { speed })   // { audio: Float32Array, sampleRate: 24000 }
for await (const c of tts.stream(text)) play(c.audio)   // per sentence chunk, low latency
await tts.speak(text)                 // play through Web Audio, chunk by chunk
await tts.phonemize(text)             // IPA the model sees, per chunk
tts.toWav(audio)                      // Blob (audio/wav)
tts.device                            // 'webgpu' | 'wasm'
await tts.dispose()
```

Helpers: `encodeWav`, `toWavBlob`, `playAudio`, `clearCache`, `isDiacritized`, `normalizeText`.

## Tashkeel (diacritics)

The model reads short vowels from tashkeel. **Diacritized input sounds best.** Text without tashkeel is passed directly to espeak-ng, which guesses the vowels. This is the same behaviour as the Python pipeline when camel-tools is not installed.

To add your own diacritizer (a model, an API, or a lookup table), pass `diacritize`. Text that is already diacritized (≥20% of letters carry marks) is never sent to it.

```ts
const tts = await NabraTTS.load({
  diacritize: async (text) => (await fetch('/api/tashkeel', { method: 'POST', body: text })).text(),
});
```

## Frameworks

**React:** `nabra-tts/react`

```tsx
import { useNabraTTS } from 'nabra-tts/react';

function Speak() {
  const { status, progress, generate, speak } = useNabraTTS();
  if (status === 'loading') return <p>Loading {Math.round(progress * 100)}%</p>;
  return <button onClick={() => speak('مَرْحَبًا')}>Speak</button>;
}
```

**Angular:** see [`examples/angular`](examples/angular) for an injectable `NabraTtsService` with signals. The model loads lazily, so it is SSR-safe.

**Vue:** see [`examples/vue`](examples/vue) for a `useNabraTTS()` composable.

**Plain HTML:**

```html
<script type="module">
  import { NabraTTS } from 'https://cdn.jsdelivr.net/npm/nabra-tts@0/+esm';
  const tts = await NabraTTS.load();
  document.querySelector('button').onclick = () => tts.speak('مَرْحَبًا بِكُمْ');
</script>
```

SSR (Next.js, Nuxt, Angular Universal): importing the package is safe on the server. Call `load()` only in the browser, for example in `useEffect`, `onMounted`, or after a `typeof window` check.

## Deployment notes

- **First load:** about 30 MB of model (16 MB with fp16) plus the onnxruntime-web WASM binary (about 7 MB gzipped, from jsDelivr by default). Later loads come from cache.
- **CSP:** the worker starts from a `blob:` URL, so allow `worker-src blob:`. Also allow `connect-src` to `huggingface.co`, `*.hf.co` and `cdn.jsdelivr.net`, unless you self-host with `modelUrl`, `voiceUrl` and `wasmPaths`. If blob workers aren't allowed at all, use `worker: false`.
- **Bundle size:** the core is small. The worker (about 2.5 MB, 1.2 MB gzipped, of which 2 MB is espeak-ng and its Arabic dictionary) is a lazily loaded chunk fetched by `load()`.

## Performance

Measured on an Apple M-series laptop. The text is 4.5–5 s of speech. Times are after warm-up.

| backend | synth time | speed |
|---|---:|---:|
| WebGPU (Chrome) | ~0.75 s | ~6× realtime |
| WASM, 1 thread (Node) | ~0.7 s | ~7× realtime |

## Repository layout

| path | |
|---|---|
| `src/` | The package: G2P port, engine, worker, React hook |
| `src/vendor/espeak-ng-ar.mjs` | espeak-ng 1.52 WASM with only Arabic and English data, built by `espeak/build.sh` |
| `export/` | Python: PyTorch → ONNX export (`export_onnx.py`) and golden G2P fixtures (`make_golden.py`) |
| `test/` | Parity tests against the Python pipeline, and a Node end-to-end smoke test |
| `examples/` | vanilla, React (Vite), Angular, Vue |

### Development

```bash
npm i
npm test            # G2P/tokenizer parity with Python
npm run build
npm run example     # serves the repo; open http://localhost:8780/examples/vanilla/
node test/smoke.mjs # end-to-end synthesis in Node
```

To regenerate the model files and fixtures:

```bash
cd export
uv venv -p 3.12 .venv && uv pip install -p .venv -r requirements.txt
.venv/bin/hf download oddadmix/Nabra-7M-Distill --local-dir hf_src --exclude "training/*"
.venv/bin/python export_onnx.py      # -> onnx_out/ (fp32 + fp16 + voice), validated against PyTorch
.venv/bin/python make_golden.py      # -> test/fixtures/golden.json
../espeak/build.sh                   # (optional) rebuild the espeak-ng WASM; needs emscripten
```

## Limitations

- Single voice, Modern Standard Arabic only. Dialects are not covered.
- Quality depends on tashkeel (see above).
- Each chunk is capped at 510 phonemes. Longer sentences are truncated, the same as the Python `KPipeline`.

## License

Apache-2.0 for the code in this repository and for the model. The bundled espeak-ng is **GPL-3.0-or-later**. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
