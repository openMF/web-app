/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { spawn, type ChildProcessWithoutNullStreams, type SpawnOptions } from 'child_process';

/**
 * On-timeout diagnostics helper for the Playwright global setup.
 *
 * Design goals:
 *  - When `pollFineract()` / `pollWebApp()` give up after 90 s, the
 *    very next thing developers and CI need is the last ~200 lines
 *    of the Fineract container log. Shelling out to
 *    `docker compose logs` keeps the implementation honest — no
 *    Docker SDK dependency, no parsing of compose state — and matches
 *    the existing `e2e:docker:logs` npm script.
 *  - The helper must never throw. A missing `docker` binary, a
 *    renamed compose file, or a Docker daemon that's down should
 *    degrade to a one-line warning so the original readiness error
 *    (the thing developers actually need) is what surfaces in CI.
 *  - Parameters (compose file path, service name, tail size, output
 *    stream, spawn implementation) are all injectable. The React port
 *    can reuse this helper verbatim against its own compose file by
 *    passing different values — no Angular- or Fineract-specific
 *    assumption is baked in.
 */

/** Type alias matching the subset of `spawn` we actually need. */
export type SpawnFn = (
  command: string,
  args: readonly string[],
  options?: SpawnOptions
) => ChildProcessWithoutNullStreams;

export interface DumpDockerLogsOptions {
  /** Compose service whose logs should be dumped (e.g. `'fineract'`). */
  service: string;
  /** Compose file path, resolved relative to CWD. Defaults to `'docker-compose.e2e.yml'`. */
  composeFile?: string;
  /** Number of trailing log lines to request. Defaults to 200. */
  tail?: number;
  /** Hard kill-switch for the child process, in ms. Defaults to 15 000. */
  timeoutMs?: number;
  /** Where to write the banner + child stdout. Defaults to `process.stderr`. */
  stdout?: NodeJS.WritableStream;
  /** Where to write the child stderr. Defaults to `process.stderr`. */
  stderr?: NodeJS.WritableStream;
  /** Injectable spawn for unit tests. Defaults to `child_process.spawn`. */
  spawnImpl?: SpawnFn;
}

/**
 * Spawn `docker compose -f <composeFile> logs --tail=<n> <service>`
 * and stream its output to {@link DumpDockerLogsOptions.stdout}
 * (defaults to stderr so it lands next to Playwright's failure
 * banner in CI).
 *
 * Always resolves — never rejects. Failure modes:
 *  - Docker binary missing (`ENOENT`) → soft warning, resolve.
 *  - Child exits non-zero (e.g. unknown service) → soft warning,
 *    resolve (the stderr it printed already explains why).
 *  - Wall-clock {@link DumpDockerLogsOptions.timeoutMs} exceeded →
 *    SIGKILL the child, soft warning, resolve.
 */
export async function dumpDockerLogs(options: DumpDockerLogsOptions): Promise<void> {
  const composeFile = options.composeFile ?? 'docker-compose.e2e.yml';
  const tail = options.tail ?? 200;
  const timeoutMs = options.timeoutMs ?? 15_000;
  const out = options.stdout ?? process.stderr;
  const err = options.stderr ?? process.stderr;
  const spawnFn = options.spawnImpl ?? (spawn as unknown as SpawnFn);

  const args: readonly string[] = [
    'compose',
    '-f',
    composeFile,
    'logs',
    `--tail=${tail}`,
    '--no-color',
    options.service
  ];

  // best-effort write — stream errors must never mask the original
  // readiness failure that triggered this diagnostic call.
  const safeWrite = (stream: NodeJS.WritableStream, data: string | Buffer): void => {
    try {
      stream.write(data);
    } catch {
      // intentionally swallowed
    }
  };

  safeWrite(out, `\n===== docker ${args.join(' ')} =====\n`);

  return new Promise<void>((resolve) => {
    let child: ChildProcessWithoutNullStreams;
    try {
      child = spawnFn('docker', args, { stdio: [
          'ignore',
          'pipe',
          'pipe'
        ] });
    } catch (e) {
      // Synchronous throws from spawn are rare (most failures come
      // through the 'error' event) but possible — handle them the
      // same way: warn and resolve.
      const code = (e as NodeJS.ErrnoException).code;
      safeWrite(out, `(docker compose logs unavailable: ${code ?? String(e)})\n`);
      resolve();
      return;
    }

    let settled = false;
    const settle = (): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      safeWrite(out, `===== end docker compose logs (${options.service}) =====\n`);
      resolve();
    };

    const timer = setTimeout(() => {
      if (settled) return;
      safeWrite(out, `(docker compose logs timed out after ${timeoutMs}ms — killing child)\n`);
      try {
        child.kill('SIGKILL');
      } catch {
        // Best-effort; the close handler will still resolve us.
      }
      settle();
    }, timeoutMs);

    child.stdout.on('data', (chunk: Buffer) => safeWrite(out, chunk));
    child.stderr.on('data', (chunk: Buffer) => safeWrite(err, chunk));

    child.on('error', (e: NodeJS.ErrnoException) => {
      if (settled) return;
      // ENOENT is the canonical "no docker binary on PATH" case
      // (local dev without Docker, or running against a manually
      // started backend). Treat every spawn-side error the same way:
      // soft warning, resolve.
      safeWrite(out, `(docker compose logs unavailable: ${e.code ?? e.message})\n`);
      settled = true;
      clearTimeout(timer);
      resolve();
    });

    child.on('close', (code) => {
      if (settled) return;
      if (code !== 0 && code !== null) {
        safeWrite(out, `(docker compose logs exited with code ${code})\n`);
      }
      settle();
    });
  });
}
