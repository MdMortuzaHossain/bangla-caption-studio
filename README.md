# বাংলা Caption Studio

Live app: https://mdmortuzahossain.github.io/bangla-caption-studio/

Turn audio into a waveform video with Bengali subtitles burned into the bottom of each frame. Separate from the existing waveform application.

## Use

1. Open in current desktop Chrome/Edge and select audio.
2. Enter your own OpenAI API key in the app, select Bengali, then generate subtitles. API billing applies and audio is sent directly to OpenAI.
3. Automatic video export is enabled by default. Uncheck it to review captions first.
4. Correct text/timing in the SRT editor and apply it. Regenerate video without another transcription charge. SRT import/export works without a key.
5. Customize captions, nine waveform styles, backgrounds, resolution, FPS, compression and MP4/WebM format.

## Implementation

Single static HTML; GitHub Pages main/root. Pinned Mediabunny 1.61.4 handles audio decoding and WebCodecs export. Noto Sans Bengali renders captions. OpenAI whisper-1 returns word/segment timestamps. Audio is resampled to mono 16 kHz WAV and sent sequentially in two-minute chunks (~3.84 MB each). Timestamp offsets are restored and words grouped into short captions. Chunk boundaries may split words; review generated captions. Silent chunks are skipped.

Processing is not real-time playback. Speed/accuracy depend on device, network, speech and API. No exact speed/size guarantee. Final output is buffered in RAM. Inputs limited to 500 MiB/eight hours; device memory may impose lower limits. Start with 360p/12 FPS/Small for long audio.

## Key handling

Personal bring-your-own-key client, not a public service using the owner's key. Keys are entered at runtime, sent only to api.openai.com, and never intentionally persisted or committed. Browser extensions/page scripts can access runtime keys: use a restricted project key and spend limits, then clear it after use. Never put a shared key in this code. A multi-user service needs an authenticated backend for credentials/billing controls. Cancel aborts the browser request; processed API usage may still be billed. Transcribing again can incur another charge. Partial captions remain available after failure/cancellation.

## Verification

- Bengali SRT round-trip, timestamp boundaries, invalid times, WAV length and chunk offsets tested.
- Mocked API test: 121-second fixture, two bounded requests, Bengali model/language/timestamp fields, offsets and cleanup.
- Browser: real 12-second MP4 export with manually supplied Bengali captions; 640x360 and readable burned-in text.
- Live paid transcription was not tested because no API key was provided.

API documentation: https://developers.openai.com/api/docs/guides/speech-to-text