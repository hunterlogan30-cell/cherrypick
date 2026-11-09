import { NbaGame, SmartAlert, UserSettings } from '../types/nba';
import {
  DEFAULT_USER_SETTINGS,
  FIGMA_GAMES_LIVE,
} from '../data/mockFigmaData';

export interface AppStateSnapshot {
  settings: UserSettings;
  games: NbaGame[];
  activeAlert: SmartAlert | null;
  lastUpdated: number;
  isLiveApiFallback: boolean;
}

const STORAGE_KEY = 'cherrypick_state_v3';

const isChromeExtension =
  typeof chrome !== 'undefined' &&
  Boolean(chrome.storage && chrome.storage.local);

export function getInitialSnapshot(): AppStateSnapshot {
  return {
    settings: DEFAULT_USER_SETTINGS,
    games: FIGMA_GAMES_LIVE,
    activeAlert: null,
    lastUpdated: Date.now(),
    isLiveApiFallback: false,
  };
}

export async function loadState(): Promise<AppStateSnapshot> {
  if (isChromeExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (res) => {
        if (res && res[STORAGE_KEY]) {
          resolve({
            ...getInitialSnapshot(),
            ...res[STORAGE_KEY],
          });
        } else {
          resolve(getInitialSnapshot());
        }
      });
    });
  } else {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return {
          ...getInitialSnapshot(),
          ...JSON.parse(raw),
        };
      }
    } catch {
      // ignore
    }
    return getInitialSnapshot();
  }
}

let saveStateQueue = Promise.resolve<AppStateSnapshot>(getInitialSnapshot());

export function saveState(
  partial: Partial<AppStateSnapshot>
): Promise<AppStateSnapshot> {
  saveStateQueue = saveStateQueue.then(async () => {
    const current = await loadState();
    const next: AppStateSnapshot = {
      ...current,
      ...partial,
      settings: partial.settings
        ? { ...current.settings, ...partial.settings }
        : current.settings,
      lastUpdated: Date.now(),
    };

    if (isChromeExtension) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set(
          {
            [STORAGE_KEY]: next,
            cherrypick_state_v2: next,
            cherrypick_state_v1: next,
          },
          () => resolve()
        );
      });
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(
          new CustomEvent('cherrypick-state-change', { detail: next })
        );
      } catch {
        // ignore
      }
    }
    return next;
  });
  return saveStateQueue;
}

export function subscribeToState(
  callback: (state: AppStateSnapshot) => void
): () => void {
  if (isChromeExtension) {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local' && changes[STORAGE_KEY]?.newValue) {
        callback(changes[STORAGE_KEY].newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  } else {
    const customListener = (e: Event) => {
      const ce = e as CustomEvent<AppStateSnapshot>;
      if (ce.detail) callback(ce.detail);
    };
    const storageListener = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          callback(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('cherrypick-state-change', customListener);
    window.addEventListener('storage', storageListener);
    return () => {
      window.removeEventListener('cherrypick-state-change', customListener);
      window.removeEventListener('storage', storageListener);
    };
  }
}

