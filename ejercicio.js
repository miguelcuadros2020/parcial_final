
const API_URL = 'http://localhost:3000';

const Session = {
  save: user => localStorage.setItem('session', JSON.stringify(user)),
  get: () => JSON.parse(localStorage.getItem('session')),
  clear: () => localStorage.removeItem('session')
};

const Views = {
  render: html => {
    document.body.innerHTML = html;
  },
  renderNode: node => {
    document.body.innerHTML = '';
    document.body.appendChild(node);
  }
};

const Forms = {
  register: () => {
    Views.render(`
      <div>
        <h2>Registro</h2>
        <form id="register">
          <input name="username" placeholder="Usuario" required><br>
          <input name="password" type="password" placeholder="Contraseña" required><br>
          <select name="role">
            <option value="visitante">Visitante</option>
            <option value="admin">Administrador</option>
          </select><br>
          <button type="submit">Registrarse</button>
        </form>
        <button id="toLogin">Ir a Login</button>
      </div>
    `);
    document.getElementById('register').onsubmit = async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      alert('Registrado!');
      Forms.login();
    };
    document.getElementById('toLogin').onclick = Forms.login;
  },
  login: () => {
    Views.render(`
      <div>
        <h2>Login</h2>
        <form id="login">
          <input name="username" placeholder="Usuario" required><br>
          <input name="password" type="password" placeholder="Contraseña" required><br>
          <button type="submit">Ingresar</button>
        </form>
        <button id="toRegister">Ir a Registro</button>
      </div>
    `);
    document.getElementById('login').onsubmit = async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      const res = await fetch(`${API_URL}/users?username=${data.username}&password=${data.password}`);
      const users = await res.json();
      if (users.length) {
        Session.save(users[0]);
        Router.protect();
      } else {
        alert('Usuario o contraseña incorrectos');
      }
    };
    document.getElementById('toRegister').onclick = Forms.register;
  }
};

const Dashboard = {
  show: () => {
    const user = Session.get();
    Views.render(`
      <div>
        <h2>Bienvenido, ${user.username} (${user.role})</h2>
        <button id="logout">Cerrar sesión</button>
        <div id="content"></div>
      </div>
    `);
    document.getElementById('logout').onclick = () => {
      Session.clear();
      Router.protect();
    };
    if (user.role === 'admin') {
      Admin.view();
    } else {
      Visitante.view();
    }
  }
};

const Admin = {
  view: () => {
    const content = document.getElementById('content');
    content.innerHTML = `
      <h3>Eventos</h3>
      <button id="createEvent">Crear evento</button>
      <ul id="eventList"></ul>
    `;
    Admin.loadEvents();
    document.getElementById('createEvent').onclick = () => Admin.eventForm();
  },
  loadEvents: () => {
    fetch(`${API_URL}/events`).then(r => r.json()).then(events => {
      const list = document.getElementById('eventList');
      list.innerHTML = '';
      events.forEach(ev => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${ev.nombre}</strong> (${ev.capacidad} lugares)<br><em>${ev.descripcion || ''}</em>`;
        li.innerHTML += ` <button data-id="${ev.id}" class="edit">Editar</button> <button data-id="${ev.id}" class="delete">Eliminar</button>`;
        list.appendChild(li);
      });
      list.querySelectorAll('.edit').forEach(btn => {
        btn.onclick = () => Admin.eventForm(btn.dataset.id);
      });
      list.querySelectorAll('.delete').forEach(btn => {
        btn.onclick = async () => {
          await fetch(`${API_URL}/events/${btn.dataset.id}`, { method: 'DELETE' });
          Admin.loadEvents();
        };
      });
    });
  },
  eventForm: (id = null) => {
    const content = document.getElementById('content');
    content.innerHTML = `
      <h3>${id ? 'Editar' : 'Crear'} Evento</h3>
      <form id="eventForm">
        <input name="nombre" placeholder="Nombre" required><br>
        <input name="descripcion" placeholder="Descripción" required><br>
        <input name="capacidad" type="number" placeholder="Capacidad" required><br>
        <button type="submit">${id ? 'Actualizar' : 'Crear'}</button>
      </form>
      <button id="back">Volver</button>
    `;
    if (id) {
      fetch(`${API_URL}/events/${id}`).then(r => r.json()).then(ev => {
        document.querySelector('[name=nombre]').value = ev.nombre;
        document.querySelector('[name=descripcion]').value = ev.descripcion || '';
        document.querySelector('[name=capacidad]').value = ev.capacidad;
      });
    }
    document.getElementById('eventForm').onsubmit = async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      if (id) {
        await fetch(`${API_URL}/events/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        await fetch(`${API_URL}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, registrados: [] })
        });
      }
      Dashboard.show();
    };
    document.getElementById('back').onclick = Dashboard.show;
  }
};

const Visitante = {
  view: () => {
    const content = document.getElementById('content');
    content.innerHTML = `
      <h3>Eventos disponibles</h3>
      <ul id="eventList"></ul>
    `;
    fetch(`${API_URL}/events`).then(r => r.json()).then(events => {
      const list = document.getElementById('eventList');
      list.innerHTML = '';
      events.forEach(ev => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${ev.nombre}</strong> (${ev.capacidad} lugares)<br><em>${ev.descripcion || ''}</em>`;
        const user = Session.get();
        const registrados = ev.registrados || [];
        const registrado = registrados.includes(user.username);
        if (registrado) {
          li.innerHTML += ' (Registrado) <button data-id="' + ev.id + '" class="unreg">Eliminar registro</button>';
        } else {
          li.innerHTML += ` <button data-id="${ev.id}" class="reg">Registrarse</button>`;
        }
        list.appendChild(li);
      });
      list.querySelectorAll('.reg').forEach(btn => {
        btn.onclick = async () => {
          const user = Session.get();
          const res = await fetch(`${API_URL}/events/${btn.dataset.id}`);
          const evento = await res.json();
          if ((evento.registrados || []).length < evento.capacidad) {
            await fetch(`${API_URL}/events/${btn.dataset.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ registrados: [...(evento.registrados || []), user.username] })
            });
            alert('Registrado en el evento!');
            Visitante.view();
          } else {
            alert('Evento lleno');
          }
        };
      });
      list.querySelectorAll('.unreg').forEach(btn => {
        btn.onclick = async () => {
          const user = Session.get();
          const res = await fetch(`${API_URL}/events/${btn.dataset.id}`);
          const evento = await res.json();
          const nuevosRegistrados = (evento.registrados || []).filter(u => u !== user.username);
          await fetch(`${API_URL}/events/${btn.dataset.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrados: nuevosRegistrados })
          });
          alert('Registro eliminado!');
          Visitante.view();
        };
      });
    });
  }
};

const Router = {
  protect: () => {
    const user = Session.get();
    if (!user) {
      Forms.login();
    } else {
      Dashboard.show();
    }
  }
};

window.onload = Router.protect;
