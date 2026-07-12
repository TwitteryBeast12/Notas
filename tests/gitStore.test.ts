import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { initVault, commitDraft, pushVault, vaultStatus } from '../src/gitStore';

let vault: string;
beforeEach(() => {
  vault = mkdtempSync(join(tmpdir(), 'notas-vault-'));
});
afterEach(() => {
  rmSync(vault, { recursive: true, force: true });
});

describe('initVault', () => {
  it('creates a git repo on first call, idempotent on second', () => {
    expect(initVault(vault).created).toBe(true);
    expect(existsSync(join(vault, '.git'))).toBe(true);
    // Second call is a no-op (already initialized).
    expect(initVault(vault).created).toBe(false);
  });
});

describe('commitDraft', () => {
  it('commits a draft and returns a sha', () => {
    initVault(vault);
    const res = commitDraft('sess1', '# Draft\nHello', vault);
    expect(res.committed).toBe(true);
    expect(res.sha).toBeTruthy();
    expect(existsSync(join(vault, 'session_sess1_runbook.md'))).toBe(true);
  });

  it('does NOT re-commit when content is unchanged', () => {
    initVault(vault);
    commitDraft('sess1', 'same', vault);
    const second = commitDraft('sess1', 'same', vault);
    expect(second.committed).toBe(false);
  });

  it('commits again when content changes', () => {
    initVault(vault);
    commitDraft('sess1', 'v1', vault);
    const third = commitDraft('sess1', 'v2', vault);
    expect(third.committed).toBe(true);
  });
});

describe('vaultStatus', () => {
  it('reports not-initialized vs commit count', () => {
    expect(vaultStatus(vault)).toContain('not initialized');
    initVault(vault);
    commitDraft('a', 'x', vault);
    const status = vaultStatus(vault);
    expect(status).toContain('commits=');
    // 2 commits: init + the draft.
    expect(status).toContain('commits=2');
  });
});

describe('pushVault (privacy-safe)', () => {
  it('refuses to push when no remote is configured', () => {
    initVault(vault);
    const res = pushVault(undefined, vault);
    expect(res.pushed).toBe(false);
    expect(res.message).toMatch(/local|remain/i);
  });
});
