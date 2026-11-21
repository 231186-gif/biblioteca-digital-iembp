function go(p) { page = p; pageNo = 1; render(); window.scrollTo(0, 0); }

function render() {
  document.getElementById('nav').innerHTML = navItems
    .filter(n => !['favoritos', 'historial'].includes(n[0]) || account)
    .filter(n => n[0] !== 'admin' || account?.role === 'Administrador')
    .filter(n => n[0] !== 'mis-materiales' || account?.role === 'Docente')
    .map(n => `<button class="${page === n[0] ? 'active' : ''}" onclick="go('${n[0]}')">${n[1]} &nbsp;${n[2]}</button>`).join('');

  document.getElementById('authbar').innerHTML = account
    ? `<span class="userchip">👤 ${esc(account.name)} (${esc(account.role)})</span><button class="btn tiny" onclick="logout()">Cerrar sesión</button>`
    : `<button class="btn primary" onclick="authModal('login')">🔐 Iniciar sesión / Registro</button>`;

  const content = document.getElementById('content');
  const views = {
    inicio: home, acerca: about, areas: areaPage, libros: () => listing('Libro'),
    videos: videosPage, actividades: () => listing('Actividad'), recomendados: recommended,
    comunidad: communityPage, galeria: galleryPage, admin: adminPage,
    'mis-materiales': myResourcesPage, favoritos: favoritesPage, historial: historyPage, buscar: searchPage
  };
  content.innerHTML = (views[page] || home)();
}

function home() {
  const quickNav = [['libros', '📑', 'Libros'], ['videos', '▶️', 'Videos'], ['actividades', '📝', 'Actividades'], ['recomendados', '⭐', 'Recomendados'], ['comunidad', '👥', 'Comunidad']];
  return `
    <section class="hero2" style="--gate:url(${GATE})">
      <div class="hero-in">
        <span class="pill">TAMBURCO · ABANCAY · APURÍMAC</span>
        <h1>Biblioteca Digital</h1>
        <div class="badge">I.E. Micaela Bastidas Puyucahua</div>
        <p>Recursos educativos centralizados en la red local de la institución.</p>
        <form class="homesearch" onsubmit="event.preventDefault(); homeSearch(this.q.value)">
          <input class="field" name="q" placeholder="🔎 Buscar por nombre, área o tema...">
          <button class="btn primary">Buscar</button>
        </form>
        <div class="quick">${quickNav.map(c => `<button onclick="go('${c[0]}')"><span>${c[1]}</span>${c[2]}</button>`).join('')}</div>
      </div>
    </section>
    <h2 class="section-h">Recursos destacados</h2>
    <div class="grid big">${resources.filter(r => r.featured).slice(0, 4).map(card).join('')}</div>
  `;
}

function homeSearch(t) { filters.q = t.trim(); go('buscar'); }
function searchPage() {
  const t = filters.q.toLowerCase();
  const s = resources.filter(r => !t || [r.title, r.description, areas[r.area], r.author].join(' ').toLowerCase().includes(t));
  return heading('🔎', 'RESULTADOS DE BÚSQUEDA', s.length + ' resultados para «' + esc(filters.q) + '»') + `<div class="toolbar"><button class="btn" onclick="go('inicio')">← Volver al inicio</button></div>` + cardGrid(s);
}

function about() { return heading('🏫', 'ACERCA DE LA INSTITUCIÓN', 'Conoce nuestra identidad.') + `<div class="panel"><h2>I.E. Micaela Bastidas Puyucahua</h2><p class="muted">Tamburco – Abancay – Apurímac. Creada el 14 de agosto de 1986 mediante RD N.º 0723-86.</p></div>`; }
function communityPage() { return heading('👥', 'COMUNIDAD EDUCATIVA', 'Orientación de accesos.') + `<div class="panel"><p>Plataforma intranet institucional para estudiantes, docentes y familias.</p></div>`; }
function galleryPage() { return heading('🖼️', 'GALERÍA', 'Imágenes institucionales.') + `<div class="panel"><p>Galería fotográfica oficial.</p></div>`; }
function areaPage() { return heading('📚', 'ÁREAS ACADÉMICAS', 'Explora por materias.') + `<div class="grid">${areas.map((a, i) => `<div class="tile" onclick="selectedArea=${i};filters.area='${i}';go('libros')"><div class="glyph">${icons[i]}</div><h3>${a}</h3><p>${resources.filter(r => r.area === i).length} recursos</p></div>`).join('')}</div>`; }
function videosPage() { return heading('▶️', 'VIDEOS EDUCATIVOS', 'Contenido audiovisual.') + cardGrid(resources.filter(r => r.type === 'Video')); }
function recommended() { return heading('⭐', 'RECOMENDADOS', 'Selección especial.') + cardGrid(resources.filter(r => r.featured)); }
function favoritesPage() { if (!account) return `<div class="empty">Inicia sesión para ver favoritos.</div>`; return heading('♡', 'FAVORITOS', 'Tus materiales guardados.') + cardGrid(resources.filter(r => (favorites[account.id] || []).includes(r.id))); }
function historyPage() { if (!account) return `<div class="empty">Inicia sesión para ver tu historial.</div>`; return heading('🕘', 'HISTORIAL', 'Tus consultas recientes.') + `<div class="panel"><p>Registros de actividad local.</p></div>`; }


function listing(kind) {
  // 1. Obtener los recursos correspondientes
  const eligible = resources.filter(r =>
    kind === 'Actividad'
      ? r.type === 'Actividad'
      : r.type !== 'Video' && r.type !== 'Actividad'
  );

  // 2. Aplicar búsqueda por título y categoría
  const shown = eligible.filter(r => {
    const query = (filters.q || '').trim().toLowerCase();

    const matchesTitle =
      !query || r.title.toLowerCase().includes(query);

    const matchesArea =
      filters.area === '' ||
      String(r.area) === String(filters.area);

    return matchesTitle && matchesArea;
  });

  // 3. Mostrar resultados
  return heading(
    kind === 'Actividad' ? '📝' : '📑',
    kind === 'Actividad' ? 'ACTIVIDADES' : 'BIBLIOTECA DIGITAL',
    `${shown.length} materiales encontrados.`
  ) + cardGrid(shown);
}


function cardGrid(arr) {
  if (!arr.length) return `<div class="empty">No se encontraron recursos.</div>`;
  return `<div class="grid big">${arr.map(card).join('')}</div>`;
}

function card(r) {
  let fav = account && (favorites[account.id] || []).includes(r.id);
  return `<article class="resource"><div class="cover" style="--c:${colors[r.area]}"><span class="labeltag">${esc(r.format)}</span>${icons[r.area]}</div><div class="resbody"><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p><div><span class="pill">${esc(areas[r.area])}</span></div><div class="resource-buttons"><button class="btn tiny" onclick="preview(${r.id})">Vista previa</button><button class="btn tiny" onclick="toggleFav(${r.id})">${fav ? '♥' : '♡'}</button></div></div></article>`;
}

function toggleFav(id) {
  if (!account) { authModal('login'); return; }
  let f = favorites[account.id] || [];
  favorites[account.id] = f.includes(id) ? f.filter(x => x !== id) : [...f, id];
  store('favorites', favorites);
  render();
  toast('Favoritos actualizados');
}

async function preview(id) {
  const r = resources.find(x => x.id === id);
  if (!r) return;
  record(id, r.type === 'Video' ? 'Reproducción' : 'Vista previa');

  let fileUrl = '';
  if (r.hasFile) {
    try {
      const file = await getAttachedFile(id);
      if (file) fileUrl = URL.createObjectURL(file);
    } catch (e) { console.error(e); }
  }

  showModal(`
    <header>
      <h2>${esc(r.title)}</h2>
      <button class="close" onclick="hideModal()">×</button>
    </header>
    <div style="margin: 10px 0;">
      <span class="pill">${esc(areas[r.area])}</span>
      <span class="pill">${r.grado}.º secundaria</span>
      <span class="pill">${esc(r.format)}</span>
    </div>
    <p class="muted">${esc(r.description)}</p>
    <div style="margin-top: 15px; background: #222; border-radius: 10px; overflow: hidden; min-height: 350px; display: flex; align-items: center; justify-content: center;">
      ${fileUrl && (r.format === 'PDF' || r.fileType?.includes('pdf') || r.format === 'TXT') ? `
        <iframe src="${fileUrl}" style="width: 100%; height: 420px; border: none;"></iframe>
      ` : fileUrl && r.fileType?.includes('image') ? `
        <img src="${fileUrl}" style="max-width: 100%; max-height: 420px; object-fit: contain;">
      ` : `
        <div style="color: #fff; text-align: center; padding: 40px;">
          <div style="font-size: 45px; margin-bottom: 10px;">📄</div>
          <p>Vista previa interactiva institucional.</p>
          <p class="muted" style="font-size: 12px;">El documento está registrado en el repositorio local.</p>
        </div>
      `}
    </div>
    <div class="row" style="margin-top: 15px; justify-content: flex-end;">
      <button class="btn primary" onclick="hideModal()">Cerrar visor</button>
    </div>
  `);
}