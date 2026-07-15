/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '@playwright/test';
import { EventEmitter } from 'events';
import { Writable } from 'stream';
import { dumpDockerLogs, type SpawnFn } from './docker-logs';
import {
  DEFAULT_READINESS_DELAYS_MS,
  MAX_READINESS_ATTEMPTS,
  POLL_INTERVAL_MS,
  READINESS_CEILING_MS,
  pollFineract,
  pollWebApp,
  ReadinessProbeFailure,
  type FineractProbe,
  type WebAppProbe
} from './readiness';

// Pure-logic specs — they run under the `unit` Playwright project
// (testMatch: /playwright\/utils\/.*\.spec\.ts/ in playwright.config.ts)
// with no browser, no app, no backend. Every I/O dependency (HTTP,
// timers, child_process) is injected so the assertions are
// deterministic and offline.
test.use({ storageState: { cookies: [], origins: [] } });

// ─────────────────────────────────────────────────────────────────────
// readiness.ts — schedule + probe contract
// ─────────────────────────────────────────────────────────────────────

test.describe('readiness constants', () => {
  test('exports the WA-2.5 cadence + ceiling', () => {
    expect(POLL_INTERVAL_MS).toBe(5000);
    expect(MAX_READINESS_ATTEMPTS).toBe(19);
    expect(DEFAULT_READINESS_DELAYS_MS).toHaveLength(MAX_READINESS_ATTEMPTS - 1);
    expect(DEFAULT_READINESS_DELAYS_MS.every((d) => d === POLL_INTERVAL_MS)).toBe(true);
    // 18 × 5s = 90s of retry-schedule sleeping between attempts.
    const totalSleepMs = DEFAULT_READINESS_DELAYS_MS.reduce((a, b) => a + b, 0);
    expect(totalSleepMs).toBe(90_000);
    // Hard wall-clock ceiling is enforced independently via Promise.race.
    expect(READINESS_CEILING_MS).toBe(90_000);
  });
});

test.describe('pollFineract()', () => {
  test('returns on first successful probe (no sleeps)', async () => {
    let calls = 0;
    const sleeps: number[] = [];
    const probe: FineractProbe = async () => {
      calls++;
    };

    await pollFineract({
      probe,
      sleep: async (ms) => {
        sleeps.push(ms);
      }
    });

    expect(calls).toBe(1);
    expect(sleeps).toEqual([]);
  });

  test('retries with a fixed 5s cadence and eventually succeeds', async () => {
    let calls = 0;
    const sleeps: number[] = [];
    const probe: FineractProbe = async () => {
      calls++;
      if (calls < 3) {
        throw new ReadinessProbeFailure('not ready yet');
      }
    };

    await pollFineract({
      probe,
      sleep: async (ms) => {
        sleeps.push(ms);
      }
    });

    expect(calls).toBe(3);
    expect(sleeps).toEqual([
      5000,
      5000
    ]);
  });

  test('honours the 90s ceiling and throws the last probe error', async () => {
    let calls = 0;
    const sleeps: number[] = [];
    const probe: FineractProbe = async () => {
      calls++;
      throw new ReadinessProbeFailure(`attempt ${calls} still not ready`);
    };

    await expect(
      pollFineract({
        probe,
        sleep: async (ms) => {
          sleeps.push(ms);
        }
      })
    ).rejects.toThrow(/attempt 19 still not ready/);

    expect(calls).toBe(MAX_READINESS_ATTEMPTS);
    expect(sleeps).toHaveLength(MAX_READINESS_ATTEMPTS - 1);
    expect(sleeps.every((ms) => ms === POLL_INTERVAL_MS)).toBe(true);
    expect(sleeps.reduce((a, b) => a + b, 0)).toBe(90_000);
  });

  test('treats permanent-looking errors (e.g. 401) as transient during boot', async () => {
    // During boot the tenant DB may still be migrating and return
    // 401/4xx — these must NOT short-circuit retry the way the
    // default `classifyError` would. `pollFineract` pins
    // classify: () => 'transient' so it retries through them.
    let calls = 0;
    const probe: FineractProbe = async () => {
      calls++;
      if (calls < 2) {
        const err = new Error('boot 401') as Error & { status: number };
        err.status = 401;
        throw err;
      }
    };

    await pollFineract({
      probe,
      delaysMs: [1],
      maxAttempts: 3,
      sleep: async () => undefined
    });
    expect(calls).toBe(2);
  });

  test('forwards configured Fineract URL + tenant + credentials to the probe', async () => {
    const received: unknown[] = [];
    const probe: FineractProbe = async (input) => {
      received.push(input);
    };

    await pollFineract({
      url: 'https://fineract.test:9443',
      tenantId: 'acme',
      username: 'svc-e2e',
      password: 'hunter2',
      probe,
      sleep: async () => undefined
    });

    expect(received).toEqual([
      {
        url: 'https://fineract.test:9443',
        tenantId: 'acme',
        username: 'svc-e2e',
        password: 'hunter2'
      }
    ]);
  });

  test('reports onRetry per failed attempt with diagnostic info', async () => {
    const attempts: number[] = [];
    let calls = 0;
    const probe: FineractProbe = async () => {
      calls++;
      if (calls < 3) throw new ReadinessProbeFailure('warming up');
    };
    await pollFineract({
      probe,
      sleep: async () => undefined,
      onRetry: (info) => attempts.push(info.attempt)
    });
    expect(attempts).toEqual([
      1,
      2
    ]);
  });

  test('rejects with a ceiling error when the hard deadline fires before retries exhaust', async () => {
    // Probe that never resolves — simulates a completely hung backend.
    const probe: FineractProbe = () => new Promise(() => {});

    await expect(
      pollFineract({
        probe,
        ceilingMs: 20,
        delaysMs: [
          5000,
          5000,
          5000
        ] // would never exhaust if the hard ceiling didn't fire first
      })
    ).rejects.toThrow(/hard ceiling of 20ms/);
  });
});

test.describe('pollWebApp()', () => {
  test('returns on first successful probe', async () => {
    let calls = 0;
    const probe: WebAppProbe = async () => {
      calls++;
    };
    await pollWebApp({ probe, sleep: async () => undefined });
    expect(calls).toBe(1);
  });

  test('retries on failure and honours the same 90s ceiling', async () => {
    let calls = 0;
    const sleeps: number[] = [];
    const probe: WebAppProbe = async () => {
      calls++;
      throw new ReadinessProbeFailure('web-app warming');
    };
    await expect(
      pollWebApp({
        probe,
        sleep: async (ms) => {
          sleeps.push(ms);
        }
      })
    ).rejects.toThrow(/web-app warming/);
    expect(calls).toBe(MAX_READINESS_ATTEMPTS);
    expect(sleeps.reduce((a, b) => a + b, 0)).toBe(90_000);
  });

  test('forwards configured base URL to the probe', async () => {
    const received: unknown[] = [];
    const probe: WebAppProbe = async (input) => {
      received.push(input);
    };
    await pollWebApp({
      url: 'http://web-app.test:4200',
      probe,
      sleep: async () => undefined
    });
    expect(received).toEqual([{ url: 'http://web-app.test:4200' }]);
  });
});

test.describe('ReadinessProbeFailure', () => {
  test('preserves its name and message', () => {
    const err = new ReadinessProbeFailure('boom');
    expect(err.name).toBe('ReadinessProbeFailure');
    expect(err.message).toBe('boom');
    expect(err).toBeInstanceOf(Error);
  });
});

// ─────────────────────────────────────────────────────────────────────
// docker-logs.ts — diagnostic helper, must never throw
// ─────────────────────────────────────────────────────────────────────

/** Captures everything written to it so assertions can grep the output. */
class CapturingStream extends Writable {
  chunks: string[] = [];
  _write(chunk: Buffer | string, _enc: string, cb: (e?: Error | null) => void): void {
    this.chunks.push(typeof chunk === 'string' ? chunk : chunk.toString('utf-8'));
    cb();
  }
  text(): string {
    return this.chunks.join('');
  }
}

/**
 * Minimal stand-in for a `ChildProcessWithoutNullStreams`. We only
 * need `stdout`, `stderr`, `kill`, and event emission for `'error'`
 * and `'close'`.
 */
class FakeChild extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  killed = false;
  kill(_signal?: string): boolean {
    this.killed = true;
    return true;
  }
}

test.describe('dumpDockerLogs()', () => {
  test('spawns `docker compose -f <file> logs --tail=<n> <service>` with the right args', async () => {
    const calls: { command: string; args: readonly string[] }[] = [];
    const stdout = new CapturingStream();

    const spawnImpl = ((command: string, args: readonly string[]) => {
      calls.push({ command, args });
      const child = new FakeChild();
      // Fire the close handler on next tick so dumpDockerLogs resolves.
      setImmediate(() => child.emit('close', 0));
      return child as unknown as ReturnType<SpawnFn>;
    }) as SpawnFn;

    await dumpDockerLogs({
      composeFile: 'docker-compose.e2e.yml',
      service: 'fineract',
      spawnImpl,
      stdout,
      stderr: stdout
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].command).toBe('docker');
    expect(calls[0].args).toEqual([
      'compose',
      '-f',
      'docker-compose.e2e.yml',
      'logs',
      '--tail=200',
      '--no-color',
      'fineract'
    ]);
    const out = stdout.text();
    expect(out).toContain('===== docker compose -f docker-compose.e2e.yml logs --tail=200 --no-color fineract =====');
    expect(out).toContain('===== end docker compose logs (fineract) =====');
  });

  test('streams child stdout + stderr to the configured streams', async () => {
    const stdout = new CapturingStream();
    const stderr = new CapturingStream();

    const spawnImpl = (() => {
      const child = new FakeChild();
      setImmediate(() => {
        child.stdout.emit('data', Buffer.from('hello from fineract\n'));
        child.stderr.emit('data', Buffer.from('oops on stderr\n'));
        child.emit('close', 0);
      });
      return child as unknown as ReturnType<SpawnFn>;
    }) as SpawnFn;

    await dumpDockerLogs({
      service: 'fineract',
      spawnImpl,
      stdout,
      stderr
    });

    expect(stdout.text()).toContain('hello from fineract');
    expect(stderr.text()).toContain('oops on stderr');
  });

  test('tolerates ENOENT (no docker binary) without throwing', async () => {
    const stdout = new CapturingStream();
    const spawnImpl = (() => {
      const child = new FakeChild();
      setImmediate(() => {
        const e = new Error('spawn docker ENOENT') as NodeJS.ErrnoException;
        e.code = 'ENOENT';
        child.emit('error', e);
      });
      return child as unknown as ReturnType<SpawnFn>;
    }) as SpawnFn;

    await expect(
      dumpDockerLogs({
        service: 'fineract',
        spawnImpl,
        stdout,
        stderr: stdout
      })
    ).resolves.toBeUndefined();

    expect(stdout.text()).toContain('(docker compose logs unavailable: ENOENT)');
  });

  test('tolerates a synchronous throw from the spawn implementation', async () => {
    const stdout = new CapturingStream();
    const spawnImpl = (() => {
      const e = new Error('synchronous spawn failure') as NodeJS.ErrnoException;
      e.code = 'EACCES';
      throw e;
    }) as SpawnFn;

    await expect(
      dumpDockerLogs({
        service: 'fineract',
        spawnImpl,
        stdout,
        stderr: stdout
      })
    ).resolves.toBeUndefined();

    expect(stdout.text()).toContain('(docker compose logs unavailable: EACCES)');
  });

  test('kills the child and resolves on timeout', async () => {
    const stdout = new CapturingStream();
    let captured: FakeChild | undefined;
    const spawnImpl = (() => {
      const child = new FakeChild();
      captured = child;
      // Deliberately never emit 'close' so the timeout path fires.
      return child as unknown as ReturnType<SpawnFn>;
    }) as SpawnFn;

    await dumpDockerLogs({
      service: 'fineract',
      timeoutMs: 20,
      spawnImpl,
      stdout,
      stderr: stdout
    });

    expect(captured?.killed).toBe(true);
    expect(stdout.text()).toContain('(docker compose logs timed out after 20ms — killing child)');
  });

  test('honours custom composeFile, service, and tail for React-port reuse', async () => {
    const calls: { command: string; args: readonly string[] }[] = [];
    const stdout = new CapturingStream();
    const spawnImpl = ((command: string, args: readonly string[]) => {
      calls.push({ command, args });
      const child = new FakeChild();
      setImmediate(() => child.emit('close', 0));
      return child as unknown as ReturnType<SpawnFn>;
    }) as SpawnFn;

    await dumpDockerLogs({
      composeFile: 'mifos-x-web-app-react/docker-compose.e2e.yml',
      service: 'backend',
      tail: 50,
      spawnImpl,
      stdout,
      stderr: stdout
    });

    expect(calls[0].args).toEqual([
      'compose',
      '-f',
      'mifos-x-web-app-react/docker-compose.e2e.yml',
      'logs',
      '--tail=50',
      '--no-color',
      'backend'
    ]);
  });

  test('reports a non-zero exit code without throwing', async () => {
    const stdout = new CapturingStream();
    const spawnImpl = (() => {
      const child = new FakeChild();
      setImmediate(() => child.emit('close', 1));
      return child as unknown as ReturnType<SpawnFn>;
    }) as SpawnFn;

    await dumpDockerLogs({
      service: 'fineract',
      spawnImpl,
      stdout,
      stderr: stdout
    });

    expect(stdout.text()).toContain('(docker compose logs exited with code 1)');
  });

  test('resolves even when the output stream throws on every write', async () => {
    // Verify that a misconfigured / closed stream cannot cause
    // dumpDockerLogs to reject — the helper must never throw.
    class ThrowingStream extends Writable {
      _write(_c: unknown, _e: string, cb: (e?: Error | null) => void): void {
        cb(new Error('stream closed'));
      }
      override write(_c: unknown): boolean {
        throw new Error('stream closed');
      }
    }
    const throwing = new ThrowingStream();
    const spawnImpl = (() => {
      const child = new FakeChild();
      setImmediate(() => {
        child.stdout.emit('data', Buffer.from('log line\n'));
        child.emit('close', 0);
      });
      return child as unknown as ReturnType<SpawnFn>;
    }) as SpawnFn;

    await expect(
      dumpDockerLogs({
        service: 'fineract',
        spawnImpl,
        stdout: throwing,
        stderr: throwing
      })
    ).resolves.toBeUndefined();
  });
});
