/** 输入区浮层预览卡片：guide / optimizing / preview / error 四种内容态
 *  状态来自模块级预览总线（preview-bus），不依赖会话 store/hook props */

import React, { useEffect, useRef, useState } from 'react';
import type { Lang, PromptConfig } from './optimizer.js';
import { runOptimize, closePreview, reflectIfNeeded } from './optimizer-store.js';
import { recordOutcome } from './memory.js';
import { getPreviewBusState, subscribePreviewBus } from './preview-bus.js';
import { readDraft, writeComposerText } from './composer.js';

export interface PreviewCardProps {
  t: (key: string) => string;
  getConfig: () => PromptConfig;
  getLang: () => Lang;
  openSettings: () => void;
  getSessionModel?: () => Promise<{ provider: string; model: string } | null>;
  getHost?: () => { rpc: { call: (e: string, p?: Record<string, unknown>) => Promise<{ ok: boolean; value?: unknown; error?: { code?: string } }> } } | null;
  getSessionId?: () => string | null;
}

const CSS_ID = 'dsh-prompt-optimize/card.css';
function injectCss() {
  if (typeof document === 'undefined' || document.querySelector(`style[data-plugin-css="${CSS_ID}"]`)) return;
  const style = document.createElement('style');
  style.dataset.pluginCss = CSS_ID;
  style.textContent = `
.dsh-po-card {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: calc(100% + 8px);
  z-index: 40;
  background: var(--dsw-alias-bg-overlay, #fff);
  border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,0.3));
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  padding: 12px 14px;
  max-height: 320px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dsh-po-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--dsw-alias-label-primary, #222);
  font-size: 13px;
  font-weight: 600;
}
.dsh-po-card-body {
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--dsw-alias-label-secondary, #444);
  font-size: 13px;
  line-height: 1.6;
  max-height: 200px;
}
.dsh-po-card-err {
  color: var(--dsw-alias-state-error-primary, #d03050);
  font-size: 13px;
}
.dsh-po-card-step {
  color: var(--dsw-alias-text-secondary, #8c93a1);
  font-size: 12px;
  margin-left: 4px;
}
/* 推理过程（v4 系模型先输出长段 reasoning）：等待期间必须可见，
   且与正文分区显示——否则用户只看到沙漏，误判为卡死 */
.dsh-po-reason {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 8px;
  border-left: 2px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.35));
}
.dsh-po-reason-head {
  font-size: 11px;
  color: var(--dsw-alias-text-secondary, #8c93a1);
}
.dsh-po-reason-body {
  max-height: 110px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-text-secondary, #8c93a1);
}
.dsh-po-card-err-detail {
  margin-top: 4px;
  color: var(--dsw-alias-text-secondary, #8c93a1);
  font-size: 12px;
  word-break: break-all;
}
.dsh-po-card-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.dsh-po-card-btn {
  border: 0;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  color: var(--dsw-alias-label-primary, #222);
  background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,0.14));
}
.dsh-po-card-btn.primary {
  /* 写死主色：--dsw-alias-brand-primary 在深夜模式解析为浅色 → 白底白字不可读（用户实测） */
  color: #fff;
  background: #1677ff;
}
`;
  document.head.appendChild(style);
}

function errorKey(kind: string | null): string {
  switch (kind) {
    // kind → locale key；'config' 在 UI 上不可达（runOptimize 先走 guide），AbortError→timeout 由 runOptimize 先行拦截，保留双保险
    case 'unauthorized': case 'forbidden': case 'timeout': case 'network': case 'cors': case 'http': case 'bad-response': case 'empty': case 'truncated': case 'config':
      return `error.${kind}`;
    default:
      return 'error.network';
  }
}

export function PreviewCard(props: PreviewCardProps) {
  const { t, getConfig, getLang, openSettings, getSessionModel, getHost, getSessionId } = props;

  // 订阅模块级预览总线（替代会话 store props）
  const [state, setState] = useState(() => getPreviewBusState());
  useEffect(
    () => subscribePreviewBus(() => setState(getPreviewBusState())),
    [],
  );

  useEffect(() => injectCss(), []);

  // 卸载时清理：清除挂起的 copied 复位定时器，并标记未挂载，
  // 防止迟到的 setCopied(true)（copy 的 await 期间卸载）在卸载后触发。
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
    };
  }, []);

  const { status, result, errorKind } = state;
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);
  /**
   * ⚠️ 所有 hooks 必须在此处集中声明，早于下方任何 `return null`。
   * 实测故障（v0.3.0 及更早）：hasCopiedRef 原先声明在「status === 'idle' 就 return null」
   * 之后 —— idle 首帧只跑 7 个 hook，一旦开始优化走到第 8 个 hook，React 抛 #310
   * （Rendered more hooks than during the previous render），整个 overlay 槽位条目被
   * 错误边界移除：用户看到的是「点一下按钮变沙漏、上方永远不出现卡片/思考过程」。
   */
  const hasCopiedRef = useRef(false);

  // 宿主通道步骤提示：把「正在优化」细化到当前步骤，卡在哪一步一眼可见
  const stepHint = state.step ? t(`card.step.${state.step}`) : t('card.optimizing');

  // 预览窗口绑定发起会话：切换到别的会话时不跟随显示（切回发起会话恢复）
  if (status !== 'idle' && state.sessionId !== null) {
    const sid = getSessionId?.();
    if (sid !== null && state.sessionId !== sid) return null;
  }
  if (status === 'idle') return null;

  const retry = () => {
    // 重试 = 否决本次结果（负样本），让反思知道「这类产出不合口味」
    recordOutcome('rejected');
    void runOptimize({
      getConfig,
      getLang,
      getDraft: () => readDraft(),
      getSessionModel,
      host: getHost?.() ?? undefined,
      getSessionId,
    });
  };

  const replace = () => {
    writeComposerText(result);
    // 采纳 = 正样本；累计到阈值后异步刷新偏好画像（失败静默）
    const accepted = recordOutcome('accepted');
    closePreview();
    if (accepted) {
      void reflectIfNeeded({ config: getConfig(), lang: getLang(), host: getHost?.() ?? undefined });
    }
  };

  /** 关闭 = 未采纳。但若已复制走结果，说明用户认可了产出（正样本），
   *  旧版一律记负样本，会把「复制走」污染进反思画像。 */
  const dismiss = () => {
    recordOutcome(hasCopiedRef.current ? 'accepted' : 'rejected');
    closePreview();
  };

  const copy = async () => {
    if (!navigator.clipboard) return; // 非安全上下文（http 等）：不翻转 copied，保持可重试
    try {
      await navigator.clipboard.writeText(result);
      hasCopiedRef.current = true; // 复制也算认可信号
      if (!mountedRef.current) return; // await 期间组件已卸载：不再 setState
      setCopied(true);
      if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 1200);
    } catch {
      // 剪贴板写入失败：静默（不翻转 copied）
    }
  };

  return (
    <div className="dsh-po-card" role="status">
      <div className="dsh-po-card-head">
        <span>{t('card.title')}</span>
        <button type="button" className="dsh-po-card-btn" onClick={dismiss}>
          ✕
        </button>
      </div>

      {status === 'guide' && (
        <>
          <div className="dsh-po-card-body">{t('guide.title')}</div>
          <div className="dsh-po-card-body">{t('guide.desc')}</div>
          <div className="dsh-po-card-row">
            <button type="button" className="dsh-po-card-btn primary" onClick={() => { closePreview(); openSettings(); }}>
              {t('guide.action')}
            </button>
            <button type="button" className="dsh-po-card-btn" onClick={() => closePreview()}>
              {t('guide.dismiss')}
            </button>
          </div>
        </>
      )}

      {status === 'optimizing' && (
        <>
          {/* 推理过程单独成块：模型先产 reasoning 再产正文，等待期不能让用户只看到沙漏 */}
          {state.reasoning ? (
            <div className="dsh-po-reason">
              <div className="dsh-po-reason-head">{t('card.reasoning')}</div>
              <div className="dsh-po-reason-body">{state.reasoning}</div>
            </div>
          ) : null}
          <div className="dsh-po-card-body">
            {state.draft ? <span style={{ whiteSpace: 'pre-wrap' }}>{state.draft}</span> : null}
            {!state.draft ? <span className="dsh-po-card-step">{stepHint}</span> : null}
          </div>
        </>
      )}

      {status === 'preview' && (
        <>
          <div className="dsh-po-card-body">{result}</div>
          <div className="dsh-po-card-row">
            <button type="button" className="dsh-po-card-btn primary" onClick={replace}>
              {t('card.replace')}
            </button>
            <button type="button" className="dsh-po-card-btn" onClick={() => void copy()}>
              {copied ? t('card.copyDone') : t('card.copy')}
            </button>
            <button type="button" className="dsh-po-card-btn" onClick={retry}>
              {t('card.retry')}
            </button>
            <button type="button" className="dsh-po-card-btn" onClick={dismiss}>
              {t('card.dismiss')}
            </button>
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="dsh-po-card-err">{t(errorKey(errorKind))}</div>
          {errorDetail ? <div className="dsh-po-card-err-detail">{errorDetail}</div> : null}
          <div className="dsh-po-card-row">
            <button type="button" className="dsh-po-card-btn primary" onClick={retry}>
              {t('card.retry')}
            </button>
            <button type="button" className="dsh-po-card-btn" onClick={dismiss}>
              {t('card.dismiss')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}