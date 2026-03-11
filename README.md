# ⚡ NexoWork — Plataforma de Comunicación Empresarial

> Chat en tiempo real · Videollamadas WebRTC · Archivos · Anuncios · Roles

**Stack:** HTML + CSS + JavaScript + React (CDN) · Node.js + Express · Firebase Firestore/Auth/Storage · PostgreSQL · WebRTC · Netlify

---

## 📁 Estructura del Proyecto

```
nexowork/
├── frontend/               ← Lo que Netlify publica
│   ├── index.html          ← Página principal (React CDN)
│   ├── css/
│   │   └── main.css        ← Todos los estilos
│   └── js/
│       └── app.js          ← Toda la lógica React (Babel)
│
├── backend/                ← API Express (Node.js)
│   ├── package.json
│   └── src/
│       ├── app.js          ← Express app principal
│       ├── middleware/
│       │   └── auth.js     ← JWT middleware
│       ├── db/
│       │   ├── postgres.js ← Conexión PostgreSQL
│       │   └── schema.sql  ← Esquema de base de datos
│       └── routes/
│           ├── auth.js         ← /api/auth/login, /register
│           ├── users.js        ← /api/users
│           ├── channels.js     ← /api/channels + mensajes
│           ├── announcements.js← /api/announcements
│           └── files.js        ← /api/files
│
├── netlify/
│   └── functions/
│       └── api.js          ← Wrapper serverless del Express
│
├── netlify.toml            ← Configuración de Netlify
├── .env.example            ← Variables de entorno (modelo)
└── README.md               ← Este archivo
```

---

## 🚀 Deploy en Netlify — Paso a Paso

### Paso 1: Crear proyecto en Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. **Crear proyecto** → Nombre: `nexowork`
3. Activar **Authentication** → Sign-in method → Email/Password ✅
4. Activar **Firestore Database** → Modo producción
5. Activar **Storage** → Modo producción
6. Ve a **Configuración del proyecto** → **Aplicaciones web** → Agregar app
7. Copia el objeto `firebaseConfig`

### Paso 2: Pegar tu Firebase config

Abre `frontend/index.html` y reemplaza el bloque:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",               // ← tu valor
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Paso 3: Crear base de datos PostgreSQL (opcional)

Para usar el backend Express completo necesitas una BD.
Opciones gratuitas:
- **[Neon](https://neon.tech)** ← recomendado (gratis, serverless)
- **[Supabase](https://supabase.com)** (gratis)

Después de crear la BD, ejecuta el schema:
```bash
psql $POSTGRES_URL -f backend/src/db/schema.sql
```

### Paso 4: Subir a GitHub

```bash
cd nexowork
git init
git add .
git commit -m "NexoWork inicial"
git remote add origin https://github.com/TU_USUARIO/nexowork.git
git push -u origin main
```

### Paso 5: Conectar Netlify

1. Ve a [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Selecciona tu repositorio `nexowork`
3. Netlify detecta `netlify.toml` automáticamente:
   - **Build command:** (vacío)
   - **Publish directory:** `frontend`
4. Click **Deploy site**

### Paso 6: Configurar Variables de Entorno en Netlify

En Netlify: **Site Settings → Environment variables → Add variable**

| Variable | Valor |
|---|---|
| `FIREBASE_API_KEY` | Tu API key de Firebase |
| `FIREBASE_PROJECT_ID` | Tu project ID |
| `JWT_SECRET` | String aleatorio largo (mín. 32 chars) |
| `POSTGRES_URL` | URL de conexión PostgreSQL |
| `NODE_ENV` | `production` |

### Paso 7: ¡Listo! 🎉

Tu app estará en: `https://tu-app.netlify.app`

---

## 🔧 Desarrollo Local

```bash
# Instalar dependencias del backend
cd backend
npm install

# Crear .env (copia .env.example)
cp ../.env.example .env
# Edita .env con tus valores

# Iniciar servidor Express local
npm run dev
# → API en http://localhost:4000

# El frontend no necesita servidor especial.
# Abre frontend/index.html directamente en el navegador
# o usa Live Server en VS Code.
```

---

## 📡 API Endpoints

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/logout` | Cerrar sesión | JWT |
| GET | `/api/users` | Listar usuarios | JWT |
| GET | `/api/channels` | Listar canales | JWT |
| GET | `/api/channels/:id/messages` | Mensajes del canal | JWT |
| POST | `/api/channels/:id/messages` | Enviar mensaje | JWT |
| GET | `/api/announcements` | Listar anuncios | JWT |
| POST | `/api/announcements` | Crear anuncio | JWT (admin) |
| DELETE | `/api/announcements/:id` | Eliminar anuncio | JWT (admin) |
| GET | `/api/files` | Listar archivos | JWT |
| POST | `/api/files` | Registrar archivo | JWT |

En Netlify, los endpoints son:
```
https://tu-app.netlify.app/.netlify/functions/api/auth/login
```

---

## 📱 Funcionalidades

| Módulo | Estado |
|---|---|
| 🔐 Autenticación (Firebase Auth + JWT) | ✅ |
| 🏠 Dashboard con estadísticas y actividad | ✅ |
| 💬 Chat en tiempo real (Firestore onSnapshot) | ✅ |
| 📹 Videollamadas WebRTC (getUserMedia) | ✅ |
| 🖥️ Compartir pantalla (getDisplayMedia) | ✅ |
| 📁 Subida de archivos (Firebase Storage) | ✅ |
| 📢 Anuncios corporativos | ✅ |
| ⚙️ Administración de usuarios | ✅ |
| 🔔 Notificaciones en tiempo real | ✅ |
| 📱 Diseño responsive | ✅ |

---

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt** (12 rounds)
- Autenticación con **JWT** en todas las rutas protegidas
- **Firebase Security Rules** en Firestore y Storage
- Headers de seguridad configurados en `netlify.toml`
- Variables de entorno nunca en el código fuente

### Firebase Security Rules recomendadas (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /channels/{channelId}/messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
    }
    match /announcements/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

---

## 🎨 Diseño

- **Tema:** Dark corporativo con acentos azul eléctrico
- **Fuentes:** Syne (títulos) + Manrope (cuerpo)
- **Colores:** `#2563EB` azul principal · `#10B981` verde · `#EF4444` rojo
- **Componentes:** React puro con CDN (sin build step)

---

*NexoWork — Construido con ❤️ para equipos que trabajan de verdad.*
