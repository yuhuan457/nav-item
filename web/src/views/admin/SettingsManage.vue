<template>
  <div class="settings-manage">
    <div v-if="message" class="save-message">{{ message }}</div>

    <section v-for="section in sections" :key="section.title" class="settings-section">
      <div class="section-head">
        <h3>{{ section.title }}</h3>
        <button class="btn" :disabled="saving || loading" @click="saveSettings">
          {{ saving ? '保存中...' : '应用设置' }}
        </button>
      </div>

      <div class="settings-grid">
        <label v-for="field in section.fields" :key="field.key" class="setting-item" :class="{ wide: field.type === 'textarea' }">
          <span class="label">{{ field.label }}</span>

          <input
            v-if="field.type === 'text' || field.type === 'url'"
            v-model="settings[field.key]"
            :type="field.type"
            class="input"
            :placeholder="field.placeholder"
          />

          <input
            v-else-if="field.type === 'number'"
            v-model.number="settings[field.key]"
            type="number"
            class="input"
            :min="field.min"
            :max="field.max"
          />

          <input
            v-else-if="field.type === 'color'"
            v-model="settings[field.key]"
            type="color"
            class="color-input"
          />

          <select v-else-if="field.type === 'select'" v-model="settings[field.key]" class="input">
            <option v-for="option in field.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <label v-else-if="field.type === 'checkbox'" class="switch-row">
            <input v-model="settings[field.key]" type="checkbox" />
            <span>{{ settings[field.key] ? '已启用' : '已关闭' }}</span>
          </label>

          <textarea
            v-else-if="field.type === 'textarea'"
            v-model="settings[field.key]"
            class="input textarea"
            :placeholder="field.placeholder"
          />

          <small>{{ field.help }}</small>
        </label>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSettings, updateSettings } from '../../api';

const loading = ref(false);
const saving = ref(false);
const message = ref('');
const settings = ref({});

const yesNoFields = [
  { value: true, label: '显示' },
  { value: false, label: '隐藏' }
];

const sections = [
  {
    title: '基本信息',
    fields: [
      { key: 'siteTitle', label: '页面标题', type: 'text', help: '浏览器标签页和站点名称。' },
      { key: 'siteDescription', label: '页面描述', type: 'text', help: '用于页面 meta 描述。' },
      { key: 'language', label: '语言', type: 'select', help: '选择界面语言。', options: [
        { value: 'zh-CN', label: '中文（简体）' },
        { value: 'zh-TW', label: '中文（繁体）' },
        { value: 'en', label: 'English' }
      ] },
      { key: 'faviconUrl', label: '网站图标 URL', type: 'url', help: '支持完整 URL 或 /uploads 路径。' },
      { key: 'startUrl', label: '起始 URL', type: 'text', help: 'PWA 或入口地址，默认 /。' },
      { key: 'baseUrl', label: '基础 URL', type: 'url', help: '反向代理或公开访问基础地址。' },
      { key: 'instanceName', label: '实例名称', type: 'text', help: '用于区分多个导航站实例。' }
    ]
  },
  {
    title: '外观设置',
    fields: [
      { key: 'theme', label: '主题', type: 'select', help: '浅色或深色外观。', options: [
        { value: 'light', label: '浅色' },
        { value: 'dark', label: '深色' }
      ] },
      { key: 'themeColor', label: '主题色', type: 'color', help: '按钮、链接和强调色。' },
      { key: 'iconStyle', label: '图标样式', type: 'select', help: '预留给卡片图标展示样式。', options: [
        { value: 'default', label: '默认' },
        { value: 'gradient', label: '渐变' },
        { value: 'theme', label: '主题色' }
      ] },
      { key: 'cardBlur', label: '卡片背景模糊', type: 'select', help: '服务卡片的背景模糊强度。', options: [
        { value: 'none', label: '无' },
        { value: 'sm', label: '小' },
        { value: 'md', label: '中等' },
        { value: 'lg', label: '大' }
      ] },
      { key: 'bookmarkStyle', label: '书签样式', type: 'select', help: '友链和书签的默认展示风格。', options: [
        { value: 'default', label: '默认' },
        { value: 'icon-only', label: '仅图标' }
      ] }
    ]
  },
  {
    title: '页面设置',
    fields: [
      { key: 'headerStyle', label: '头部样式', type: 'select', help: '导航栏显示风格。', options: [
        { value: 'simple', label: '简洁' },
        { value: 'boxed', label: '盒装' },
        { value: 'underline', label: '下划线' }
      ] },
      { key: 'linkTarget', label: '链接打开方式', type: 'select', help: '卡片、搜索和友链默认打开方式。', options: [
        { value: '_blank', label: '新标签页' },
        { value: '_self', label: '当前页面' },
        { value: 'popup', label: '新窗口' }
      ] },
      { key: 'hideVersion', label: '隐藏版本信息', type: 'checkbox', help: '隐藏页面底部版本显示。' },
      { key: 'showStats', label: '显示统计信息', type: 'checkbox', help: '预留统计信息开关。' },
      { key: 'disableUpdateCheck', label: '禁用更新检查', type: 'checkbox', help: '预留更新检查开关。' },
      { key: 'hideErrors', label: '隐藏错误消息', type: 'checkbox', help: '预留全局错误提示开关。' }
    ]
  },
  {
    title: '布局与显示',
    fields: [
      { key: 'fullWidth', label: '全宽模式', type: 'checkbox', help: '让主页内容占据更大宽度。' },
      { key: 'maxGroupColumns', label: '最大组列数', type: 'number', min: 4, max: 8, help: '大屏幕卡片组最大列数。' },
      { key: 'maxBookmarkColumns', label: '书签组最大列数', type: 'number', min: 5, max: 8, help: '友链弹窗最大列数。' },
      { key: 'equalHeightCards', label: '等高卡片', type: 'checkbox', help: '让同一行卡片高度一致。' },
      { key: 'disableCollapse', label: '禁用折叠功能', type: 'checkbox', help: '预留分组折叠开关。' },
      { key: 'initiallyCollapsed', label: '初始折叠分组', type: 'checkbox', help: '预留默认折叠开关。' }
    ]
  },
  {
    title: '背景设置',
    fields: [
      { key: 'backgroundImageUrl', label: '背景图片 URL', type: 'url', help: '主页背景图，留空则使用默认背景。' },
      { key: 'backgroundBlur', label: '模糊程度', type: 'select', help: '背景图模糊强度。', options: [
        { value: 'none', label: '无' },
        { value: 'sm', label: '小' },
        { value: 'md', label: '中' },
        { value: 'lg', label: '大' },
        { value: 'xl', label: '超大' }
      ] },
      { key: 'backgroundBrightness', label: '亮度', type: 'number', min: 0, max: 200, help: '背景亮度百分比。' },
      { key: 'backgroundSaturation', label: '饱和度', type: 'number', min: 0, max: 200, help: '背景饱和度百分比。' },
      { key: 'backgroundOpacity', label: '遮罩透明度 (%)', type: 'number', min: 0, max: 100, help: '黑色遮罩透明度，越大越暗。' }
    ]
  },
  {
    title: '页脚与友情链接',
    fields: [
      { key: 'showFriendLinks', label: '友情链接入口', type: 'select', help: '控制前台“友情链接”按钮是否显示。', options: yesNoFields },
      { key: 'friendLinksText', label: '友情链接文字', type: 'text', help: '更改前台按钮文案。' },
      { key: 'showFooterCopyright', label: '版权信息', type: 'select', help: '控制 Copyright / Powered 是否显示。', options: yesNoFields },
      { key: 'footerCopyrightText', label: '版权文字', type: 'text', help: '例如 Copyright © 2025 Nav-Item。' },
      { key: 'footerPoweredText', label: 'Powered 文字', type: 'text', help: '右侧链接文字。' },
      { key: 'footerPoweredUrl', label: 'Powered 链接', type: 'url', help: '点击 Powered 文字跳转的地址。' }
    ]
  }
];

onMounted(loadSettings);

async function loadSettings() {
  loading.value = true;
  try {
    const res = await getSettings();
    settings.value = res.data;
  } finally {
    loading.value = false;
  }
}

async function saveSettings() {
  saving.value = true;
  message.value = '';
  try {
    const res = await updateSettings(settings.value);
    settings.value = res.data;
    message.value = '设置已保存';
    setTimeout(() => { message.value = ''; }, 2400);
  } catch (error) {
    message.value = error.response?.data?.error || '保存失败，请稍后重试';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.settings-manage {
  width: min(1180px, 94vw);
  margin: 24px auto 48px;
}
.save-message {
  position: sticky;
  top: 72px;
  z-index: 3;
  margin-bottom: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #e8f7ee;
  color: #137333;
  border: 1px solid #b7ebc6;
}
.settings-section {
  background: #fff;
  border: 1px solid #e3e6ef;
  border-radius: 8px;
  padding: 22px;
  margin-bottom: 18px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.section-head h3 {
  margin: 0;
  color: #172033;
  font-size: 20px;
}
.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 18px;
}
.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #1f2937;
}
.setting-item.wide {
  grid-column: 1 / -1;
}
.label {
  font-weight: 600;
}
.input {
  min-height: 38px;
  border: 1px solid #d0d7e2;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 14px;
  background: #fff;
  color: #111827;
}
.textarea {
  min-height: 92px;
  resize: vertical;
}
.color-input {
  width: 72px;
  height: 40px;
  border: 1px solid #d0d7e2;
  border-radius: 6px;
  background: #fff;
}
.switch-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
}
.switch-row input {
  width: 18px;
  height: 18px;
}
small {
  color: #6b7280;
  line-height: 1.5;
}
.btn {
  background: #2566d8;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 9px 16px;
  cursor: pointer;
  white-space: nowrap;
}
.btn:hover:not(:disabled) {
  background: #174ea6;
}
.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
@media (max-width: 760px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }
  .btn {
    width: 100%;
  }
}
</style>
