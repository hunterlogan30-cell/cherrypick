import {
  buildContextualAlertForGame,
  detectSmartAlerts,
  enrichGameWithSummary,
  fetchLiveNbaGames,
} from '../services/espnNbaService';
import { loadState, saveState } from '../services/storageService';

const ALARM_NAME = 'cherrypick-nba-poll';
let lastPollTimestamp = 0;
let isPolling = false;
const notifiedGameSignatures = new Map<string, string>();

async function pollNbaFeed(force = false) {
  const now = Date.now();
  if (isPolling || (!force && now - lastPollTimestamp < 4000)) {
    return;
  }
  isPolling = true;
  lastPollTimestamp = now;

  try {
    const state = await loadState();

    const { games, isFallback } = await fetchLiveNbaGames(state.games);
    const fav = state.settings.favoriteTeam || 'PHI';

    // Determine which games should be enriched with live play-by-play & boxscore summary
    const targetIds = new Set<string>();
    for (const g of games) {
      if (
        g.phase === 'LIVE' ||
        g.phase === 'CLUTCH' ||
        g.phase === 'OVERTIME' ||
        g.phase === 'FINAL' ||
        g.id === state.settings.pinnedGameId ||
        g.awayTeam === fav ||
        g.homeTeam === fav
      ) {
        targetIds.add(g.id);
      }
    }

    let enrichedGames = games;
    if (!isFallback && targetIds.size > 0) {
      enrichedGames = await Promise.all(
        games.map((g) =>
          targetIds.has(g.id) ? enrichGameWithSummary(g) : Promise.resolve(g)
        )
      );
    }

    // Ensure pinnedGameId points to a valid game (prefer favorite team's game or a live game)
    const hasPinned = enrichedGames.some(
      (g) => g.id === state.settings.pinnedGameId
    );
    let nextPinnedId = state.settings.pinnedGameId;
    if (!hasPinned && enrichedGames.length > 0) {
      const favGame =
        enrichedGames.find(
          (g) =>
            (g.awayTeam === fav || g.homeTeam === fav) &&
            g.dayLabel !== 'TOMORROW'
        ) ||
        enrichedGames.find((g) => g.awayTeam === fav || g.homeTeam === fav);
      const liveGame = enrichedGames.find(
        (g) =>
          g.phase === 'CLUTCH' ||
          g.phase === 'OVERTIME' ||
          g.phase === 'LIVE'
      );
      nextPinnedId = (favGame || liveGame || enrichedGames[0]).id;
    }

    const newAlerts = detectSmartAlerts(
      state.games,
      enrichedGames,
      state.settings
    );

    const latestAlert =
      newAlerts.length > 0
        ? newAlerts[newAlerts.length - 1]
        : state.activeAlert;

    await saveState({
      games: enrichedGames,
      activeAlert: latestAlert,
      isLiveApiFallback: isFallback,
    });

    // Update extension toolbar badge with pinned game status
    if (typeof chrome !== 'undefined' && chrome.action) {
      const active =
        enrichedGames.find((g) => g.id === nextPinnedId) || enrichedGames[0];
      if (
        active &&
        (active.phase === 'LIVE' ||
          active.phase === 'CLUTCH' ||
          active.phase === 'OVERTIME')
      ) {
        chrome.action.setBadgeText({
          text: active.phase === 'CLUTCH' ? 'CLUTCH' : `Q${active.quarter}`,
        });
        chrome.action.setBadgeBackgroundColor({
          color: active.phase === 'CLUTCH' ? '#FFCE7E' : '#E04F54',
        });
      } else {
        chrome.action.setBadgeText({ text: '' });
      }
    }
  } finally {
    isPolling = false;
  }
}

async function injectContentScriptIntoExistingTabs() {
  if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
    return;
  }
  try {
    const tabs = await chrome.tabs.query({
      url: ['http://*/*', 'https://*/*'],
    });
    for (const tab of tabs) {
      if (tab.id) {
        if (chrome.action && chrome.action.setPopup) {
          chrome.action
            .setPopup({ tabId: tab.id, popup: 'popup.html' })
            .catch(() => {});
        }
        chrome.scripting
          .executeScript({
            target: { tabId: tab.id },
            files: ['contentScript.js'],
          })
          .catch(() => {
            // Ignore restricted chrome:// or webstore tabs
          });
      }
    }
  } catch {
    // Ignore query errors
  }
}

if (typeof chrome !== 'undefined' && chrome.runtime) {
  injectContentScriptIntoExistingTabs();

  chrome.runtime.onInstalled.addListener(() => {
    pollNbaFeed(true);
    injectContentScriptIntoExistingTabs();
    if (chrome.alarms) {
      chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.5 });
    }
  });

  if (chrome.runtime.onStartup) {
    chrome.runtime.onStartup.addListener(() => {
      pollNbaFeed(true);
      if (chrome.alarms) {
        chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.5 });
      }
    });
  }

  if (chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message?.type === 'POLL_NBA_NOW') {
        pollNbaFeed(Boolean(message.force)).then(() => {
          sendResponse({ ok: true });
        });
        return true;
      }
      if (message?.type === 'REGISTER_CONTENT_TAB' && sender.tab?.id) {
        if (chrome.action && chrome.action.setPopup) {
          chrome.action
            .setPopup({ tabId: sender.tab.id, popup: 'popup.html' })
            .catch(() => {});
        }
        sendResponse({ ok: true });
        return false;
      }
      return false;
    });
  }

  if (chrome.action && chrome.action.onClicked) {
    chrome.action.onClicked.addListener(async (tab) => {
      const toggleOnTab = async (tabId: number): Promise<boolean> => {
        try {
          const res = await chrome.tabs.sendMessage(tabId, {
            type: 'TOGGLE_POPUP_PANEL',
          });
          if (res && res.ok) {
            return true;
          }
        } catch {
          // Content script not ready or outdated on this tab
        }

        try {
          await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
              (
                window as unknown as { __CHERRYPICK_OPEN_ON_MOUNT?: boolean }
              ).__CHERRYPICK_OPEN_ON_MOUNT = true;
            },
          });
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ['contentScript.js'],
          });
          await new Promise((r) => setTimeout(r, 80));
          await chrome.tabs
            .sendMessage(tabId, { type: 'OPEN_POPUP_PANEL' })
            .catch(() => {});
          return true;
        } catch {
          return false;
        }
      };

      if (tab.id && (await toggleOnTab(tab.id))) {
        return;
      }

      // If clicked on a restricted chrome:// page, switch to an open web tab so we can render with true 24px rounded corners
      try {
        const webTabs = await chrome.tabs.query({
          url: ['http://*/*', 'https://*/*'],
          currentWindow: true,
        });
        const targetTab = webTabs[0];
        if (targetTab?.id) {
          await chrome.tabs.update(targetTab.id, { active: true });
          await toggleOnTab(targetTab.id);
        }
      } catch {
        // Ignore
      }
    });
  }

  if (chrome.alarms) {
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === ALARM_NAME) {
        pollNbaFeed();
      }
    });
  }
}

