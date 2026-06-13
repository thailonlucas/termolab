import { useEffect, useState } from "react";

type PlusFn = (() => void) | null;

let action: PlusFn = null;
const listeners = new Set<() => void>();

function notify() { listeners.forEach((l) => l()); }

export const plusActionStore = {
  set(fn: () => void) { action = fn; notify(); },
  clear() { action = null; notify(); },
  get(): PlusFn { return action; },
};

export function usePlusAction(): PlusFn {
  const [fn, setFn] = useState<PlusFn>(plusActionStore.get());
  useEffect(() => {
    const l = () => setFn(() => plusActionStore.get());
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return fn;
}
