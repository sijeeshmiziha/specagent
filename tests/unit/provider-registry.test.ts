import { describe, expect, it, vi, afterEach } from 'vitest';
import { detectProvider, resolveProviderConfig } from '../../src/lib/models/provider-registry.js';

describe('Provider Registry', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('detects anthropic from env', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('GOOGLE_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('OLLAMA_HOST', '');
    expect(detectProvider()).toBe('anthropic');
  });

  it('detects openai from env', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
    vi.stubEnv('GOOGLE_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('OLLAMA_HOST', '');
    expect(detectProvider()).toBe('openai');
  });

  it('detects gemini from GOOGLE_API_KEY', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('GOOGLE_API_KEY', 'test-key');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('OLLAMA_HOST', '');
    expect(detectProvider()).toBe('gemini');
  });

  it('detects gemini from GEMINI_API_KEY', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('GOOGLE_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubEnv('OLLAMA_HOST', '');
    expect(detectProvider()).toBe('gemini');
  });

  it('resolves config with explicit provider', () => {
    const config = resolveProviderConfig({ provider: 'anthropic', apiKey: 'test' });
    expect(config.provider).toBe('anthropic');
    expect(config.model).toBe('claude-sonnet-4-20250514');
  });

  it('resolves gemini config with default model', () => {
    const config = resolveProviderConfig({ provider: 'gemini', apiKey: 'test' });
    expect(config.provider).toBe('gemini');
    expect(config.model).toBe('gemini-2.5-flash');
  });

  it('resolves config with model override', () => {
    const config = resolveProviderConfig({
      provider: 'openai',
      model: 'gpt-4-turbo',
      apiKey: 'test',
    });
    expect(config.model).toBe('gpt-4-turbo');
  });

  it('throws when no provider available', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('GOOGLE_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('OLLAMA_HOST', '');
    expect(() => resolveProviderConfig()).toThrow('No LLM provider detected');
  });
});
