/**
 * Reads the wall clock.
 *
 * Server components render once per request, so reading the clock there is
 * safe and is the right place to do it: the resulting instant is passed down
 * as a prop, which keeps client components pure and gives the server and the
 * browser the same starting point instead of two clocks that disagree.
 *
 * Client components must never call this during render - they take `serverNow`
 * as a prop and tick forward from it.
 */
export function nowMs(): number {
  return Date.now();
}
