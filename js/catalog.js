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

  return heading(
    kind === 'Actividad' ? '📝' : '📑',
    kind === 'Actividad' ? 'ACTIVIDADES' : 'BIBLIOTECA DIGITAL',
    `${eligible.length} materiales encontrados.`
  ) + cardGrid(eligible);
}