import { N as NabraTTS, G as GenerateOptions, b as GeneratedAudio, L as LoadOptions } from './tts-CAnLkG6J.cjs';
export { P as ProgressInfo } from './tts-CAnLkG6J.cjs';

type NabraStatus = 'idle' | 'loading' | 'ready' | 'generating' | 'error';
interface UseNabraTTS {
    status: NabraStatus;
    /** Download progress, 0..1 across model + voice. */
    progress: number;
    error: Error | null;
    tts: NabraTTS | null;
    generate: (text: string, options?: GenerateOptions) => Promise<GeneratedAudio>;
    speak: (text: string, options?: GenerateOptions) => Promise<void>;
}
/**
 * Load Nabra TTS once per component and expose generate/speak.
 * Options are read on mount; remount (e.g. change `key`) to reload with new options.
 */
declare function useNabraTTS(options?: LoadOptions): UseNabraTTS;

export { GenerateOptions, GeneratedAudio, LoadOptions, type NabraStatus, NabraTTS, type UseNabraTTS, useNabraTTS };
