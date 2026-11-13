export { A as AudioChunk, D as DType, a as Device, G as GenerateOptions, b as GeneratedAudio, L as LoadOptions, N as NabraTTS, P as ProgressInfo } from './tts-CAnLkG6J.cjs';

/** Encode mono float PCM as a 16-bit WAV file. */
declare function encodeWav(audio: Float32Array, sampleRate: number): ArrayBuffer;
/** WAV Blob, e.g. for `<audio src={URL.createObjectURL(blob)}>` or downloads. */
declare function toWavBlob(audio: Float32Array, sampleRate: number): Blob;
/** Play PCM through Web Audio. Resolves when playback ends. */
declare function playAudio(audio: Float32Array, sampleRate: number, ctx?: AudioContext): Promise<void>;

/** Remove cached model files. */
declare function clearCache(): Promise<void>;

/** True if the text already carries enough tashkeel to trust and use as-is. */
declare function isDiacritized(text: string, minRatio?: number): boolean;
/** Drop citation markers like [12] and Latin-script runs, tidy whitespace. */
declare function normalizeText(text: string): string;

export { clearCache, encodeWav, isDiacritized, normalizeText, playAudio, toWavBlob };
