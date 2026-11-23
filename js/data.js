// js/data.js - Capa de persistencia y consultas locales (Yenifer)
const DatabaseManager = {
  initDatabase: function() {
    console.log("Inicializando base de datos local Biblioteca IEMBP...");
  },
  getBooks: function() {
    return [
      { id: 1, title: "Fundamentos de Programación", author: "IEMBP", category: "Sistemas" },
      { id: 2, title: "Redes de Computadoras", author: "IEMBP", category: "Infraestructura" }
    ];
  }
};

module.exports = DatabaseManager;