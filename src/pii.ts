/**
 * PII / secret scrubber.
 *
 * Strips credentials, tokens, keys, and other sensitive values from text before
 * it is persisted to a draft. Pure function — no filesystem or network access —
 * so it can be unit-tested in isolation.
 */
export function scrubPII(text: string): string {
  return text
    .replace(/(password|passwd|pwd)\s*[=:]\s*\S+/gi, '$1=[REDACTED]')
    .replace(/(secret|api_key|apikey|token|auth)\s*[=:]\s*\S+/gi, '$1=[REDACTED]')
    .replace(/(aws_access_key_id|aws_secret_access_key)\s*[=:]\s*\S+/gi, '$1=[REDACTED]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
    .replace(/-----BEGIN (RSA |DSA |EC )?PRIVATE KEY-----[\s\S]*?-----END (RSA |DSA |EC )?PRIVATE KEY-----/gi, '[PRIVATE KEY REDACTED]')
    .replace(/ssh-rsa\s+[A-Za-z0-9+/=]+/gi, 'ssh-rsa [REDACTED]')
    .replace(/(?:mongodb|postgres|mysql|redis):\/\/[^\s"]+/gi, '[CONNECTION STRING REDACTED]')
    .replace(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g, '[EMAIL REDACTED]')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP REDACTED]')
    .replace(/export\s+[A-Z_][A-Z0-9_]*=\S+/gi, 'export [VAR]=[REDACTED]')
    .replace(/[A-Za-z0-9+/]{40,}={0,2}/g, '[BASE64 REDACTED]');
}
