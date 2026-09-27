// Command palette (⌘K / Ctrl K) and global keyboard shortcuts.

const isTyping = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

export function initPalette({ commands, shortcuts }) {
  const cmdk = document.getElementById('cmdk');
  const q = document.getElementById('cmdk-q');
  const list = document.getElementById('cmdk-list');
  const keys = document.getElementById('keys');
  let filtered = commands, sel = 0, lastFocus = null;

  const render = () => {
    const term = q.value.trim().toLowerCase();
    filtered = commands.filter((c) => `${c.label} ${c.g} ${c.hint || ''} ${c.k || ''}`.toLowerCase().includes(term));
    sel = Math.min(sel, Math.max(filtered.length - 1, 0));
    list.textContent = '';
    if (!filtered.length) {
      const li = document.createElement('li');
      li.className = 'cmdk-empty';
      li.textContent = 'No results';
      list.append(li);
      return;
    }
    let group = '';
    filtered.forEach((c, i) => {
      if (c.g !== group) {
        group = c.g;
        const h = document.createElement('li');
        h.className = 'cmdk-group'; h.textContent = group; h.setAttribute('role', 'presentation');
        list.append(h);
      }
      const li = document.createElement('li');
      li.className = 'cmdk-item';
      li.id = `cmdk-opt-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', i === sel);
      const ic = document.createElement('span'); ic.className = 'ic'; ic.textContent = c.ic;
      const lbl = document.createElement('span'); lbl.className = 'lbl'; lbl.textContent = c.label;
      li.append(ic, lbl);
      if (c.hint) { const h = document.createElement('span'); h.className = 'hint'; h.textContent = c.hint; li.append(h); }
      li.addEventListener('mousemove', () => { if (sel !== i) { sel = i; mark(); } });
      li.addEventListener('click', () => exec(i));
      list.append(li);
    });
    q.setAttribute('aria-activedescendant', `cmdk-opt-${sel}`);
  };
  const mark = () => {
    list.querySelectorAll('.cmdk-item').forEach((el, i) => {
      el.setAttribute('aria-selected', i === sel);
      if (i === sel) el.scrollIntoView({ block: 'nearest' });
    });
    q.setAttribute('aria-activedescendant', `cmdk-opt-${sel}`);
  };
  const open = () => {
    lastFocus = document.activeElement;
    cmdk.hidden = false; q.value = ''; sel = 0; render();
    // On touch screens, focusing the search box would pop up the keyboard over the menu.
    if (matchMedia('(pointer: coarse)').matches) cmdk.querySelector('.cmdk-panel').focus({ preventScroll: true });
    else q.focus();
  };
  const close = () => { cmdk.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); };
  const exec = (i) => { const c = filtered[i]; if (!c) return; close(); c.run(); };

  const openKeys = () => { lastFocus = document.activeElement; keys.hidden = false; keys.querySelector('button').focus(); };
  const closeKeys = () => { keys.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); };

  document.getElementById('cmdk-open').addEventListener('click', open);
  cmdk.addEventListener('click', (e) => { if (e.target === cmdk || e.target.closest('.cmdk-close')) close(); });
  keys.addEventListener('click', (e) => { if (e.target === keys || e.target.closest('.keys-close')) closeKeys(); });
  q.addEventListener('input', () => { sel = 0; render(); });
  q.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % filtered.length; mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + filtered.length) % filtered.length; mark(); }
    else if (e.key === 'Enter') { e.preventDefault(); exec(sel); }
    else if (e.key === 'Tab') e.preventDefault(); // keep focus inside the dialog
  });

  // "g" then a letter jumps to a section, vim-style.
  let pendingG = 0;
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      cmdk.hidden ? open() : close();
      return;
    }
    if (e.key === 'Escape') {
      if (!cmdk.hidden) close();
      if (!keys.hidden) closeKeys();
      return;
    }
    if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey || !cmdk.hidden) return;

    if (pendingG && Date.now() - pendingG < 1200) {
      pendingG = 0;
      const hit = shortcuts.goto[e.key.toLowerCase()];
      if (hit) { e.preventDefault(); hit(); }
      return;
    }
    if (e.key === 'g') { pendingG = Date.now(); return; }
    if (e.key === '?') { e.preventDefault(); keys.hidden ? openKeys() : closeKeys(); return; }
    const fn = shortcuts.keys[e.key];
    if (fn) { e.preventDefault(); fn(); }
  });

  return { open, openKeys };
}
