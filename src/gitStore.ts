import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface GitConfig {
  enabled?: boolean;
  /** Optional remote URL. If unset, commits stay LOCAL ONLY (no network). */
  remote?: string;
}

/** Default vault location: a private git repo under ~/.notas/vault */
export function getVaultDir(base?: string): string {
  return base ?? join(homedir(), '.notas', 'vault');
}

function run(vaultDir: string, args: string): string {
  // Inline identity fallback so commits work even when the machine has no
  // global git user.name/user.email configured (e.g. CI runners, fresh installs).
  const identity = `-c user.name="notas" -c user.email="notas@local"`;
  return execSync(`git ${identity} ${args}`, { cwd: vaultDir, encoding: 'utf-8' }).trim();
}

/** Lazily init the vault as a git repo. Idempotent. */
export function initVault(vaultDir: string = getVaultDir()): { created: boolean } {
  mkdirSync(vaultDir, { recursive: true });
  if (!existsSync(join(vaultDir, '.git'))) {
    run(vaultDir, 'init -q');
    // Keep nothing ignored by default — drafts ARE the docs we want versioned.
    writeFileSync(join(vaultDir, '.gitignore'), '# notas vault: commit all drafts\n');
    run(vaultDir, 'add -A');
    try {
      run(vaultDir, 'commit -q -m "notas: initialize local vault"');
    } catch {
      // nothing to commit (empty repo) — fine
    }
    return { created: true };
  }
  return { created: false };
}

/**
 * Write a draft into the vault and commit it. Returns whether a commit was made
 * (false when the content is unchanged from the last commit).
 */
export function commitDraft(
  sessionId: string,
  content: string,
  vaultDir: string = getVaultDir(),
): { committed: boolean; sha?: string } {
  initVault(vaultDir);
  const filename = `session_${sessionId}_runbook.md`;
  const filePath = join(vaultDir, filename);
  const existing = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : '';
  if (existing === content) {
    return { committed: false };
  }
  writeFileSync(filePath, content, 'utf-8');
  run(vaultDir, 'add -A');
  run(vaultDir, `commit -q -m "notas: update ${sessionId} (${new Date().toISOString().split('T')[0]})"`);
  const sha = run(vaultDir, 'rev-parse HEAD');
  return { committed: true, sha };
}

/** Push the vault to its remote. No-op (and warns) if no remote is configured. */
export function pushVault(
  remote?: string,
  vaultDir: string = getVaultDir(),
): { pushed: boolean; message: string } {
  if (!existsSync(join(vaultDir, '.git'))) {
    return { pushed: false, message: 'Vault not initialized. Run "notas git init" first.' };
  }
  if (remote) {
    // Ensure the remote exists / is updated.
    const remotes = run(vaultDir, 'remote').split('\n').filter(Boolean);
    if (!remotes.includes('origin')) {
      run(vaultDir, `remote add origin ${remote}`);
    } else {
      run(vaultDir, `remote set-url origin ${remote}`);
    }
  }
  try {
    run(vaultDir, 'push -q origin HEAD');
    return { pushed: true, message: 'Pushed to origin.' };
  } catch {
    const remotes = run(vaultDir, 'remote').split('\n').filter(Boolean);
    return {
      pushed: false,
      message: remotes.length === 0
        ? 'No remote configured — commits stay local only (private).'
        : 'Push failed (check remote access). Commits remain local.',
    };
  }
}

/** Human-readable status line for the vault. */
export function vaultStatus(vaultDir: string = getVaultDir()): string {
  if (!existsSync(join(vaultDir, '.git'))) return 'not initialized';
  const branch = run(vaultDir, 'rev-parse --abbrev-ref HEAD');
  const count = run(vaultDir, 'rev-list --count HEAD').trim() || '0';
  return `branch=${branch} commits=${count}`;
}
