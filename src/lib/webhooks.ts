import { readFile } from 'node:fs/promises';

export function resolveHooks(config: Record<string, string[]>, event: string): string[] {
  return config[event] ?? [];
}

async function loadConfig(): Promise<Record<string, string[]>> {
  const path = process.env.WEBHOOKS_CONFIG_PATH;
  if (!path) return {};
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return {};
  }
}

export async function emit(event: string, data: unknown): Promise<void> {
  const urls = resolveHooks(await loadConfig(), event);
  await Promise.all(
    urls.map((url) =>
      fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ version: 1, type: event, data }),
      }).catch((e) => console.error(`[webhook ${event} → ${url}]`, e)),
    ),
  );
}
