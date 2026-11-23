const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const dataSource = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const authSource = fs.readFileSync(path.join(__dirname, '../js/auth.js'), 'utf8');

function createAuthService() {
  const sandbox = {
    localStorage: {
      getItem() { return null; },
      setItem() {}
    },
    window: {}
  };
  vm.runInNewContext(`${dataSource}\n${authSource}\nglobalThis.testAuthService = AuthService;`, sandbox);
  return sandbox.testAuthService;
}

test('logs in the seeded administrator with the administrator role', () => {
  const auth = createAuthService();

  const result = auth.login(' ADMIN ', 'admin2026');

  assert.equal(result.success, true);
  assert.equal(result.role, 'Administrador');
  assert.equal(result.session.username, 'admin');
  assert.equal(result.session.role, 'Administrador');
});

test('logs in a student with the student role', () => {
  const auth = createAuthService();

  const result = auth.login('alumno', 'alumno');

  assert.equal(result.success, true);
  assert.equal(result.role, 'Estudiante');
  assert.equal(result.session.role, 'Estudiante');
});

test('rejects invalid credentials and clears the session on logout', () => {
  const auth = createAuthService();

  assert.equal(auth.login('admin', 'wrong-password').success, false);
  assert.equal(auth.login(' ', 'admin2026').success, false);
  assert.equal(auth.currentSession, null);

  auth.login('alumno', 'alumno');
  auth.logout();
  assert.equal(auth.currentSession, null);
});
