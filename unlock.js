(() => {
  const storageKey = 'timesheet-site-passphrase';
  const form = document.getElementById('unlock-form');
  const input = document.getElementById('passphrase');
  const message = document.getElementById('message');
  const button = form.querySelector('button');
  const bytes = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));
  let saved = null;
  try { saved = localStorage.getItem(storageKey); } catch { /* Storage may be disabled. */ }

  async function unlock(passphrase, remember) {
    button.disabled = true;
    message.textContent = 'Unlocking…';
    try {
      const response = await fetch(new URL('payload.json', document.baseURI), { cache: 'no-cache' });
      if (!response.ok) throw new Error('Unable to load the encrypted site.');
      const payload = await response.json();
      if (payload.version !== 1) throw new Error('Unsupported encrypted site format.');
      const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
      const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: bytes(payload.salt), iterations: payload.iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      let decrypted;
      try { decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(payload.iv) }, key, bytes(payload.data)); }
      catch { throw new Error('Incorrect passphrase or damaged site data.'); }
      const site = JSON.parse(new TextDecoder().decode(decrypted));
      if (remember) { try { localStorage.setItem(storageKey, passphrase); } catch { /* The site can still open without storage. */ } }
      const doc = new DOMParser().parseFromString(site.html, 'text/html');
      document.title = doc.title;
      document.head.replaceChildren(...doc.head.childNodes);
      document.body.replaceChildren(...doc.body.childNodes);
      const style = document.createElement('style');
      style.textContent = site.css;
      document.head.append(style);
      const script = document.createElement('script');
      script.type = 'module';
      script.src = URL.createObjectURL(new Blob([site.js], { type: 'text/javascript' }));
      document.body.append(script);
    } catch (error) {
      if (!remember) { try { localStorage.removeItem(storageKey); } catch {} }
      message.textContent = error.message;
      button.disabled = false;
      input.focus();
    }
  }
  form.addEventListener('submit', event => { event.preventDefault(); unlock(input.value, true); });
  document.getElementById('forget').addEventListener('click', () => {
    try { localStorage.removeItem(storageKey); } catch {}
    input.value = '';
    message.textContent = 'Saved passphrase forgotten.';
  });
  if (saved) unlock(saved, false);
})();
