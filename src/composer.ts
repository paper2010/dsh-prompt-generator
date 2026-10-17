// 本项目由 AI 辅助优化完成（提示词内核、测试与文档），发布前经人工审阅。
/**
 * composer.ts —— DSH 输入框（composer）的读写工具，客户端共享。
 *
 * 为什么独立成模块：OptimizeButton 与 PreviewCard 曾各自复制一份几乎相同的实现，
 * 且已出现细微分叉（回退策略不同）。读写在两个组件里必须严格一致——「读草稿」与
 * 「写回草稿」若定位到不同元素，替换就会写错地方。
 *
 * 实测背景（保留自原实现）：
 * - dsh-web >= 0.1.0-rc.6 的输入面是 Lexical 渲染的 <div contenteditable
 *   data-composer-input>，页面上没有 textarea；只认 textarea 的实现会「按钮点了
 *   无反应」（草稿永远为空）。
 * - input.right/overlay 槽位不提供标准 props/store hooks，依赖它们会崩并被错误
 *   边界吞掉，因此这里全部走 DOM 查询。
 */

/** 从单个输入控件读文本：textarea 用 .value；contenteditable 用 innerText。 */
export function textOfInput(el: Element): string {
  if (el instanceof HTMLTextAreaElement) return el.value;
  if (el instanceof HTMLElement && el.isContentEditable) return el.innerText || '';
  return '';
}

/** 是否 DSH 会话输入控件：textarea，或 composer 的 contenteditable 宿主。 */
export function isSessionInput(el: Element | null): boolean {
  if (el === null) return false;
  if (el instanceof HTMLTextAreaElement) return true;
  const editable = el instanceof HTMLElement && el.isContentEditable;
  const composer = el instanceof Element && el.closest('[data-composer-input]') !== null;
  return editable || composer;
}

/** 找 composer 输入框：优先焦点，否则回退到页面中的 composer 宿主 / 第一个可用输入控件。 */
export function findComposer(): Element | null {
  const active = document.activeElement;
  if (active && isSessionInput(active)) return active;
  const composer = document.querySelector('[data-composer-input]');
  if (composer && isSessionInput(composer)) return composer;
  const all = document.querySelectorAll<HTMLTextAreaElement>('textarea');
  for (const ta of all) {
    if (!ta.disabled) return ta;
  }
  return null;
}

/**
 * 读取当前草稿：优先「有内容的焦点控件」（mousedown 时焦点尚未切走，activeElement
 * 仍是输入框）；否则找页面中的 composer 宿主（点击按钮后焦点已在按钮上，composer
 * 是全局唯一的 resident div）；最后回退到任意「值非空」的 textarea（兼容旧宿主）。
 * 与 findComposer 的区别：readDraft 要求非空——空白输入不该触发优化。
 */
export function readDraft(): string {
  const active = document.activeElement;
  if (isSessionInput(active)) {
    const text = textOfInput(active);
    if (text.trim()) return text;
  }
  const composer = document.querySelector<HTMLElement>('[data-composer-input]');
  if (composer !== null && isSessionInput(composer)) {
    const text = textOfInput(composer);
    if (text.trim()) return text;
  }
  const all = document.querySelectorAll<HTMLTextAreaElement>('textarea');
  for (const ta of all) {
    if (ta.value.trim()) return ta.value;
  }
  return '';
}

/**
 * 写回 composer。textarea 用原生 value setter + input 事件（让 React 受控组件感知）；
 * contenteditable（Lexical）用 select-all + execCommand('insertText')——lexical 监听原生
 * input，execCommand 会触发正确的编辑事件并把 DOM 同步回编辑器 state。
 * 注意：document.execCommand 已被标记废弃，但 Lexical 仍依赖它派发的 beforeinput/input；
 * 若未来宿主移除该 API，走 innerText + input 事件的兜底分支。
 */
export function writeComposerText(text: string): void {
  const el = findComposer();
  if (!el) return;
  if (el instanceof HTMLTextAreaElement) {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    if (setter) {
      setter.call(el, text);
    } else {
      el.value = text;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
    return;
  }
  // contenteditable composer
  if (el instanceof HTMLElement && el.isContentEditable) {
    el.focus();
    if (document.execCommand) {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.execCommand('insertText', false, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      el.innerText = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}
