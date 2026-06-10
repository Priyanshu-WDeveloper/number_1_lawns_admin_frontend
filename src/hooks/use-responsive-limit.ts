import * as React from 'react';

const BREAKPOINTS = [
  { minHeight: 1200, limit: 15 },
  { minHeight: 1060, limit: 15 },
  { minHeight: 960, limit: 13 },
  { minHeight: 900, limit: 12 },
  { minHeight: 860, limit: 11 },
  { minHeight: 768, limit: 10 },
  { minHeight: 660, limit: 9 },
  { minHeight: 0, limit: 6 },
] as const;

export function useResponsiveLimit(): number {
  const [limit, setLimit] = React.useState(() => {
    for (const bp of BREAKPOINTS) {
      if (window.innerHeight >= bp.minHeight) return bp.limit;
    }
    return 6;
  });

  React.useEffect(() => {
    const mqls = BREAKPOINTS.map((bp) =>
      window.matchMedia(`(min-height: ${bp.minHeight}px)`),
    );
    const onChange = () => {
      for (const bp of BREAKPOINTS) {
        if (window.innerHeight >= bp.minHeight) {
          setLimit(bp.limit);
          return;
        }
      }
    };
    mqls.forEach((mql) => mql.addEventListener('change', onChange));
    return () =>
      mqls.forEach((mql) =>
        mql.removeEventListener('change', onChange),
      );
  }, []);
  return limit;
}
