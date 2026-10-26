import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react';

type Role = 'user' | 'assistant';
type Mood = 'waving' | 'thinking' | 'walking' | 'meditating';

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
}

interface StoredHistory {
  updatedAt: number;
  messages: ChatMessage[];
}

const HISTORY_KEY = 'liuzu:assistant-history:v2';
const HISTORY_LIFETIME = 60 * 60 * 1000;
const BUBBLE_LIFETIME = 9 * 1000;
const ACTION_LABELS: Record<Mood, string> = { waving: '导览', thinking: '思考', walking: '移动', meditating: '休息' };

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readHistory(): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const stored = JSON.parse(raw) as StoredHistory;
    if (!Array.isArray(stored.messages) || Date.now() - stored.updatedAt >= HISTORY_LIFETIME) {
      window.localStorage.removeItem(HISTORY_KEY);
      return [];
    }
    return stored.messages.filter(
      (message): message is ChatMessage =>
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string' &&
        typeof message.createdAt === 'number',
    );
  } catch {
    return [];
  }
}

function fallbackReply() {
  return '我暂时没连上云端问答服务。你可以稍后再试，或先问我网站中的地图、路线、景点和集章内容。';
}

export function FloatingAssistant() {
  const reduceMotion = useReducedMotion();
  const [history, setHistory] = useState<ChatMessage[]>(readHistory);
  const [bubbles, setBubbles] = useState<ChatMessage[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mood, setMood] = useState<Mood>('waving');
  const [peeking, setPeeking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const clickTimer = useRef<number | undefined>(undefined);
  const dragged = useRef(false);

  const recentMessages = useMemo(
    () => history.slice(-12).map(({ role, content }) => ({ role, content })),
    [history],
  );

  useEffect(() => {
    if (!history.length) {
      window.localStorage.removeItem(HISTORY_KEY);
      return;
    }
    const stored: StoredHistory = { updatedAt: Date.now(), messages: history };
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(stored));
    const timer = window.setTimeout(() => {
      setHistory([]);
      setBubbles([]);
      setHistoryOpen(false);
    }, HISTORY_LIFETIME);
    return () => window.clearTimeout(timer);
  }, [history]);

  useEffect(() => {
    if (composerOpen) inputRef.current?.focus();
  }, [composerOpen]);

  useEffect(() => {
    const idleTimer = window.setTimeout(() => {
      if (!composerOpen && !historyOpen && !isSending) {
        setMood('meditating');
        setPeeking(true);
      }
    }, 16_000);
    return () => window.clearTimeout(idleTimer);
  }, [composerOpen, historyOpen, isSending, mood]);

  useEffect(
    () => () => {
      if (clickTimer.current) window.clearTimeout(clickTimer.current);
    },
    [],
  );

  function showBubble(message: ChatMessage) {
    setBubbles((current) => [...current.slice(-3), message]);
    window.setTimeout(() => {
      setBubbles((current) => current.filter((item) => item.id !== message.id));
    }, BUBBLE_LIFETIME);
  }

  async function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || isSending) return;

    const userMessage: ChatMessage = { id: createId(), role: 'user', content, createdAt: Date.now() };
    const conversation = [...recentMessages, { role: userMessage.role, content: userMessage.content }];
    setHistory((current) => [...current, userMessage]);
    showBubble(userMessage);
    setDraft('');
    setIsSending(true);
    setMood('thinking');

    let contentReply = fallbackReply();
    try {
      if (import.meta.env.VITE_PAGES === 'true') {
        contentReply = '这是静态导览演示，未连接在线 AI。您可以通过导航查看景点、路线和离线示意地图；请勿输入私人信息。';
      } else {
      const response = await fetch('/api/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation }),
      });
      const payload = (await response.json()) as { content?: string };
      if (response.ok && payload.content?.trim()) contentReply = payload.content.trim();
      }
    } catch {
      contentReply = fallbackReply();
    }

    const assistantMessage: ChatMessage = {
      id: createId(),
      role: 'assistant',
      content: contentReply,
      createdAt: Date.now(),
    };
    setHistory((current) => [...current, assistantMessage]);
    showBubble(assistantMessage);
    setIsSending(false);
    setMood('waving');
  }

  function onAssistantClick() {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    if (clickTimer.current) window.clearTimeout(clickTimer.current);
    clickTimer.current = window.setTimeout(() => {
      setHistoryOpen(false);
      setPeeking(false);
      setComposerOpen((value) => !value);
      setMood('waving');
    }, 180);
  }

  function openHistory() {
    if (clickTimer.current) window.clearTimeout(clickTimer.current);
    setComposerOpen(false);
    setHistoryOpen(true);
    setMood('thinking');
  }

  return (
    <motion.div
      className={`floating-assistant${composerOpen ? ' is-composing' : ''}${peeking ? ' is-peeking' : ''}`}
      drag
      dragMomentum={false}
      dragElastic={0.08}
      onDragStart={() => {
        dragged.current = true;
        setPeeking(false);
        setComposerOpen(false);
        setHistoryOpen(false);
        setMood('walking');
      }}
      onDragEnd={() => {
        window.setTimeout(() => {
          dragged.current = true;
        }, 0);
        setMood('waving');
      }}
      whileDrag={reduceMotion ? undefined : { scale: 1.04, rotate: 2 }}
      transition={{ type: 'spring', duration: 0.42, bounce: 0.16 }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {bubbles.map((message, index) => (
          <motion.p
            key={message.id}
            className={`floating-assistant__message-bubble floating-assistant__message-bubble--${message.role}`}
            style={
              {
                '--bubble-offset': `${(composerOpen ? 7.85 : 0.45) + (bubbles.length - index - 1) * 3.9}rem`,
              } as CSSProperties
            }
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -5, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            aria-live={message.role === 'assistant' ? 'polite' : undefined}
          >
            {message.content}
          </motion.p>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {composerOpen ? (
          <motion.form
            className="floating-assistant__composer"
            onSubmit={sendMessage}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <label htmlFor="assistant-question">问问禅小荔</label>
            <div>
              <input
                ref={inputRef}
                id="assistant-question"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="想了解什么？"
                disabled={isSending}
              />
              <button type="submit" disabled={isSending}>
                {isSending ? '思考中' : '发送'}
              </button>
            </div>
            <small>双击精灵查看 1 小时内的对话</small>
          </motion.form>
        ) : null}
      </AnimatePresence>

      <motion.button
        className={`floating-assistant__avatar floating-assistant__avatar--${mood}`}
        type="button"
        aria-label="唤醒禅小荔智能助手，双击查看对话记录"
        onClick={onAssistantClick}
        onDoubleClick={openHistory}
        whileHover={reduceMotion ? undefined : { y: -3, scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
      >
        <span className="assistant-text-avatar" aria-hidden="true">{ACTION_LABELS[mood]}</span>
      </motion.button>

      <AnimatePresence>
        {historyOpen ? (
          <motion.section
            className="floating-assistant__history"
            aria-label="禅小荔对话记录"
            role="dialog"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 5, scale: 0.98 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <header>
              <div>
                <strong>禅小荔的云游对话</strong>
                <span>记录将在最后一次对话后 1 小时清空</span>
              </div>
              <button type="button" onClick={() => setHistoryOpen(false)} aria-label="关闭对话记录">
                关闭
              </button>
            </header>
            <div className="floating-assistant__history-list">
              {history.length ? (
                history.map((message) => (
                  <p key={message.id} className={`is-${message.role}`}>
                    {message.content}
                  </p>
                ))
              ) : (
                <p className="is-empty">还没有对话。单击精灵即可问我问题。</p>
              )}
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
