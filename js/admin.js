function adminPage() {
  if (account?.role !== 'Administrador') return `<div class="empty">Acceso restringido a Administradores de la Red LAN.</div>`;
  return `
    <div class="page-title">
      <div class="emblem">⚙️</div>
      <div>
        <h1>Panel de Control del Servidor LAN</h1>
        <p>Administración centralizada de la I.E. Micaela Bastidas Puyucahua</p>
      </div>
    </div>
    <div class="stats">
      <div class="stat"><b>${resources.length}</b>Recursos en red</div>
      <div class="stat"><b>${users.length}</b>Cuentas de usuario</div>
      <div class="stat"><b>${history.length}</b>Registros de auditoría</div>
      <div class="stat"><b>Activo</b>Estado LAN</div>
    </div>
    <div class="toolbar">
      <button class="btn ${adminTab === 'recursos' ? 'primary' : ''}" onclick="adminTab='recursos';render()">📚 Gestión de Recursos</button>
      <button class="btn ${adminTab === 'usuarios' ? 'primary' : ''}" onclick="adminTab='usuarios';render()">👥 Control de Usuarios</button>
      <button class="btn ${adminTab === 'auditoria' ? 'primary' : ''}" onclick="adminTab='auditoria';render()">📊 Auditoría y Accesos</button>
    </div>
    ${adminTab === 'recursos' ? `
      <div class="panel" style="margin-bottom:16px">
        <h3 style="color:var(--wine)">Registrar nuevo recurso en el inventario</h3>
        <form onsubmit="event.preventDefault(); addResource(this.title.value, this.area.value, Number(this.grado.value), this.format.value); this.reset();" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
          <input type="text" name="title" placeholder="Título del material o libro" required style="flex:2;min-width:180px">
          <select name="area" style="flex:1;min-width:140px">
            ${Object.entries(areas).map(([key, label]) => `<option value="${esc(key)}">${esc(label)}</option>`).join('')}
          </select>
          <select name="grado" style="width:110px">
            <option value="1">1.º Grado</option>
            <option value="2">2.º Grado</option>
            <option value="3">3.º Grado</option>
            <option value="4">4.º Grado</option>
            <option value="5">5.º Grado</option>
          </select>
          <select name="format" style="width:100px">
            <option value="PDF">PDF</option>
            <option value="EPUB">EPUB</option>
            <option value="DOCX">DOCX</option>
          </select>
          <button type="submit" class="btn primary">+ Agregar</button>
        </form>
      </div>
      <div class="panel">
        <h3 style="color:var(--wine)">Catálogo general de la Intranet</h3>
        <div class="tablewrap" style="margin-top:12px">
          <table class="data">
            <tr><th>Recurso</th><th>Área / Grado</th><th>Formato</th><th>Acciones</th></tr>
            ${resources.map(r => `<tr><td><b>${esc(r.title)}</b></td><td>${esc(areas[r.area] || r.area)} (${r.grado}.º)</td><td><span class="pill">${esc(r.format)}</span></td><td><button class="btn tiny" onclick="deleteResource(${r.id})">Eliminar</button></td></tr>`).join('')}
          </table>
        </div>
      </div>
    ` : adminTab === 'usuarios' ? `
      <div class="panel">
        <h3 style="color:var(--wine)">Usuarios registrados en el sistema</h3>
        <div class="tablewrap" style="margin-top:12px">
          <table class="data">
            <tr><th>Nombre completo</th><th>Usuario</th><th>Rol institucional</th><th>Estado</th><th>Acciones</th></tr>
            ${users.map(u => `<tr><td><b>${esc(u.name)}</b></td><td><code>${esc(u.username)}</code></td><td><span class="pill">${esc(u.role)}</span></td><td><span class="status-ok">● Activo</span></td><td>${u.username !== 'admin' ? `<button class="btn tiny" onclick="deleteUser(${u.id})">Dar de baja</button>` : '<span class="muted">Protegido</span>'}</td></tr>`).join('')}
          </table>
        </div>
      </div>
    ` : `
      <div class="panel">
        <h3 style="color:var(--wine)">Registro de Auditoría y Actividad en Red</h3>
        <p class="muted" style="margin-bottom:12px">Monitoreo en tiempo real de las consultas realizadas por las terminales de la red local.</p>
        ${history.length ? `
          <div class="tablewrap">
            <table class="data">
              <tr><th>Timestamp</th><th>ID Usuario</th><th>Acción Registrada</th><th>ID Material</th></tr>
              ${history.slice().reverse().map(h => `<tr><td><code>${esc(h.date)}</code></td><td>Usuario #${h.uid}</td><td><b>${esc(h.action)}</b></td><td>Recurso #${h.id}</td></tr>`).join('')}
            </table>
          </div>
        ` : `<div class="empty">Aún no hay registros de auditoría en esta sesión.</div>`}
      </div>
    `}
  `;
}

function addResource(title, area, grado, format) {
  if (!title || !title.trim()) {
    toast('El título del material es obligatorio');
    return false;
  }
  const newResource = {
    id: Date.now(),
    title: title.trim(),
    area: area || Object.keys(areas)[0] || 'general',
    grado: grado || 1,
    format: format || 'PDF'
  };
  resources.push(newResource);
  store('resources', resources);
  toast('Material registrado en el inventario');
  render();
  return true;
}

function deleteUser(id) {
  if (!confirm('¿Eliminar este usuario?')) return;
  users = users.filter(x => x.id !== id);
  store('users', users);
  toast('Usuario eliminado');
  render();
}

function deleteResource(id) {
  if (!confirm('¿Eliminar este material del catálogo?')) return;
  resources = resources.filter(x => x.id !== id);
  store('resources', resources);
  toast('Material eliminado');
  render();
}

function myResourcesPage() {
  if (account?.role !== 'Docente') return `<div class="empty">Sección exclusiva para docentes.</div>`;
  return heading('🗂️', 'MIS MATERIALES', 'Gestión docente.') + `<div class="panel"><p>Panel de publicaciones del profesor.</p></div>`;
}

render();