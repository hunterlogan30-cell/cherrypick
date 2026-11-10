import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  AppStateSnapshot,
  getInitialSnapshot,
  loadState,
  saveState,
  subscribeToState,
} from '../services/storageService';
import { FloatingWidgetContainer } from '../components/FloatingWidgetContainer';
import { injectStylesInto, ensureInterFontsLoaded } from '../styles/cherrypickStyles';
import {
  detectSmartAlerts,
  mergeGamesMonotonically,
  tickLiveGamesOneSecond,
} from '../services/espnNbaService';

const ContentOverlayApp: React.FC = () => {
  const [snapshot, setSnapshot] = useState<AppStateSnapshot | null>(null);

  useEffect(() => {
    let mounted = true;
    loadState().then((initial) => {
      if (!mounted) return;
      setSnapshot(initial);
    });
    const unsub = subscribeToState((next) => {
      if (!mounted) return;
      setSnapshot((prev) => {
        if (!prev) return next;
        return {
          ...next,
          games: mergeGamesMonotonically(prev.games, next.games),
        };
      });
    });
    const clockTimer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (typeof chrome !== 'undefined' && !chrome.runtime?.id) {
        clearInterval(clockTimer);
        return;
      }
      setSnapshot((prev) => {
        if (!prev) return prev;
        const nextGames = tickLiveGamesOneSecond(prev.games);
        if (nextGames === prev.games) return prev;
        const tickAlerts = detectSmartAlerts(
          prev.games,
          nextGames,
          prev.settings
        );
        if (tickAlerts.length > 0) {
          const latest = tickAlerts[tickAlerts.length - 1];
          saveState({ activeAlert: latest }).catch(() => {});
          return { ...prev, games: nextGames, activeAlert: latest };
        }
        return { ...prev, games: nextGames };
      });
    }, 1000);

    // Trigger real-time ESPN poll via background service worker every 6s when tab is active
    const requestBackgroundPoll = () => {
      if (
        document.visibilityState === 'visible' &&
        typeof chrome !== 'undefined' &&
        chrome.runtime?.id &&
        chrome.runtime?.sendMessage
      ) {
        try {
          const p = chrome.runtime.sendMessage({ type: 'POLL_NBA_NOW' });
          if (p && typeof p.catch === 'function') {
            p.catch(() => {});
          }
        } catch {
          // Ignore if extension context was invalidated on reload
        }
      }
    };

    requestBackgroundPoll();
    const pollTimer = setInterval(requestBackgroundPoll, 6000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        requestBackgroundPoll();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const messageListener = (
      message: { type?: string },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void
    ) => {
      if (
        message?.type === 'SHOW_FLOATING_WIDGET' ||
        message?.type === 'OPEN_POPUP_PANEL' ||
        message?.type === 'TOGGLE_POPUP_PANEL'
      ) {
        setSnapshot((prev) => {
          if (!prev) return prev;
          const next: AppStateSnapshot = {
            ...prev,
            settings: {
              ...prev.settings,
              overlayVisible: true,
            },
          };
          saveState({ settings: next.settings }).catch(() => {});
          return next;
        });
        sendResponse({ ok: true, version: 5 });
      }
      return false;
    };

    if (
      typeof chrome !== 'undefined' &&
      chrome.runtime?.id &&
      chrome.runtime?.onMessage
    ) {
      try {
        chrome.runtime.onMessage.addListener(messageListener);
      } catch {}
    }

    return () => {
      mounted = false;
      unsub();
      clearInterval(clockTimer);
      clearInterval(pollTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (
        typeof chrome !== 'undefined' &&
        chrome.runtime?.id &&
        chrome.runtime?.onMessage
      ) {
        try {
          chrome.runtime.onMessage.removeListener(messageListener);
        } catch {}
      }
    };
  }, []);

  // Auto-dismiss active callout notification after 6 seconds
  useEffect(() => {
    if (!snapshot?.activeAlert) return;
    const timer = setTimeout(() => {
      saveState({ activeAlert: null }).catch(() => {});
    }, 6000);
    return () => clearTimeout(timer);
  }, [snapshot?.activeAlert?.id]);

  if (!snapshot || !snapshot.settings.overlayVisible) {
    return null;
  }

  const fav = snapshot.settings.favoriteTeam || 'PHI';
  const pinnedGame =
    snapshot.games.find((g) => g.id === snapshot.settings.pinnedGameId) ||
    snapshot.games.find(
      (g) =>
        (g.awayTeam === fav || g.homeTeam === fav) &&
        g.dayLabel !== 'TOMORROW'
    ) ||
    snapshot.games.find((g) => g.awayTeam === fav || g.homeTeam === fav) ||
    snapshot.games[0];

  const handleToggleExpand = () => {
    saveState({
      settings: {
        ...snapshot.settings,
        overlayExpanded: !snapshot.settings.overlayExpanded,
      },
    }).catch(() => {});
  };

  const handleDismissAlert = () => {
    saveState({ activeAlert: null }).catch(() => {});
  };

  const handleClose = () => {
    saveState({
      settings: {
        ...snapshot.settings,
        overlayVisible: false,
      },
      activeAlert: null,
    }).catch(() => {});
  };

  if (!pinnedGame) {
    return null;
  }

  return (
    <FloatingWidgetContainer
      game={pinnedGame}
      expanded={snapshot.settings.overlayExpanded}
      activeAlert={snapshot.activeAlert}
      onToggleExpand={handleToggleExpand}
      onDismissAlert={handleDismissAlert}
      onClose={handleClose}
    />
  );
};

// Immediately trigger in-memory font registration so Inter is ready before first paint
ensureInterFontsLoaded();

function mountContentOverlay() {
  ensureInterFontsLoaded();
  const hostId = 'cherrypick-nba-extension-host';
  const existing = document.getElementById(hostId);
  if (existing) {
    existing.remove();
  }

  const host = document.createElement('div');
  host.id = hostId;
  host.style.cssText =
    'all: initial !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 0 !important; height: 0 !important; overflow: visible !important; z-index: 2147483647 !important; pointer-events: none !important;';

  const attachHostToContainer = () => {
    const targetParent =
      document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element })
        .webkitFullscreenElement ||
      document.body ||
      document.documentElement;
    if (targetParent && host.parentElement !== targetParent) {
      targetParent.appendChild(host);
    }
  };

  attachHostToContainer();
  document.addEventListener('fullscreenchange', attachHostToContainer);
  document.addEventListener('webkitfullscreenchange', attachHostToContainer);
  if (!host.parentElement) {
    window.addEventListener('load', attachHostToContainer, { once: true });
  }

  const shadow = host.attachShadow({ mode: 'open' });
  injectStylesInto(shadow);

  const mountNode = document.createElement('div');
  mountNode.style.cssText = 'pointer-events: auto;';
  shadow.appendChild(mountNode);

  ReactDOM.createRoot(mountNode).render(
    <React.StrictMode>
      <ContentOverlayApp />
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountContentOverlay);
} else {
  mountContentOverlay();
}

