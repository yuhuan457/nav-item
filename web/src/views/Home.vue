<template>
  <div class="home-container" :class="homeClasses" :style="homeStyle">
    <div class="menu-bar-fixed">
      <MenuBar 
        :menus="menus" 
        :activeId="activeMenu?.id" 
        :activeSubMenuId="activeSubMenu?.id"
        @select="selectMenu"
      />
    </div>
    
    <div class="search-section">
      <div class="search-box-wrapper">
        <div class="search-engine-select">
          <button v-for="engine in searchEngines" :key="engine.name"
            :class="['engine-btn', {active: selectedEngine.name === engine.name}]"
            @click="selectEngine(engine)"
          >
            {{ engine.label }}
          </button>
        </div>
        <div class="search-container">
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="selectedEngine.placeholder" 
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button v-if="searchQuery" class="clear-btn" @click="clearSearch" aria-label="清空" title="clear">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
          </button>
          <button @click="handleSearch" class="search-btn" title="search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 左侧广告条 -->
    <div v-if="leftAds.length" class="ad-space-fixed left-ad-fixed">
      <a v-for="ad in leftAds" :key="ad.id" :href="ad.url" target="_blank">
        <img :src="ad.img" alt="广告" />
      </a>
    </div>
    <!-- 右侧广告条 -->
    <div v-if="rightAds.length" class="ad-space-fixed right-ad-fixed">
      <a v-for="ad in rightAds" :key="ad.id" :href="ad.url" target="_blank">
        <img :src="ad.img" alt="广告" />
      </a>
    </div>
    
    <CardGrid :cards="filteredCards" :link-target="linkTarget" :layout="cardLayout"/>
    
    <footer v-if="settings.showFriendLinks || settings.showFooterCopyright" class="footer">
      <div class="footer-content">
        <button v-if="settings.showFriendLinks" @click="showFriendLinks = true" class="friend-link-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          {{ settings.friendLinksText }}
        </button>
        <p v-if="settings.showFooterCopyright" class="copyright">
          {{ settings.footerCopyrightText }}
          <template v-if="settings.footerPoweredText">
            <span v-if="settings.footerCopyrightText"> | </span>
            <a
              v-if="settings.footerPoweredUrl"
              :href="settings.footerPoweredUrl"
              :target="linkTarget"
              class="footer-link"
            >{{ settings.footerPoweredText }}</a>
            <span v-else>{{ settings.footerPoweredText }}</span>
          </template>
        </p>
      </div>
    </footer>

    <!-- 友情链接弹窗 -->
    <div v-if="showFriendLinks" class="modal-overlay" @click="showFriendLinks = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t.friendLinks }}</h3>
          <button @click="showFriendLinks = false" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="friend-links-grid" :style="friendGridStyle">
            <a 
              v-for="friend in friendLinks" 
              :key="friend.id" 
              :href="friend.url" 
              :target="linkTarget" 
              class="friend-link-card"
            >
              <div class="friend-link-logo">
                <img 
                  v-if="friend.logo" 
                  :src="friend.logo" 
                  :alt="friend.title"
                  @error="handleLogoError"
                />
                <div v-else class="friend-link-placeholder">
                  {{ friend.title.charAt(0) }}
                </div>
              </div>
              <div class="friend-link-info">
                <h4>{{ friend.title }}</h4>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getMenus, getCards, getAds, getFriends, getSettings } from '../api';
import MenuBar from '../components/MenuBar.vue';
import CardGrid from '../components/CardGrid.vue';

const menus = ref([]);
const activeMenu = ref(null);
const activeSubMenu = ref(null);
const cards = ref([]);
const searchQuery = ref('');
const leftAds = ref([]);
const rightAds = ref([]);
const showFriendLinks = ref(false);
const friendLinks = ref([]);
const settings = ref({
  siteTitle: 'Nav-Item',
  siteDescription: '个人导航站',
  language: 'zh-CN',
  faviconUrl: '/default-favicon.png',
  headerStyle: 'simple',
  linkTarget: '_blank',
  fullWidth: false,
  maxGroupColumns: 4,
  maxBookmarkColumns: 6,
  cardHeight: 85,
  cardGap: 15,
  cardIconSize: 25,
  cardTextSize: 14,
  equalHeightCards: false,
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
});

const i18n = {
  'zh-CN': {
    search: '搜索',
    clear: '清空',
    notFound: '未找到相关内容',
    friendLinks: '友情链接',
    engines: {
      google: 'Google 搜索...',
      baidu: '百度搜索...',
      bing: 'Bing 搜索...',
      github: 'GitHub 搜索...',
      site: '站内搜索...'
    },
    site: '站内'
  },
  en: {
    search: 'Search',
    clear: 'Clear',
    notFound: 'No matching content found',
    friendLinks: 'Friend Links',
    engines: {
      google: 'Search Google...',
      baidu: 'Search Baidu...',
      bing: 'Search Bing...',
      github: 'Search GitHub...',
      site: 'Search this site...'
    },
    site: 'Site'
  }
};

const selectedEngineName = ref('google');

const currentLanguage = computed(() => i18n[settings.value.language] ? settings.value.language : 'zh-CN');
const t = computed(() => i18n[currentLanguage.value]);
const searchEngines = computed(() => [
  {
    name: 'google',
    label: 'Google',
    placeholder: t.value.engines.google,
    url: q => `https://www.google.com/search?q=${encodeURIComponent(q)}`
  },
  {
    name: 'baidu',
    label: '百度',
    placeholder: t.value.engines.baidu,
    url: q => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}`
  },
  {
    name: 'bing',
    label: 'Bing',
    placeholder: t.value.engines.bing,
    url: q => `https://www.bing.com/search?q=${encodeURIComponent(q)}`
  },
  {
    name: 'github',
    label: 'GitHub',
    placeholder: t.value.engines.github,
    url: q => `https://github.com/search?q=${encodeURIComponent(q)}&type=repositories`
  },
  {
    name: 'site',
    label: t.value.site,
    placeholder: t.value.engines.site,
    url: q => `/search?query=${encodeURIComponent(q)}`
  }
]);
const selectedEngine = computed(() => searchEngines.value.find(engine => engine.name === selectedEngineName.value) || searchEngines.value[0]);
const linkTarget = computed(() => settings.value.linkTarget === '_self' ? '_self' : '_blank');
const backgroundBlurMap = { none: '0px', sm: '2px', md: '5px', lg: '10px', xl: '16px' };

const homeStyle = computed(() => ({
  '--site-bg-image': `url("${settings.value.backgroundImageUrl || 'https://main.ssss.nyc.mn/background.webp'}")`,
  '--site-bg-blur': backgroundBlurMap[settings.value.backgroundBlur] || '0px',
  '--site-bg-brightness': `${Number(settings.value.backgroundBrightness) || 95}%`,
  '--site-bg-saturation': `${Number(settings.value.backgroundSaturation) || 100}%`,
  '--site-bg-opacity': String((Number(settings.value.backgroundOpacity) || 0) / 100)
}));

const homeClasses = computed(() => ({
  'layout-full-width': settings.value.fullWidth,
  [`header-${settings.value.headerStyle || 'simple'}`]: true
}));

const friendGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${Math.min(Math.max(Number(settings.value.maxBookmarkColumns) || 6, 3), 8)}, 1fr)`
}));

const cardLayout = computed(() => ({
  columns: Math.min(Math.max(Number(settings.value.maxGroupColumns) || 4, 3), 10),
  height: Math.min(Math.max(Number(settings.value.cardHeight) || 85, 64), 180),
  gap: Math.min(Math.max(Number(settings.value.cardGap) || 15, 4), 36),
  iconSize: Math.min(Math.max(Number(settings.value.cardIconSize) || 25, 16), 56),
  textSize: Math.min(Math.max(Number(settings.value.cardTextSize) || 14, 10), 22),
  equalHeight: Boolean(settings.value.equalHeightCards)
}));

function selectEngine(engine) {
  selectedEngineName.value = engine.name;
}

function clearSearch() {
  searchQuery.value = '';
}

const filteredCards = computed(() => {
  if (!searchQuery.value) return cards.value;
  return cards.value.filter(card => 
    card.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    card.url.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(async () => {
  await loadSettings();
  const res = await getMenus();
  menus.value = res.data;
  if (menus.value.length) {
    activeMenu.value = menus.value[0];
    loadCards();
  }
  // 加载广告
  const adRes = await getAds();
  leftAds.value = adRes.data.filter(ad => ad.position === 'left');
  rightAds.value = adRes.data.filter(ad => ad.position === 'right');
  
  const friendRes = await getFriends();
  friendLinks.value = friendRes.data;
});

async function loadSettings() {
  try {
    const res = await getSettings();
    settings.value = { ...settings.value, ...res.data };
    document.title = settings.value.siteTitle || 'Nav-Item';
    document.documentElement.lang = settings.value.language || 'zh-CN';
    updateMeta('description', settings.value.siteDescription || '');
    updateFavicon(settings.value.faviconUrl);
  } catch (error) {
    console.error('获取站点设置失败:', error);
  }
}

function updateMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function updateFavicon(url) {
  if (!url) return;
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'icon');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

async function selectMenu(menu, parentMenu = null) {
  if (parentMenu) {
    // 选择的是子菜单
    activeMenu.value = parentMenu;
    activeSubMenu.value = menu;
  } else {
    // 选择的是主菜单
    activeMenu.value = menu;
    activeSubMenu.value = null;
  }
  loadCards();
}

async function loadCards() {
  if (!activeMenu.value) return;
  const res = await getCards(activeMenu.value.id, activeSubMenu.value?.id);
  cards.value = res.data;
}

async function handleSearch() {
  if (!searchQuery.value.trim()) return;
  if (selectedEngine.value.name === 'site') {
    // 站内搜索：遍历所有菜单，查找所有卡片
    let found = false;
    for (const menu of menus.value) {
      const res = await getCards(menu.id);
      const match = res.data.find(card =>
        card.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        card.url.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
      if (match) {
        activeMenu.value = menu;
        cards.value = res.data;
        setTimeout(() => {
          const el = document.querySelector(`[data-card-id='${match.id}']`);
          if (el) el.scrollIntoView({behavior: 'smooth', block: 'center'});
        }, 100);
        found = true;
        break;
      }
    }
    if (!found) {
      alert(t.value.notFound);
    }
  } else {
    const url = selectedEngine.value.url(searchQuery.value);
    if (settings.value.linkTarget === 'popup') {
      window.open(url, '_blank', 'width=1200,height=800');
    } else {
      window.open(url, linkTarget.value);
    }
  }
}

function handleLogoError(event) {
  event.target.style.display = 'none';
  event.target.nextElementSibling.style.display = 'flex';
}
</script>

<style scoped>
.menu-bar-fixed {
  position: fixed;
  top: .6rem;
  left: 0;
  width: 100vw;
  z-index: 100;
  /* background: rgba(0,0,0,0.6); /* 可根据需要调整 */
  /* backdrop-filter: blur(8px);  /*  毛玻璃效果 */
}

.search-engine-select {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: .3rem;
  gap: 5px;
  z-index: 2;
}
.engine-btn {
  border: none;
  background: none;
  color: #ffffff;
  font-size: .8rem ;
  padding: 2px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.engine-btn.active, .engine-btn:hover {
  color: #399dff;
  background: #ffffff1a;
}

.search-container {
  display: flex;
  align-items: center;
  background: #b3b7b83b;
  border-radius: 20px;
  padding: 0.3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  max-width: 480px;
  width: 92%;
  position: relative;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: .1rem .5rem;
  font-size: 1.2rem;
  color: #ffffff;
  outline: none;
}

.search-input::placeholder {
  color: #999;
}

.clear-btn {
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  margin-right: 0.2rem;
  display: flex;
  align-items: center;
  padding: 0;
}

.search-btn {
  background: #e9e9eb00;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  margin-right: 0.1rem;
}

.search-btn:hover {
  background: #3367d6;
}

.home-container {
  min-height: 95vh;
  background: #111827;
  display: flex;
  flex-direction: column;
  /* padding: 1rem 1rem; */
  position: relative;
  padding-top: 50px; 
  overflow: hidden;
}

.home-container::before {
  content: '';
  position: absolute;
  inset: -32px;
  background-image: var(--site-bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  filter: blur(var(--site-bg-blur, 0px)) brightness(var(--site-bg-brightness, 95%)) saturate(var(--site-bg-saturation, 100%));
  z-index: 0;
}

.home-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, var(--site-bg-opacity, 0.3));
  z-index: 1;
}

.search-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.8rem 0;
  position: relative;
  z-index: 2;
}

.search-box-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 480px;
}

.content-wrapper {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
  position: relative;
  z-index: 2;
  flex: 1;
  justify-content: space-between;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.ad-space {
  width: 90px;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 0;
  background: transparent;
  margin: 0;
}
.ad-space a {
  width: 100%;
  display: block;
}
.ad-space img {
  width: 100%;
  max-width: 90px;
  max-height: 160px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  background: #fff;
  object-fit: contain;
  margin: 0 auto;
}

.ad-placeholder {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.6);
  padding: 2rem 1rem;
  text-align: center;
  font-size: 14px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer {
  margin-top: auto;
  text-align: center;
  padding-top: 1rem;
  padding-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 50px;
}

.friend-link-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  padding: 0;
}

.friend-link-btn:hover {
  color: #1976d2;
  transform: translateY(-1px);
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: #8585859c;
  border-radius: 16px;
  width: 55rem;
  height: 30rem;
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #d3d6d8;
}

.modal-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #cf1313;
}

.modal-body {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.friend-links-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
@media (max-width: 768px) {
  .friend-links-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .container {
    width: 95%;
  }
}

.friend-link-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px;
  background: #cfd3d661;
  border-radius: 15px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  border: 1px solid #cfd3d661;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.friend-link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  background: #ffffff8e;
}

.friend-link-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.friend-link-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.friend-link-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #6b7280;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
}

.friend-link-info h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  line-height: 1.3;
  word-break: break-all;
}

.copyright {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
.footer-link {
  color: #ffffffcc;
  text-decoration: none;
  transition: color 0.2s;
}
.footer-link:hover {
  color: #1976d2;
}

:deep(.link-item) {
  backdrop-filter: blur(10px);
}

.layout-full-width :deep(.card-grid) {
  max-width: min(96vw, 1180px);
}

.header-boxed .menu-bar-fixed :deep(.menu-bar) {
  max-width: min(96vw, 980px);
  margin: 0 auto;
  border-radius: 12px;
  backdrop-filter: blur(12px);
}

.header-underline .menu-bar-fixed :deep(.menu-bar) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.32);
}

:deep(.menu-bar) {
  position: relative;
  z-index: 2;
}

:deep(.card-grid) {
  position: relative;
  z-index: 2;
}

.ad-space-fixed {
  position: fixed;
  top: 13rem;
  z-index: 10;
  width: 90px;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 0;
  background: transparent;
  margin: 0;
}
.left-ad-fixed {
  left: 0;
}
.right-ad-fixed {
  right: 0;
}
.ad-space-fixed a {
  width: 100%;
  display: block;
}
.ad-space-fixed img {
  width: 100%;
  max-width: 90px;
  max-height: 160px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  background: #fff;
  margin: 0 auto;
}

@media (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;
    gap: 1rem;
  }
  
  .ad-space {
    width: 100%;
    height: 100px;
  }
  
  .ad-placeholder {
    height: 80px;
  }
}

@media (max-width: 768px) {
  .home-container {
    padding-top: 80px;
  }
  
  .content-wrapper {
    gap: 0.5rem;
  }
  
  .ad-space {
    height: 60px;
  }
  
  .ad-placeholder {
    height: 50px;
    font-size: 12px;
    padding: 1rem 0.5rem;
  }
  .footer {
    padding-top: 2rem;
  }
  .friend-link-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.7rem;
    padding: 0;
  }
  .copyright {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.7rem;
    margin: 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
  .footer-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }
}
</style> 
