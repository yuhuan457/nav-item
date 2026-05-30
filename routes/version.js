const express = require('express');
const https = require('https');
const auth = require('./authMiddleware');

const router = express.Router();
const REPO_API = 'https://api.github.com/repos/yuhuan457/nav-item/commits/main';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'nav-item-version-check'
      }
    }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`GitHub returned ${res.statusCode}`));
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy(new Error('GitHub request timed out'));
    });
  });
}

router.get('/check', auth, async (req, res) => {
  try {
    const data = await fetchJson(REPO_API);
    res.json({
      repository: 'yuhuan457/nav-item',
      branch: 'main',
      latestSha: data.sha,
      shortSha: data.sha ? data.sha.slice(0, 7) : '',
      message: data.commit?.message || '',
      date: data.commit?.committer?.date || '',
      url: data.html_url || '',
      currentVersion: process.env.APP_VERSION || process.env.npm_package_version || 'local-build',
      note: '如果 GitHub 有新提交，需要先在 1Panel 重新构建容器，刷新后才能看到新版前端。'
    });
  } catch (error) {
    res.status(502).json({
      error: '检查 GitHub 更新失败',
      detail: error.message
    });
  }
});

module.exports = router;
