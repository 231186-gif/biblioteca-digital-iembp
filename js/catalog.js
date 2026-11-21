// js/catalog.js - Catálogo de recursos y visor de documentos (Roger)

function cardGrid(arr) {
  if (!arr.length) return `<div class="empty">No se encontraron recursos.</div>`;
  return `<div class="grid big">${arr.map(card).join('')}</div>`;
}