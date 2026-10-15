// Dedicated worker: audio stays on-device. Network is used only to load code/models.
let recognizer, modelName;
self.onmessage = async ({data}) => {
  const {id, type, model, audio, language} = data;
  try {
    if (type === 'load') {
      const {pipeline, env} = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
      env.allowLocalModels = false;
      env.backends.onnx.wasm.numThreads = 1; // GitHub Pages has no cross-origin isolation.
      env.backends.onnx.wasm.proxy = false;
      if (recognizer && modelName !== model) { await recognizer.dispose(); recognizer = null; }
      if (!recognizer) recognizer = await pipeline('automatic-speech-recognition', model, {
        device: 'wasm', dtype: 'q8',
        progress_callback: p => self.postMessage({id, progress: p.status === 'progress' ? `${p.file}: ${Math.round(p.progress || 0)}%` : p.status})
      });
      modelName = model;
      self.postMessage({id, result: true});
    } else if (type === 'transcribe') {
      if (!recognizer) throw new Error('Model is not loaded.');
      const result = await recognizer(audio, {
        language: language === 'auto' ? undefined : language,
        task: 'transcribe', return_timestamps: 'word',
        chunk_length_s: 30, stride_length_s: 5,
        force_full_sequences: false
      });
      self.postMessage({id, result});
    }
  } catch (error) { self.postMessage({id, error: error.message || String(error)}); }
};