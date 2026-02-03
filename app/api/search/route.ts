import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { createTokenizer } from '@orama/tokenizers/mandarin';

export const { GET } = createFromSource(source, {
  // 使用 Mandarin tokenizer 支持中文搜索
  // https://docs.orama.com/docs/orama-js/supported-languages
  tokenizer: createTokenizer(),
});
