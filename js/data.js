'use strict';
const GATE = "images/entrada.jpg", SHIELD = "images/escudo.png";
const navItems = [
  ['inicio', '🏠', 'Inicio'],
  ['acerca', '🏫', 'Nuestra institución'],
  ['areas', '📚', 'Áreas académicas'],
  ['libros', '📑', 'Biblioteca digital'],
  ['videos', '▶️', 'Videos educativos'],
  ['actividades', '📝', 'Actividades'],
  ['recomendados', '⭐', 'Recomendaciones'],
  ['comunidad', '👥', 'Comunidad educativa'],
  ['galeria', '🖼️', 'Galería institucional'],
  ['admin', '⚙️', 'Gestión del Servidor (Admin)'],
  ['mis-materiales', '🗂️', 'Mis materiales (Docente)'],
  ['favoritos', '♡', 'Favoritos'],
  ['historial', '🕘', 'Mi historial']
];

const areas = ['Matemática', 'Comunicación', 'Ciencia y Tecnología', 'Ciencias Sociales', 'Inglés', 'Arte y Cultura', 'Educación Física', 'Educación para el Trabajo', 'Tutoría y Convivencia', 'Educación Religiosa', 'Educación para la Ciudadanía Global'];
const icons = ['📐', '📖', '🔬', '🌎', '🔤', '🎨', '⚽', '💻', '🤝', '🕊️', '🌐'];
const colors = ['#ddba7c', '#d8c5ab', '#a8cdb3', '#c0bfd8', '#b8d6e9', '#e5b5ab', '#b4d2bc', '#ddd2a3', '#c8d4e3', '#e3cfb0', '#c5b8d9'];
const seeds = [['Ecuaciones de primer grado', 0, 1, 'PDF', 'Libro', 'Aprende a resolver ecuaciones paso a paso.'], ['El texto narrativo', 1, 2, 'PDF', 'Guía', 'Estructura, personajes y comprensión.'], ['La célula y sus funciones', 2, 3, 'PDF', 'Libro', 'La unidad básica de los seres vivos.'], ['Civilizaciones de la Antigüedad', 3, 2, 'PDF', 'Libro', 'Historia de las grandes civilizaciones.'], ['Present Simple', 4, 3, 'PPT', 'Presentación', 'Introducción al tiempo presente en inglés.'], ['Técnicas de pintura', 5, 2, 'PDF', 'Ficha', 'Color, composición y creatividad.'], ['Hábitos para una vida saludable', 6, 1, 'PDF', 'Ficha', 'Cuidado integral del cuerpo.'], ['Emprendimiento e idea de negocio', 7, 4, 'DOCX', 'Guía', 'Primeros pasos de una idea emprendedora.'], ['Convivencia escolar', 8, 2, 'PDF', 'Actividad', 'Estrategias para convivir mejor.']];
const base = seeds.map((s, i) => ({ id: i + 1, title: s[0], area: s[1], grado: s[2], format: s[3], type: s[4], description: s[5], author: 'Equipo pedagógico', featured: i < 6, views: Math.floor(50 + i * 17), difficulty: 'Básico', hasFile: false }));

const defaultUsers = [
  { id: 1, name: 'Administrador Principal', username: 'admin', role: 'Administrador', password: 'admin2026', status: 'Activo' },
  { id: 2, name: 'Alumno General', username: 'alumno', role: 'Estudiante', password: 'alumno', status: 'Activo' },
  { id: 3, name: 'Profesor Juan Pérez', username: 'docente', role: 'Docente', password: '123', status: 'Activo' }
];

const read = (k, fb) => { try { return JSON.parse(localStorage.getItem('bdemo_' + k)) ?? fb } catch { return fb } };
const store = (k, v) => localStorage.setItem('bdemo_' + k, JSON.stringify(v));

let users = read('users', defaultUsers);
let account = read('account', null);
let resources = read('resources', base);
let favorites = read('favorites', {});
let history = read('history', []);
let page = 'inicio';
let pageNo = 1;
let filters = { q: '', area: '', grado: '', type: '', format: '' };
let selectedGrade = 3, selectedArea = 0;
let adminTab = 'recursos';

function openLibraryDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('BibliotecaDigitalArchivos', 1);
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains('files')) req.result.createObjectStore('files') };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAttachedFile(id) {
  const db = await openLibraryDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('files', 'readonly').objectStore('files').get(String(id));
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

function record(id, action) {
  if (!account) return;
  history.push({ uid: account.id, id, action, date: new Date().toLocaleString('es-PE') });
  store('history', history);
}

// Capa de persistencia complementaria (Yenifer - módulo base de datos)
const DatabaseManager = {
  initDatabase: function() {
    console.log("Inicializando base de datos local Biblioteca IEMBP...");
    return openLibraryDB();
  },
  getBooks: function() {
    return resources;
  }
};