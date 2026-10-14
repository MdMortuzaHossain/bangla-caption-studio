// Dedicated worker: audio stays on-device. Network is used only to load code/models.
let recognizer, modelName, bengaliSuppression;
// Prevent romanized output at decoding time, not by changing the display font.
function scriptSuppression(pipe) {
  const config = pipe.model.generation_config || pipe.model.config;
  const eos = Array.isArray(config.eos_token_id) ? config.eos_token_id[0] : config.eos_token_id;
  if (!Number.isInteger(eos) || eos <= 0) throw new Error('Tokenizer configuration is missing.');
  const blocked = new Set(config.suppress_tokens || []);
  for (let id = 0; id < eos; id++) {
    const text = pipe.tokenizer.decode([id], {skip_special_tokens: false});
    // Leave Bengali byte fragments, punctuation, digits, and control tokens intact.
    if (/[A-Za-z]/.test(text)) blocked.add(id);
  }
  return [...blocked];
}
self.onmessage = async ({data}) => {
  const {id, type, model, audio, language} = data;
  try {
    if (type === 'load') {
      const {pipeline, env} = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
      env.allowLocalModels = false;
      env.backends.onnx.wasm.numThreads = 1; // GitHub Pages has no cross-origin isolation.
      env.backends.onnx.wasm.proxy = false;
      if (recognizer && modelName !== model) { await recognizer.dispose(); recognizer = null; bengaliSuppression = null; }
      if (!recognizer) recognizer = await pipeline('automatic-speech-recognition', model, {
        device: 'wasm', dtype: 'q8',
        progress_callback: p => self.postMessage({id, progress: p.status === 'progress' ? `${p.file}: ${Math.round(p.progress || 0)}%` : p.status})
      });
      modelName = model;
      self.postMessage({id, result: true});
    } else if (type === 'transcribe') {
      if (!recognizer) throw new Error('Model is not loaded.');
      const bangla = language === 'bn';
      if (bangla && !bengaliSuppression) bengaliSuppression = scriptSuppression(recognizer);
      const result = await recognizer(audio, {
        language: bangla ? 'bengali' : language === 'auto' ? undefined : language,
        ...(bangla ? {suppress_tokens: bengaliSuppression} : {}),
        task: 'transcribe', return_timestamps: 'word',
        chunk_length_s: 30, stride_length_s: 5,
        force_full_sequences: false
      });
      const text = (result.chunks || []).map(c => c.text).join(' ') || result.text || '';
      if (bangla && (/[A-Za-z]/.test(text) || (text.trim() && !/[\u0980-\u09ff]/.test(text)))) {
        throw new Error('বাংলা অক্ষরে নির্ভরযোগ্য ফল পাওয়া যায়নি। Small মডেলে আবার চেষ্টা করুন; ভুল ফল ভিডিওতে পাঠানো হয়নি।');
      }
      self.postMessage({id, result});
    }
  } catch (error) { self.postMessage({id, error: error.message || String(error)}); }
};