import { describe, it, expect } from 'vitest';
import { getProvider, ConfigManager } from '../src/interpreter';
import type { Config } from '../src/interpreter';

function baseConfig(overrides: Partial<Config> = {}): Config {
  return {
    provider: 'ollama',
    ollama: { url: 'http://localhost:11434', model: 'llama3' },
    openai: { api_key: '', model: 'gpt-4' },
    anthropic: { api_key: '', model: 'claude-3-5-sonnet-latest' },
    notion: { page_id: '', token: '' },
    github: { repo: '', token: '' },
    ...overrides,
  };
}

describe('getProvider', () => {
  it('returns OllamaProvider for provider=ollama (default)', () => {
    const p = getProvider(baseConfig({ provider: 'ollama' }));
    expect(p.constructor.name).toBe('OllamaProvider');
  });

  it('returns OpenAIProvider for provider=openai', () => {
    const p = getProvider(baseConfig({ provider: 'openai' }));
    expect(p.constructor.name).toBe('OpenAIProvider');
  });

  it('returns AnthropicProvider for provider=anthropic', () => {
    const p = getProvider(baseConfig({ provider: 'anthropic' }));
    expect(p.constructor.name).toBe('AnthropicProvider');
  });

  it('throws on an unsupported provider instead of silently misrouting', () => {
    expect(() => getProvider(baseConfig({ provider: 'gemini' as any }))).toThrow(/Unsupported provider/);
  });
});

describe('ConfigManager.getDefaults', () => {
  it('includes anthropic config so the provider can be selected', () => {
    const d = new ConfigManager().getDefaults();
    expect(d.anthropic).toBeDefined();
    expect(d.anthropic.model).toBeTruthy();
  });

  it('defaults to ollama (local, privacy-safe)', () => {
    const d = new ConfigManager().getDefaults();
    expect(d.provider).toBe('ollama');
  });
});
