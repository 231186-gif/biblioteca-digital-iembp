function toast(msg) {
  document.getElementById('toastarea').innerHTML = `<div class="toast">${esc(msg)}</div>`;
  setTimeout(() => document.getElementById('toastarea').innerHTML = '', 2500);
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function heading(icon, title, sub) {
  return `<div class="page-title"><div class="emblem">${icon}</div><div><h1>${title}</h1><p>${sub}</p></div></div>`;
}

function showModal(html) {
  document.getElementById('modals').innerHTML = `<div class="overlay" onclick="if(event.target===this)hideModal()"><div class="modal">${html}</div></div>`;
}

function hideModal() {
  document.getElementById('modals').innerHTML = '';
}

function authModal(tab = 'login') {
  showModal(`
    <div class="tabs">
      <button class="tab-btn ${tab === 'login' ? 'active' : ''}" onclick="authModal('login')">Iniciar sesión</button>
      <button class="tab-btn ${tab === 'register' ? 'active' : ''}" onclick="authModal('register')">Registrar nueva cuenta</button>
    </div>
    ${tab === 'login' ? `
      <form onsubmit="event.preventDefault(); login(this)">
        <div class="formgrid">
          <label>Usuario<input class="field" name="u" required placeholder="Ingresa tu usuario"></label>
          <label>Contraseña<input class="field" name="p" type="password" required placeholder="••••••••"></label>
        </div>
        <br><button class="btn primary" type="submit">Ingresar</button>
      </form>
    ` : `
      <form onsubmit="event.preventDefault(); registerPublic(this)">
        <div class="formgrid">
          <label>Nombre completo<input class="field" name="name" required placeholder="Ej. Ana Torres"></label>
          <label>Nombre de usuario<input class="field" name="u" required placeholder="Ej. atorres"></label>
          <label>Contraseña<input class="field" name="p" type="password" required></label>
        </div>
        <p class="muted" style="font-size:12px;margin-top:8px">Las cuentas nuevas se registrarán con rol de <b>Estudiante</b>.</p>
        <button class="btn primary" type="submit">Crear cuenta</button>
      </form>
    `}
  `);
}

function login(form) {
  const u = users.find(x => x.username.toLowerCase() === form.u.value.trim().toLowerCase() && x.password === form.p.value);
  if (!u) { toast('Usuario o contraseña incorrectos'); return; }
  account = { id: u.id, name: u.name, username: u.username, role: u.role };
  store('account', account);
  hideModal();
  toast('Bienvenido ' + u.name);
  go('inicio');
}

function registerPublic(form) {
  const uname = form.u.value.trim().toLowerCase();
  if (users.some(x => x.username.toLowerCase() === uname)) { toast('El usuario ya existe'); return; }
  const newUser = { id: Date.now(), name: form.name.value.trim(), username: uname, role: 'Estudiante', password: form.p.value, status: 'Activo' };
  users.push(newUser);
  store('users', users);
  account = { id: newUser.id, name: newUser.name, username: newUser.username, role: newUser.role };
  store('account', account);
  hideModal();
  toast('Cuenta creada con éxito');
  go('inicio');
}

function logout() {
  account = null;
  store('account', null);
  toast('Sesión cerrada');
  go('inicio');
}