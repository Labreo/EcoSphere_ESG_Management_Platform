import { post, get, del } from '../api/client.js';
import { getStoredUser } from '../api/auth.js';

const QUICK_QUESTIONS = [
  'What is Scope 1, 2, and 3 emissions?',
  'How can our company reduce carbon footprint?',
  'What is the GRI reporting framework?',
  'How do I calculate ESG scores?',
  'What are good CSR activity ideas?',
  'What is science-based target setting?',
  'Explain TCFD disclosure requirements',
  'How does EcoSphere gamification work?',
  'What are the UN Sustainable Development Goals?',
  'How to improve governance compliance?',
];

const CAPABILITIES = [
  { icon: '\u{1F33F}', label: 'Carbon accounting & Scope 1/2/3' },
  { icon: '\u{1F4CB}', label: 'GRI, SASB, TCFD frameworks' },
  { icon: '\u{1F91D}', label: 'CSR strategy & activities' },
  { icon: '\u{1F3DB}\uFE0F', label: 'Compliance & audit guidance' },
  { icon: '\u{1F3AF}', label: 'ESG scoring & metrics' },
  { icon: '\u{1F3C6}', label: 'Gamification strategies' },
  { icon: '\u{1F310}', label: 'UN SDGs alignment' },
  { icon: '\u{1F4CA}', label: 'Report interpretation' },
];

export async function renderChatbotPage(container) {
  const user = getStoredUser();
  const sessionId = `session-${Date.now()}`;
  let messages = [
    {
      id: 'welcome',
      role: 'bot',
      content: `Hi **${user?.name?.split(' ')[0] || 'there'}**! I'm **EcoBot** \u{1F30D} — your AI-powered ESG assistant on EcoSphere.

I'm here to help you with:
• **Carbon tracking** — Scope 1, 2 & 3 emissions explained
• **ESG frameworks** — GRI, TCFD, SASB, UN SDGs & more
• **CSR strategy** — Activity ideas and engagement tips
• **Governance** — Compliance, audits, policy management
• **Gamification** — Challenges, badges, and leaderboards

What would you like to explore today?`,
      time: new Date(),
    },
  ];
  let showQuestions = true;
  let isLoading = false;

  function parseMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:var(--bg-secondary);padding:2px 5px;border-radius:4px;font-size:0.85em">$1</code>')
      .replace(/^### (.*$)/gm, '<h4 style="font-size:13px;font-weight:700;margin:12px 0 4px">$1</h4>')
      .replace(/^## (.*$)/gm, '<h3 style="font-size:14px;font-weight:700;margin:14px 0 6px">$1</h3>')
      .replace(/^• (.*$)/gm, '<li style="margin:3px 0 3px 16px;list-style:disc">$1</li>')
      .replace(/^\* (.*$)/gm, '<li style="margin:3px 0 3px 16px;list-style:disc">$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li style="margin:3px 0 3px 16px;list-style:decimal">$2</li>')
      .replace(/\n/g, '<br/>');
  }

  function renderMessages() {
    const chatMessages = container.querySelector('.chat-messages');
    if (!chatMessages) return;

    chatMessages.innerHTML = messages.map(msg => {
      if (msg.id === 'typing') {
        return `<div class="chat-msg-row bot-row">
          <div class="chat-avatar bot-avatar">EB</div>
          <div class="chat-bubble bot-bubble typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>`;
      }
      if (msg.role === 'bot') {
        return `<div class="chat-msg-row bot-row">
          <div class="chat-avatar bot-avatar">EB</div>
          <div class="chat-bubble bot-bubble ${msg.error ? 'error-bubble' : ''}">
            ${parseMarkdown(msg.content)}
            <div class="chat-time">${msg.time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>`;
      }
      return `<div class="chat-msg-row user-row">
        <div class="chat-bubble user-bubble">
          ${msg.content}
          <div class="chat-time">${msg.time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div class="chat-avatar user-avatar">${user?.name?.[0]?.toUpperCase() || 'U'}</div>
      </div>`;
    }).join('');

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function sendMessage(text) {
    const msg = text.trim();
    if (!msg || isLoading) return;

    showQuestions = false;
    messages = messages.filter(m => m.id !== 'typing');
    messages.push({ id: `user-${Date.now()}`, role: 'user', content: msg, time: new Date() });
    messages.push({ id: 'typing', role: 'typing' });
    renderMessages();

    const input = container.querySelector('.chat-input');
    if (input) input.value = '';
    isLoading = true;

    try {
      const data = await post('/chatbot/chat', { message: msg, session_id: sessionId });
      messages = messages.filter(m => m.id !== 'typing');
      messages.push({
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: data.data.response,
        time: new Date(),
      });
    } catch (err) {
      messages = messages.filter(m => m.id !== 'typing');
      messages.push({
        id: `err-${Date.now()}`,
        role: 'bot',
        content: `Sorry, I ran into an issue: *${err.message}*. Please try again.`,
        time: new Date(),
        error: true,
      });
    }
    isLoading = false;
    renderMessages();
  }

  async function clearChat() {
    try {
      await del(`/chatbot/chat/session/${sessionId}`);
    } catch {}
    messages = [{
      id: 'welcome-2',
      role: 'bot',
      content: 'Chat cleared! How can I help you with your ESG journey? \u{1F331}',
      time: new Date(),
    }];
    showQuestions = true;
    renderMessages();
    const qs = container.querySelector('.quick-questions-inline');
    if (qs) qs.style.display = 'flex';
  }

  async function loadTips() {
    try {
      const data = await get('/chatbot/tips');
      return data.data || [];
    } catch {
      return [];
    }
  }

  const tips = await loadTips();

  container.innerHTML = `
    <div class="chatbot-page">
      <style>
        .chatbot-page { display: flex; flex-direction: column; height: calc(100vh - 140px); }
        .chatbot-layout { display: grid; grid-template-columns: 240px 1fr; gap: 16px; flex: 1; overflow: hidden; }
        @media (max-width: 768px) { .chatbot-layout { grid-template-columns: 1fr; } .chatbot-sidebar { display: none; } }
        .chatbot-sidebar { display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
        .quick-q-btn { text-align: left; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 6px 10px; font-size: 11px; color: var(--text-secondary); cursor: pointer; transition: all 0.15s; width: 100%; }
        .quick-q-btn:hover { background: rgba(16,185,129,0.08); border-color: var(--accent-success); color: var(--accent-success); }
        .chat-container { display: flex; flex-direction: column; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); overflow: hidden; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .chat-msg-row { display: flex; gap: 10px; max-width: 85%; }
        .user-row { margin-left: auto; flex-direction: row-reverse; }
        .chat-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .bot-avatar { background: rgba(16,185,129,0.15); color: var(--accent-success); }
        .user-avatar { background: var(--accent-primary); color: #fff; }
        .chat-bubble { padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; line-height: 1.6; }
        .bot-bubble { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color); }
        .error-bubble { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.2); }
        .user-bubble { background: var(--accent-primary); color: #fff; }
        .chat-time { font-size: 10px; color: var(--text-muted); margin-top: 4px; opacity: 0.7; }
        .user-bubble .chat-time { color: rgba(255,255,255,0.7); }
        .typing-indicator { display: flex; align-items: center; gap: 4px; padding: 14px 18px; }
        .typing-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--text-muted); display: inline-block; animation: typingBounce 1.2s infinite; }
        .typing-dot:nth-child(2) { animation-delay: 200ms; }
        .typing-dot:nth-child(3) { animation-delay: 400ms; }
        @keyframes typingBounce { 0%,60%,100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-6px); opacity: 1; } }
        .chat-input-area { padding: 12px 16px; border-top: 1px solid var(--border-color); display: flex; gap: 10px; align-items: flex-end; }
        .chat-input { flex: 1; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 10px 12px; font-size: 13px; resize: none; min-height: 40px; max-height: 120px; color: var(--text-primary); }
        .chat-input:focus { outline: none; border-color: var(--accent-primary); }
        .quick-questions-inline { padding: 8px 16px 0; display: flex; gap: 6px; flex-wrap: wrap; border-top: 1px solid var(--border-color); }
        .quick-q-chip { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); border-radius: 20px; padding: 4px 12px; font-size: 11px; color: var(--accent-success); cursor: pointer; font-weight: 500; transition: all 0.15s; }
        .quick-q-chip:hover { background: rgba(16,185,129,0.2); }
        .capability-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-secondary); }
      </style>

      <div class="page-header" style="margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="chat-avatar bot-avatar" style="width:40px;height:40px;font-size:14px;">EB</div>
          <div>
            <h1 class="page-title" style="margin-bottom:2px;">EcoBot AI</h1>
            <p class="page-subtitle">Your intelligent ESG assistant</p>
          </div>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" id="clear-chat-btn">Clear Chat</button>
        </div>
      </div>

      <div class="chatbot-layout">
        <div class="chatbot-sidebar">
          <div class="view-card card-sm" style="flex:1;overflow:hidden;display:flex;flex-direction:column;">
            <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Quick Questions</div>
            <div style="display:flex;flex-direction:column;gap:4px;overflow-y:auto;flex:1;">
              ${QUICK_QUESTIONS.map(q => `<button class="quick-q-btn quick-q-btn-click">${q}</button>`).join('')}
            </div>
          </div>
          <div class="view-card card-sm">
            <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">EcoBot Expertise</div>
            <div style="display:flex;flex-direction:column;gap:4px;">
              ${CAPABILITIES.map(c => `<div class="capability-item"><span style="font-size:13px;">${c.icon}</span><span>${c.label}</span></div>`).join('')}
            </div>
          </div>
        </div>

        <div class="chat-container">
          <div class="chat-messages"></div>

          <div class="quick-questions-inline" id="quick-questions-inline">
            ${QUICK_QUESTIONS.slice(0, 4).map(q =>
              `<button class="quick-q-chip quick-q-btn-click">${q}</button>`
            ).join('')}
          </div>

          <div class="chat-input-area">
            <textarea class="chat-input" placeholder="Ask EcoBot about ESG, carbon tracking, sustainability frameworks\u2026" rows="1"></textarea>
            <button class="btn btn-primary" id="send-chat-btn" style="flex-shrink:0;height:40px;width:44px;padding:0;justify-content:center;font-size:18px;" title="Send message (Enter)">
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  renderMessages();

  const input = container.querySelector('.chat-input');
  const sendBtn = container.querySelector('#send-chat-btn');
  const clearBtn = container.querySelector('#clear-chat-btn');

  function autoResize() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  }

  input.addEventListener('input', autoResize);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value);
      input.style.height = 'auto';
    }
  });

  sendBtn.addEventListener('click', () => {
    sendMessage(input.value);
    input.style.height = 'auto';
  });

  clearBtn.addEventListener('click', clearChat);

  container.querySelectorAll('.quick-q-btn-click').forEach(btn => {
    btn.addEventListener('click', () => {
      sendMessage(btn.textContent);
    });
  });
}
