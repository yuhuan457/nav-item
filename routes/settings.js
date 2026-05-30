const express = require('express');
const db = require('../db');
const auth = require('./authMiddleware');

const router = express.Router();

const defaults = {
  siteTitle: 'Nav-Item',
  siteDescription: '个人导航站',
  language: 'zh-CN',
  faviconUrl: '/default-favicon.png',
  startUrl: '/',
  baseUrl: '',
  instanceName: 'public',
  headerStyle: 'simple',
  linkTarget: '_blank',
  hideVersion: false,
  showStats: false,
  disableUpdateCheck: false,
  hideErrors: false,
  fullWidth: false,
  maxGroupColumns: 4,
  maxBookmarkColumns: 6,
  cardHeight: 85,
  cardGap: 15,
  cardIconSize: 25,
  cardTextSize: 14,
  equalHeightCards: false,
  disableCollapse: false,
  initiallyCollapsed: false,
  backgroundImageUrl: 'https://main.ssss.nyc.mn/background.webp',
  backgroundBlur: 'none',
  backgroundBrightness: 95,
  backgroundSaturation: 100,
  backgroundOpacity: 30,
  showFriendLinks: true,
  friendLinksText: '友情链接',
  showFooterCopyright: true,
  footerCopyrightText: 'Copyright © 2025 Nav-Item',
  footerPoweredText: 'Powered by yuhuan457',
  footerPoweredUrl: 'https://github.com/yuhuan457/nav-item'
};

function coerceValue(key, value) {
  const fallback = defaults[key];
  if (typeof fallback === 'boolean') return Boolean(value);
  if (typeof fallback === 'number') {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  }
  return value == null ? fallback : String(value);
}

function parseSetting(row) {
  try {
    return JSON.parse(row.value);
  } catch (error) {
    return row.value;
  }
}

function readSettings(callback) {
  db.all('SELECT key, value FROM settings', [], (err, rows) => {
    if (err) return callback(err);
    const settings = { ...defaults };
    rows.forEach(row => {
      if (Object.prototype.hasOwnProperty.call(defaults, row.key)) {
        settings[row.key] = coerceValue(row.key, parseSetting(row));
      }
    });
    callback(null, settings);
  });
}

router.get('/', (req, res) => {
  readSettings((err, settings) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(settings);
  });
});

router.put('/', auth, (req, res) => {
  const incoming = req.body || {};
  const keys = Object.keys(defaults);
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

  db.serialize(() => {
    keys.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(incoming, key)) {
        stmt.run(key, JSON.stringify(coerceValue(key, incoming[key])));
      }
    });
    stmt.finalize(err => {
      if (err) return res.status(500).json({ error: err.message });
      readSettings((readErr, settings) => {
        if (readErr) return res.status(500).json({ error: readErr.message });
        res.json(settings);
      });
    });
  });
});

router.defaults = defaults;

module.exports = router;
