type Device = 'auto' | 'webgpu' | 'wasm';
type DType = 'fp32' | 'fp16';
interface ProgressInfo {
    file: 'model' | 'voice';
    loaded: number;
    /** 0 when the server sent no Content-Length. */
    total: number;
}
interface LoadOptions {
    /** 'fp32' (30 MB, default) or 'fp16' (16 MB, same quality). */
    dtype?: DType;
    /** 'auto' (default) picks WebGPU when available, else WASM. */
    device?: Device;
    /** Run in a Web Worker so synthesis never blocks the UI. Default true when Worker exists. */
    worker?: boolean;
    /** Hugging Face repo holding the ONNX export. Default 'oddadmix/Nabra-7M-Distill-ONNX'. */
    repo?: string;
    /** Branch, tag or commit of `repo`. Default 'main'. */
    revision?: string;
    /** Self-host the model instead of fetching from Hugging Face. */
    modelUrl?: string;
    /** Self-host the voice pack (raw float32 [510, 256]). */
    voiceUrl?: string;
    /** Where onnxruntime-web loads its .wasm files from. Default: jsDelivr CDN. */
    wasmPaths?: string;
    /** WASM threads (needs a cross-origin isolated page). Default 1; the model is tiny. */
    numThreads?: number;
    /** Cache model + voice with the Cache Storage API. Default true. */
    cache?: boolean;
    /**
     * Add tashkeel to un-diacritized text before G2P (e.g. call your own diacritizer model
     * or API). Text that is already diacritized is passed through unchanged.
     */
    diacritize?: (text: string) => string | Promise<string>;
    /** Drop [citations] and Latin-script words before G2P. Default false. */
    normalize?: boolean;
    /** Download progress callback. */
    onProgress?: (p: ProgressInfo) => void;
}
interface GenerateOptions {
    /** Speaking rate, 1 = normal. */
    speed?: number;
}
interface AudioChunk {
    /** Text of this chunk. */
    text: string;
    /** IPA phonemes that were synthesized. */
    phonemes: string;
    /** Mono PCM, 24 kHz. */
    audio: Float32Array;
    sampleRate: number;
}
interface GeneratedAudio {
    audio: Float32Array;
    sampleRate: number;
}

/**
 * Arabic text-to-speech with Nabra-7M-Distill, running fully client-side.
 *
 * ```ts
 * const tts = await NabraTTS.load();
 * const { audio, sampleRate } = await tts.generate('مَرْحَبًا بِكُم');
 * ```
 */
declare class NabraTTS {
    private backend;
    /** Output sample rate (Hz). */
    static readonly SAMPLE_RATE = 24000;
    readonly sampleRate = 24000;
    private constructor();
    /** Download (or read from cache) the model and get ready to synthesize. */
    static load(options?: LoadOptions): Promise<NabraTTS>;
    /** Execution provider in use. */
    get device(): 'webgpu' | 'wasm';
    /** Synthesize chunk by chunk (sentences / lines) — start playing before the whole text is done. */
    stream(text: string, options?: GenerateOptions): AsyncGenerator<AudioChunk>;
    /** Synthesize the whole text into one 24 kHz mono buffer. */
    generate(text: string, options?: GenerateOptions): Promise<GeneratedAudio>;
    /** Synthesize and play through Web Audio, chunk by chunk. Resolves when playback ends. */
    speak(text: string, options?: GenerateOptions & {
        audioContext?: AudioContext;
    }): Promise<void>;
    /** Text -> IPA phonemes per chunk (what the model actually sees). */
    phonemize(text: string): Promise<string[]>;
    /** Encode audio as a WAV Blob. */
    toWav(audio: Float32Array): Blob;
    /** Release the model and stop the worker. */
    dispose(): Promise<void>;
}

export { type AudioChunk as A, type DType as D, type GenerateOptions as G, type LoadOptions as L, NabraTTS as N, type ProgressInfo as P, type Device as a, type GeneratedAudio as b };
