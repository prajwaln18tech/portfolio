// Runs the sentence-embedding model off the main thread so scrolling and animations stay smooth.
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0';

env.allowLocalModels = false;
let extractor = null;

self.onmessage = async ({ data }) => {
  const { id, type } = data;
  try {
    if (type === 'init') {
      if (!extractor) {
        extractor = await pipeline('feature-extraction', data.model, {
          dtype: 'q8',
          progress_callback: (p) => {
            if (p.status === 'progress' && p.total) self.postMessage({ type: 'progress', file: p.file, loaded: p.loaded, total: p.total });
          },
        });
      }
      self.postMessage({ id, ok: true });
    } else if (type === 'embed') {
      const t = await extractor(data.texts, { pooling: 'mean', normalize: true });
      const out = new Float32Array(t.data);
      self.postMessage({ id, ok: true, data: out, dim: t.dims[t.dims.length - 1] }, [out.buffer]);
    }
  } catch (err) {
    self.postMessage({ id, ok: false, error: String((err && err.message) || err) });
  }
};
