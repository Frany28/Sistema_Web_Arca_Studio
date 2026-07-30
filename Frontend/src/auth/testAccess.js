export function resolveRouteAuthDisabledForTests({
  dev = false,
  requested = false,
} = {}) {
  return Boolean(dev && requested);
}
