// Chat widget — injects a floating chat popup available across pages
(function(){
  // Avoid duplicate initialization
  if (window.__SpaceverseChatWidget) return;
  window.__SpaceverseChatWidget = true;

  const css = `
  #sv-chat-btn {position:fixed; right:20px; bottom:20px; z-index:99999; background:#0b2545; color:#fff; border-radius:50%; width:56px; height:56px; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 18px rgba(0,0,0,.35); cursor:pointer}
  #sv-chat-modal {position:fixed; right:20px; bottom:86px; width:360px; max-width:calc(100% - 40px); z-index:99999; background:#0f1724; color:#e6f1ff; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,.4); display:none; overflow:hidden}
  #sv-chat-header{padding:12px 14px; font-weight:600; background:linear-gradient(90deg,#06243b 0,#083554 100%); display:flex; justify-content:space-between; align-items:center}
  #sv-chat-body{padding:10px; max-height:300px; overflow:auto; font-size:13px}
  #sv-chat-input-row{display:flex; padding:10px; gap:8px; background:linear-gradient(180deg, transparent, rgba(255,255,255,0.02));}
  #sv-chat-input{flex:1; padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.06); background:transparent; color:inherit}
  #sv-chat-send{padding:10px 12px; border-radius:6px; background:#64FFDA; color:#04202b; border:none; cursor:pointer}
  .sv-chat-msg{margin:8px 0; padding:8px 10px; border-radius:6px}
  .sv-chat-msg.user{background:rgba(100,255,218,0.08); text-align:right}
  .sv-chat-msg.bot{background:rgba(255,255,255,0.03)}
  .sv-chat-system{font-size:12px; opacity:0.8; margin:6px 0}
  `;

  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);

  // Create elements
  const btn = document.createElement('div');
  btn.id = 'sv-chat-btn';
  btn.title = 'Ask SpaceVerse Chatbot';
  btn.innerHTML = '💬';

  const modal = document.createElement('div');
  modal.id = 'sv-chat-modal';
  modal.innerHTML = `
    <div id="sv-chat-header">Space Chat <span style="font-size:12px; opacity:.9">(powered by Gemini AI)</span><button id="sv-chat-close" style="background:transparent;border:none;color:inherit;font-size:16px;cursor:pointer">✕</button></div>
    <div id="sv-chat-body"><div class="sv-chat-system">Hello! I'm powered by Gemini AI. Ask me about space, astronomy, planets, rockets, black holes, or any space-related topics!</div></div>
    <div id="sv-chat-input-row"><input id="sv-chat-input" placeholder="Ask a question..." aria-label="Ask Space"/><button id="sv-chat-send">Send</button></div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(modal);

  const openModal = () => modal.style.display = 'block';
  const closeModal = () => modal.style.display = 'none';

  btn.addEventListener('click', () => {
    openModal();
    document.getElementById('sv-chat-input').focus();
  });
  modal.querySelector('#sv-chat-close').addEventListener('click', closeModal);

  const body = modal.querySelector('#sv-chat-body');
  const input = modal.querySelector('#sv-chat-input');
  const send = modal.querySelector('#sv-chat-send');

  function appendMessage(text, who='bot'){
    const div = document.createElement('div');
    div.className = 'sv-chat-msg ' + (who === 'user' ? 'user' : 'bot');
    div.innerHTML = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  async function sendQuestion() {
    const q = input.value.trim();
    if (!q) return;
    appendMessage(`<strong>Q:</strong> ${escapeHtml(q)}`, 'user');
    input.value = '';

    // show temporary system message
    const sys = document.createElement('div'); sys.className = 'sv-chat-system'; sys.textContent = 'Thinking...'; body.appendChild(sys); body.scrollTop = body.scrollHeight;

    try {
      // Try authenticated endpoint first
      let res = await fetch('/api/simulator/chatbot', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ question: q })
      });

      // If not authenticated, fall back to public endpoint
      if (res.status === 401) {
        res = await fetch('/api/simulator/chatbot-public', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ question: q })
        });
      }

      const data = await res.json();
      if (data && data.success) {
        sys.remove();
        appendMessage(`<strong>A:</strong> ${escapeHtml(data.answer || data.message || 'No response')}`,'bot');
      } else {
        sys.textContent = 'Error: ' + (data.message || 'Unknown error.');
      }
    } catch (e) {
      sys.textContent = 'Network error. Please try again.';
      console.error('Chat widget error:', e);
    }
  }

  send.addEventListener('click', sendQuestion);
  input.addEventListener('keydown', function(e){ if (e.key === 'Enter') sendQuestion(); });

  function escapeHtml(s){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

})();