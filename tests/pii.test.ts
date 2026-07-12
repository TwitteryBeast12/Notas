import { describe, it, expect } from 'vitest';
import { scrubPII } from '../src/pii';

describe('scrubPII', () => {
  it('redacts password assignments', () => {
    expect(scrubPII('password=supersecret123')).toBe('password=[REDACTED]');
    expect(scrubPII('pwd: hunter2')).toBe('pwd=[REDACTED]');
  });

  it('redacts tokens, secrets, and api keys', () => {
    expect(scrubPII('api_key=sk_live_abc123')).toBe('api_key=[REDACTED]');
    expect(scrubPII('token: ghp_xxxxxxxxxxxx')).toBe('token=[REDACTED]');
    expect(scrubPII('my secret=topsecret')).toBe('my secret=[REDACTED]');
  });

  it('redacts AWS credentials', () => {
    expect(scrubPII('aws_access_key_id=AKIAIOSFODNN7EXAMPLE')).toBe('aws_access_key_id=[REDACTED]');
    expect(scrubPII('aws_secret_access_key=wJalrXUtnFEMI/K7MDENG')).toBe('aws_secret_access_key=[REDACTED]');
  });

  it('redacts Bearer tokens and SSH keys', () => {
    expect(scrubPII('Authorization: Bearer eyJhbGciOi')).toBe('Authorization: Bearer [REDACTED]');
    expect(scrubPII('ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB')).toBe('ssh-rsa [REDACTED]');
  });

  it('redacts PEM private keys', () => {
    const key = '-----BEGIN RSA PRIVATE KEY-----\nMIIEogIBAAKCAQEA\n-----END RSA PRIVATE KEY-----';
    expect(scrubPII(key)).toBe('[PRIVATE KEY REDACTED]');
  });

  it('redacts connection strings, emails, and IPs', () => {
    expect(scrubPII('postgres://user:pass@db:5432/app')).toBe('[CONNECTION STRING REDACTED]');
    expect(scrubPII('contact me at jane.doe@example.com')).toBe('contact me at [EMAIL REDACTED]');
    expect(scrubPII('server at 10.0.1.149 is up')).toBe('server at [IP REDACTED] is up');
  });

  it('redacts exported env vars and long base64', () => {
    expect(scrubPII('export GITHUB_TOKEN=ghp_123')).toBe('export [VAR]=[REDACTED]');
    expect(scrubPII('data: ' + 'YWJjZGVm'.repeat(8))).toContain('[BASE64 REDACTED]');
  });

  it('leaves benign text untouched', () => {
    const text = 'run npm install && notas stop 42';
    expect(scrubPII(text)).toBe(text);
  });
});
