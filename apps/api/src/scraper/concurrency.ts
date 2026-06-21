// Minimal concurrency limiter and jittered delay, the runtime of the politeness
// story (NFR-2). A tiny p-limit equivalent so we do not add a dependency for a
// dozen lines.

export type Limit = <T>(task: () => Promise<T>) => Promise<T>;

// Run at most `concurrency` tasks at once; the rest queue and start as slots free.
export function createLimit(concurrency: number): Limit {
  let active = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    if (active >= concurrency) return;
    const run = queue.shift();
    if (!run) return;
    active++;
    run();
  };

  return <T>(task: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const run = () => {
        task()
          .then(resolve, reject)
          .finally(() => {
            active--;
            next();
          });
      };
      queue.push(run);
      next();
    });
}

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

// A jittered pause between requests so the scrape paces like a human, not a
// flood. Default 800-1500ms.
export function jitterDelay(minMs = 800, maxMs = 1500): Promise<void> {
  // Index-free randomness is fine here; this never needs to be reproducible.
  const span = maxMs - minMs;
  const ms = minMs + Math.floor(Math.random() * (span + 1));
  return sleep(ms);
}
