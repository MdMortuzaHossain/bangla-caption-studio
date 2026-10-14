# বাংলা Caption Studio — local AI

Live: https://mdmortuzahossain.github.io/bangla-caption-studio/

Audio to video with editable Bengali subtitles. No API key or per-audio API charge. Audio stays in the browser.

## Use

Select Base (default), Small (larger/slower), or Tiny (lighter, more Bengali mistakes possible). Choose audio and language, then generate subtitles. The first run downloads the model from Hugging Face; downloads can be large. Browser cache may retain it, but cache eviction requires another download. Automatic video export is enabled by default; disable it to review first. Edit/apply SRT and regenerate video without repeating transcription. MP4/WebM, SRT downloads, all waveform/background/color/compression controls remain.

## Runtime

GitHub Pages serves index.html and transcriber.js. A dedicated Worker runs Transformers.js 3.8.1 with quantized multilingual Xenova Whisper models. CPU/WASM with one thread works without cross-origin isolation; WebGPU is not enabled in this version. Cancellation terminates the Worker and preserves completed captions. Later runs reload from available cache.

Streaming audio is resampled to mono 16 kHz and processed in one-minute batches. Whisper uses 30-second windows and five-second strides internally. Word timestamps are offset and grouped into captions. Batch boundaries may split words. Silence is skipped; music/noise may produce invented text. Review the output. No speed or accuracy guarantee, especially for 50-minute recordings. Keep the tab open.

Mediabunny 1.61.4 encodes video locally. Noto Sans Bengali loads from Google Fonts. Network is used for libraries/fonts/models, not audio upload. Output is buffered in RAM. Inputs limited to 500 MiB/eight hours; device memory can impose lower limits.

## Verification

Syntax, Bengali SRT round-trip, timestamp boundaries and chunk offsets passed. Real browser: Tiny download and inference completed on a 12-second tone fixture, returning timestamps. This checks runtime integration, not speech accuracy. The retained export engine previously produced a real 12-second MP4 with manually supplied Bengali captions. Bengali speech accuracy and Base/Small performance have not been benchmarked.

Docs: https://huggingface.co/docs/transformers.js/ and https://huggingface.co/Xenova/whisper-base