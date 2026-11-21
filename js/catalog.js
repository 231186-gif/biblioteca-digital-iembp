// js/catalog.js - Catálogo de recursos y visor de documentos (Roger)

function cardGrid(arr) {
  if (!arr.length) return `<div class="empty">No se encontraron recursos.</div>`;
  return `<div class="grid big">${arr.map(card).join('')}</div>`;
}

function card(r) {
  let fav = account && (favorites[account.id] || []).includes(r.id);
  return `<article class="resource"><div class="cover" style="--c:${colors[r.area]}"><span class="labeltag">${esc(r.format)}</span>${icons[r.area]}</div><div class="resbody"><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p><div><span class="pill">${esc(areas[r.area])}</span></div><div class="resource-buttons"><button class="btn tiny" onclick="preview(${r.id})">Vista previa</button><button class="btn tiny" onclick="toggleFav(${r.id})">${fav ? '♥' : '♡'}</button></div></div></article>`;
}

function listing(kind) {
  // Obtener los recursos correspondientes (libros o actividades)
  const eligible = resources.filter(r =>
    kind === 'Actividad'
      ? r.type === 'Actividad'
      : r.type !== 'Video' && r.type !== 'Actividad'
  );

  // Aplicar búsqueda por título y categoría
  const shown = eligible.filter(r => {
    const query = (filters.q || '').trim().toLowerCase();
    const matchesTitle = !query || r.title.toLowerCase().includes(query);
    const matchesArea =
      filters.area === '' ||
      String(r.area) === String(filters.area);
    return matchesTitle && matchesArea;
  });

  // Texto del contador (singular o plural)
  const countText = shown.length === 1
    ? '1 material encontrado.'
    : `${shown.length} materiales encontrados.`;

  return heading(
    kind === 'Actividad' ? '📝' : '📑',
    kind === 'Actividad' ? 'ACTIVIDADES' : 'BIBLIOTECA DIGITAL',
    countText
  ) + cardGrid(shown);
}

// Visor de documentos
let activePreviewUrl = null;

function closePreview() {
  hideModal();

  if (activePreviewUrl) {
    URL.revokeObjectURL(activePreviewUrl);
    activePreviewUrl = null;
  }
}

async function preview(id) {
  const r = resources.find(x => x.id === id);

  if (!r) return;

  // Liberar URL anterior
  if (activePreviewUrl) {
    URL.revokeObjectURL(activePreviewUrl);
    activePreviewUrl = null;
  }

  // Registrar consulta
  record(id, r.type === 'Video' ? 'Reproducción' : 'Vista previa');

  let file = null;

  // Recuperar archivo desde IndexedDB
  if (r.hasFile) {
    try {
      file = await getAttachedFile(id);

      if (file) {
        activePreviewUrl = URL.createObjectURL(file);
      }
    } catch (e) {
      console.error('Error al recuperar el archivo:', e);
    }
  }

  const fileUrl = activePreviewUrl;

  // Detectar tipo de archivo
  const isPdf = fileUrl &&
    (r.format?.toUpperCase() === 'PDF' ||
     r.fileType?.toLowerCase().includes('pdf'));

  const isText = fileUrl && r.format === 'TXT';

  const isImage = fileUrl && (
    r.fileType?.toLowerCase().includes('image') ||
    ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].includes(
      r.format?.toUpperCase()
    )
  );

  // Construir visor
  showModal(`
    <header>
      <h2>${esc(r.title)}</h2>
      <button class="close" onclick="closePreview()">×</button>
    </header>

    <div style="margin:10px 0;">
      <span class="pill">${esc(areas[r.area])}</span>
      <span class="pill">${r.grado ? r.grado + '.º secundaria' : ''}</span>
      <span class="pill">${esc(r.format)}</span>
    </div>

    <p class="muted">${esc(r.description)}</p>

    <div style="
      margin-top:15px;
      background:#222;
      border-radius:10px;
      overflow:hidden;
      min-height:350px;
      display:flex;
      align-items:center;
      justify-content:center;
    ">

      ${isPdf || isText ? `
        <iframe
          src="${fileUrl}"
          style="width:100%;height:420px;border:none;">
        </iframe>
      ` : isImage ? `
        <img
          src="${fileUrl}"
          style="max-width:100%;max-height:420px;object-fit:contain;">
      ` : `
        <div style="color:white;text-align:center;padding:40px;">
          <div style="font-size:45px;margin-bottom:10px;">📄</div>
          <p>No hay un archivo disponible para visualizar.</p>
        </div>
      `}

    </div>

    <div class="row" style="margin-top:15px;justify-content:flex-end;">
      <button class="btn primary" onclick="closePreview()">
        Cerrar visor
      </button>
    </div>
  `);
}