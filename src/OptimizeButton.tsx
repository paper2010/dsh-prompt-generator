/** 输入栏右侧「优化」按钮 —— 不依赖会话 store/hook props，状态走模块级预览总线 */

import React, { useCallback, useEffect, useState } from 'react';
import type { Lang, PromptConfig } from './optimizer.js';
import { runOptimize } from './optimizer-store.js';
import { getPreviewBusState, subscribePreviewBus } from './preview-bus.js';
import { onOptimizeRequest } from './events.js';
import { readDraft } from './composer.js';

export interface OptimizeButtonProps {
  t: (key: string) => string;
  getConfig: () => PromptConfig;
  getLang: () => Lang;
  getSessionModel?: () => Promise<{ provider: string; model: string } | null>;
  getHost?: () => { rpc: { call: (e: string, p?: Record<string, unknown>) => Promise<{ ok: boolean; value?: unknown; error?: { code?: string } }> } } | null;
  getSessionId?: () => string | null;
}

const CSS_ID = 'dsh-prompt-generator/button.css';
function injectCss() {
  if (typeof document === 'undefined' || document.querySelector(`style[data-plugin-css="${CSS_ID}"]`)) return;
  const style = document.createElement('style');
  style.dataset.pluginCss = CSS_ID;
  style.textContent = `
.dsh-po-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 2px 6px;
  font-size: 14px;
  line-height: 1;
  opacity: 0.85;
  border-radius: 6px;
}
.dsh-po-btn:hover:not(:disabled) {
  opacity: 1;
  background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,0.12));
}
.dsh-po-btn:disabled {
  opacity: 0.35;
  cursor: default;
}
`;
  document.head.appendChild(style);
}

/**
 * 读取当前草稿：走共享的 composer 工具（与 PreviewCard 严格一致，避免双实现漂移）。
 * 读草稿的背景（保留自原实现）：DSH composer 是 Lexical 渲染的 contenteditable div，
 * 页面上没有 textarea；只认 textarea 会「按钮点了无反应」。槽位不提供标准 props，
 * 因此全部走 DOM 查询。
 */

export function OptimizeButton(props: OptimizeButtonProps) {
  const { t, getConfig, getLang, getSessionModel, getHost, getSessionId } = props;

  // 繁忙态：订阅模块级预览总线（替代会话 store props）；
  // 预览窗口绑定发起会话——切到别的会话时按钮不再 busy（各会话可独立发起优化）
  const busyFor = () => {
    const st = getPreviewBusState();
    if (st.status !== 'optimizing') return false;
    const sid = getSessionId?.();
    return st.sessionId === null || st.sessionId === sid;
  };
  const [busy, setBusy] = useState(busyFor);
  useEffect(
    () => subscribePreviewBus(() => setBusy(busyFor())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // mousedown 预读草稿：点击按钮瞬间焦点会切到按钮（activeElement 不再是 textarea），
  // 但 mousedown 早于焦点切换——此刻读到的 activeElement 仍是输入框。
  const draftRef = React.useRef('');
  const syncDraft = React.useCallback(() => {
    draftRef.current = readDraft();
  }, []);

  useEffect(() => injectCss(), []);

  const handleClick = useCallback(() => {
    if (busy) return;
    const draft = draftRef.current || readDraft();
    if (!draft.trim()) return;
    void runOptimize({
      getConfig,
      getLang,
      getDraft: () => draft,
      getSessionModel,
      host: getHost?.(),
      getSessionId,
    });
  }, [busy, getConfig, getLang]);

  // Alt+O 快捷键（index.ts 全局监听）→ 等效点击按钮
  useEffect(() => onOptimizeRequest(handleClick), [handleClick]);

  return (
    <button
      type="button"
      className="dsh-po-btn"
      aria-label={t('button.aria')}
      title={t('button.aria')}
      aria-busy={busy}
      disabled={busy}
      data-busy={busy}
      onMouseDown={syncDraft}
      onFocus={syncDraft}
      onClick={handleClick}
    >
      {busy ? '⏳' : '✨'}
    </button>
  );
}