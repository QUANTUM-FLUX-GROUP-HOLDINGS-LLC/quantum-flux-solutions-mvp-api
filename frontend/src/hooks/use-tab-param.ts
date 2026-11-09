import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Syncs the active tab with the ?tab= URL query parameter, so tabs are
// shareable and survive refresh/back navigation. Pass `allowed` to
// reject unknown ?tab= values coming from hand-crafted external links.
export function useTabParam<T extends string>(defaultTab: T, allowed?: readonly T[]) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<T>(defaultTab);

  useEffect(() => {
    if (!router.isReady) return;
    const urlTab = typeof router.query.tab === 'string' ? router.query.tab : '';
    if (urlTab && (!allowed || allowed.includes(urlTab as T))) {
      setActiveTab(urlTab as T);
    } else if (!urlTab) {
      setActiveTab(defaultTab);
    }
  }, [router.isReady, router.query.tab, defaultTab, allowed]);

  const changeTab = useCallback(
    (next: T) => {
      setActiveTab(next);
      const query = { ...router.query, tab: next };
      router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
    },
    [router],
  );

  return [activeTab, changeTab] as const;
}
