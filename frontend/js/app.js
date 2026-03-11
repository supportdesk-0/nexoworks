// ═══════════════════════════════════════════════════════════
//  NEXOWORK — Main React Application
//  Frontend: HTML + CSS + JavaScript + React (CDN)
//  Backend:  Node.js + Express (see /backend/)
//  DB:       Firebase Firestore + Storage
//  Video:    WebRTC (peer-to-peer, no server needed for 1:1)
// ═══════════════════════════════════════════════════════════

const { useState, useEffect, useRef, useCallback } = React;

// ─── Demo data (used until Firebase is connected) ───────────
const DEMO_USERS = [
  { id: "u1", name: "Ana García",    role: "Diseñadora UI",  avatar: "AG", dept: "Diseño",             online: true,  color: "#8B5CF6" },
  { id: "u2", name: "Carlos López",  role: "Dev Backend",    avatar: "CL", dept: "Tecnología",         online: true,  color: "#2563EB" },
  { id: "u3", name: "María Torres",  role: "Marketing",      avatar: "MT", dept: "Marketing",          online: false, color: "#EC4899" },
  { id: "u4", name: "Pedro Ruiz",    role: "Gerente",        avatar: "PR", dept: "Dirección",          online: true,  color: "#10B981" },
  { id: "u5", name: "Laura Méndez",  role: "RRHH",           avatar: "LM", dept: "Recursos Humanos",   online: true,  color: "#F59E0B" },
  { id: "u6", name: "Jorge Salas",   role: "Dev Frontend",   avatar: "JS", dept: "Tecnología",         online: false, color: "#14B8A6" },
];

const DEMO_CHANNELS = [
  { id: "general",     name: "general",     icon: "#", unread: 3 },
  { id: "tecnologia",  name: "tecnología",  icon: "#", unread: 0 },
  { id: "marketing",   name: "marketing",   icon: "#", unread: 1 },
  { id: "diseno",      name: "diseño",      icon: "#", unread: 2 },
  { id: "anuncios",    name: "anuncios",    icon: "📢", unread: 1 },
];

const DEMO_MESSAGES = {
  general: [
    { id: "m1", uid: "u2", text: "Buenos días! Recordatorio: reunión de equipo hoy a las 3pm 👋", time: "09:15", reactions: [{ emoji: "👍", count: 4 }, { emoji: "✅", count: 2 }] },
    { id: "m2", uid: "u1", text: "Perfecto, ya tengo el mockup listo para mostrar 🎨", time: "09:22", reactions: [] },
    { id: "m3", uid: "u4", text: "Excelente trabajo equipo. El cliente quedó muy satisfecho con los avances del Q2.", time: "10:05", reactions: [{ emoji: "🎉", count: 6 }, { emoji: "🔥", count: 3 }] },
    { id: "m4", uid: "u5", text: "Se ha subido el calendario de vacaciones. Pueden revisarlo en el módulo de RRHH.", time: "11:30", reactions: [{ emoji: "👏", count: 2 }] },
    { id: "m5", uid: "u2", text: "Deploy en producción completado sin errores ✅ El nuevo módulo ya está activo.", time: "14:20", reactions: [{ emoji: "🚀", count: 5 }] },
  ],
  tecnologia: [
    { id: "t1", uid: "u2", text: "PR #142 listo para revisión — migración a PostgreSQL 16", time: "08:30", reactions: [{ emoji: "👀", count: 2 }] },
    { id: "t2", uid: "u6", text: "Revisado! Algunos comentarios menores. En general muy bien 💯", time: "09:00", reactions: [] },
  ],
  marketing: [
    { id: "mk1", uid: "u3", text: "Resultados de la campaña Q2: +34% en conversiones 📈", time: "10:00", reactions: [{ emoji: "🎉", count: 8 }] },
  ],
  diseno: [
    { id: "d1", uid: "u1", text: "Nuevo sistema de diseño v2.0 subido al Figma ✨", time: "09:00", reactions: [{ emoji: "❤️", count: 3 }] },
  ],
  anuncios: [
    { id: "a1", uid: "u4", text: "🎉 OFICIAL: La empresa alcanzó sus metas del primer semestre. ¡Habrá bonificación!", time: "08:00", reactions: [{ emoji: "🎉", count: 15 }, { emoji: "🙌", count: 12 }] },
  ],
};

const DEMO_ANNOUNCEMENTS = [
  { id: "an1", title: "Metas del Semestre Alcanzadas", content: "Con gran orgullo anunciamos que hemos superado nuestras metas del primer semestre en un 18%. Gracias a todo el equipo por su esfuerzo y dedicación. Se programará una celebración para la próxima semana.", author: "Pedro Ruiz", authorId: "u4", date: "Hoy, 08:00", important: true },
  { id: "an2", title: "Nuevo Sistema de Gestión ERP", content: "A partir del lunes 15 estaremos usando el nuevo sistema ERP. Se realizará una capacitación obligatoria el viernes a las 4pm. Por favor confirmar asistencia con RRHH.", author: "Laura Méndez", authorId: "u5", date: "Ayer, 15:30", important: false },
  { id: "an3", title: "Actualización: Trabajo Remoto", content: "Se han actualizado las políticas de trabajo remoto. El nuevo esquema permite 3 días desde casa y 2 días en oficina por semana. Más detalles en el portal de RRHH.", author: "Laura Méndez", authorId: "u5", date: "Hace 3 días", important: false },
];

const DEMO_MEETINGS = [
  { id: "meet1", title: "Reunión de Equipo General",   time: "Hoy 15:00",     participants: ["u1","u2","u3","u4"] },
  { id: "meet2", title: "Demo con Cliente",             time: "Mañana 10:00",  participants: ["u2","u4","u6"] },
  { id: "meet3", title: "Sprint Planning Q3",           time: "Mié 09:00",     participants: ["u2","u6","u1"] },
];

const DEMO_FILES = [
  { id: "f1", name: "Presentación Q2 2026.pptx", size: "4.2 MB", type: "ppt", date: "Hoy",          author: "Pedro Ruiz",   icon: "📊" },
  { id: "f2", name: "Informe Anual 2025.pdf",    size: "12.8 MB", type: "pdf", date: "Ayer",         author: "Laura Méndez", icon: "📄" },
  { id: "f3", name: "Diseño UI v2.0.fig",        size: "8.1 MB",  type: "fig", date: "Hace 2 días",  author: "Ana García",   icon: "🎨" },
  { id: "f4", name: "Base de datos clientes.xlsx", size: "2.3 MB", type: "xls", date: "Hace 3 días", author: "María Torres", icon: "📈" },
  { id: "f5", name: "Documentación API.md",      size: "0.8 MB",  type: "doc", date: "Hace 5 días",  author: "Carlos López", icon: "📝" },
  { id: "f6", name: "Assets corporativos.zip",   size: "18.5 MB", type: "zip", date: "Hace 1 sem",   author: "Ana García",   icon: "🗜️" },
];

// ─── Helpers ─────────────────────────────────────────────────
function getUserById(id) { return DEMO_USERS.find(u => u.id === id) || DEMO_USERS[0]; }

function Avatar({ user, size = 36, showStatus = true }) {
  const fontSize = Math.round(size * 0.35);
  const statusSize = Math.round(size * 0.28);
  return (
    <div className="avatar" style={{
      width: size, height: size,
      background: `linear-gradient(135deg, ${user.color}cc, ${user.color})`,
      fontSize,
      boxShadow: `0 2px 8px ${user.color}40`,
      flexShrink: 0,
    }}>
      {user.avatar}
      {showStatus && (
        <div className="avatar-status" style={{
          width: statusSize, height: statusSize,
          background: user.online ? "#10B981" : "#374151",
          bottom: 1, right: 1,
        }} />
      )}
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Demo login bypass
  const handleDemoLogin = () => {
    onLogin({ id: "u1", name: "Ana García", role: "Diseñadora UI", avatar: "AG", dept: "Diseño", online: true, color: "#8B5CF6", email: "demo@nexowork.com" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (!window.FB) { handleDemoLogin(); return; }
      if (isRegister) {
        const cred = await window.FB.createUserWithEmailAndPassword(window.FB.auth, email, password);
        await window.FB.setDoc(window.FB.doc(window.FB.db, "users", cred.user.uid), {
          name: displayName || email.split("@")[0],
          email, role: "Empleado", dept: "General",
          avatar: (displayName || email)[0].toUpperCase() + (displayName || email)[1]?.toUpperCase() || "U",
          color: "#2563EB", online: true, createdAt: new Date().toISOString()
        });
      } else {
        await window.FB.signInWithEmailAndPassword(window.FB.auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(/ \(auth\/.*\)/, ""));
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-left">
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <span className="auth-logo-text">NexoWork</span>
        </div>
        <h1 className="auth-headline">
          Comunica.<br /><span>Colabora.</span><br />Avanza.
        </h1>
        <p className="auth-subline">
          La plataforma de comunicación interna que centraliza mensajes, reuniones, archivos y anuncios de tu empresa en un solo lugar.
        </p>
        <div className="auth-features">
          {[
            { icon: "💬", text: "Chat en tiempo real por canales y directo" },
            { icon: "📹", text: "Videollamadas con WebRTC — sin plugins" },
            { icon: "📁", text: "Gestión de archivos integrada" },
            { icon: "📢", text: "Anuncios corporativos con notificaciones" },
          ].map((f, i) => (
            <div key={i} className="auth-feature">
              <div className="auth-feature-dot">{f.icon}</div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-card">
          <h2 className="auth-form-title">{isRegister ? "Crear cuenta" : "Bienvenido de vuelta"}</h2>
          <p className="auth-form-sub">{isRegister ? "Únete a tu equipo en NexoWork" : "Inicia sesión en tu espacio de trabajo"}</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <input className="form-input" type="text" placeholder="Ana García" value={displayName} onChange={e => setDisplayName(e.target.value)} required={isRegister} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input className="form-input" type="email" placeholder="nombre@empresa.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Cargando..." : (isRegister ? "Crear cuenta" : "Iniciar sesión")}
            </button>
          </form>

          <div style={{ margin: "16px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>— o —</div>
          <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={handleDemoLogin}>
            🚀 Entrar con cuenta demo
          </button>

          <div className="auth-toggle">
            {isRegister ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
            <span onClick={() => { setIsRegister(!isRegister); setError(""); }}>{isRegister ? "Iniciar sesión" : "Registrarse"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ active, setActive, activeChannel, setActiveChannel, currentUser, unreadCounts }) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: "dashboard",      icon: "🏠", label: "Dashboard" },
    { id: "chat",           icon: "💬", label: "Mensajes" },
    { id: "videocall",      icon: "📹", label: "Videollamadas" },
    { id: "files",          icon: "📁", label: "Archivos" },
    { id: "announcements",  icon: "📢", label: "Anuncios" },
    { id: "admin",          icon: "⚙️", label: "Administración" },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="logo-mark">⚡</div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div className="logo-text">NexoWork</div>
            <div className="logo-sub">Empresa Demo S.A.</div>
          </div>
        )}
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button key={item.id} className={`nav-item ${active === item.id ? "active" : ""}`} onClick={() => setActive(item.id)}>
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}

        {!collapsed && active === "chat" && (
          <>
            <div className="nav-section-title">Canales</div>
            {DEMO_CHANNELS.map(ch => (
              <button key={ch.id} className={`channel-item ${activeChannel === ch.id ? "active" : ""}`} onClick={() => setActiveChannel(ch.id)}>
                <span className="channel-name">{ch.icon} {ch.name}</span>
                {(unreadCounts[ch.id] || ch.unread) > 0 && <span className="badge">{unreadCounts[ch.id] || ch.unread}</span>}
              </button>
            ))}
            <div className="nav-section-title">Mensajes Directos</div>
            {DEMO_USERS.filter(u => u.id !== currentUser.id).slice(0, 4).map(u => (
              <button key={u.id} className="channel-item" onClick={() => setActive("chat")}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: u.online ? "#10B981" : "var(--border)", display: "inline-block", marginRight: 6, flexShrink: 0 }} />
                <span className="channel-name">{u.name.split(" ")[0]} {u.name.split(" ")[1][0]}.</span>
              </button>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <Avatar user={currentUser} size={32} />
        {!collapsed && (
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser.name}</div>
            <div style={{ fontSize: 11, color: "#10B981" }}>● En línea</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Notification Dropdown ────────────────────────────────────
function NotificationDropdown({ show }) {
  if (!show) return null;
  const notifs = [
    { text: <><strong>Carlos López</strong> envió un mensaje en #tecnología</>, time: "hace 2 min", icon: "💬", unread: true },
    { text: <><strong>Pedro Ruiz</strong> publicó un anuncio importante</>, time: "hace 15 min", icon: "📢", unread: true },
    { text: <>Reunión de equipo en <strong>30 minutos</strong></>, time: "hace 20 min", icon: "📹", unread: true },
    { text: <><strong>Ana García</strong> compartió un archivo</>, time: "hace 1 hora", icon: "📁", unread: false },
    { text: <><strong>Laura</strong> te mencionó en #general</>, time: "hace 2 horas", icon: "💬", unread: false },
  ];
  return (
    <div className="notif-dropdown">
      <div className="notif-header">
        <span className="notif-title">Notificaciones</span>
        <button className="notif-clear">Marcar todo leído</button>
      </div>
      {notifs.map((n, i) => (
        <div key={i} className={`notif-item ${n.unread ? "unread" : ""}`}>
          <div className="notif-icon">{n.icon}</div>
          <div style={{ flex: 1 }}>
            <div className="notif-text">{n.text}</div>
            <div className="notif-time">{n.time}</div>
          </div>
          {n.unread && <div className="notif-unread-dot" />}
        </div>
      ))}
    </div>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────
function TopBar({ currentUser, onLogout }) {
  const [showNotifs, setShowNotifs] = useState(false);
  return (
    <div className="topbar">
      <div className="search-bar">
        <span style={{ color: "var(--text-muted)", fontSize: 15 }}>🔍</span>
        <input placeholder="Buscar mensajes, archivos, personas..." />
      </div>
      <div className="topbar-actions">
        <div style={{ position: "relative" }}>
          <button className="icon-btn" onClick={() => setShowNotifs(s => !s)}>
            🔔
            <span className="notif-dot">3</span>
          </button>
          <NotificationDropdown show={showNotifs} />
          {showNotifs && <div style={{ position: "fixed", inset: 0, zIndex: 100 }} onClick={() => setShowNotifs(false)} />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
          <Avatar user={currentUser} size={32} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{currentUser.name}</span>
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{currentUser.role}</span>
          </div>
        </div>
        <button className="icon-btn" title="Cerrar sesión" onClick={onLogout}>🚪</button>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────
function Dashboard({ currentUser }) {
  const stats = [
    { label: "Mensajes Hoy", value: "24", icon: "💬", bg: "rgba(37,99,235,0.12)" },
    { label: "Reuniones",    value: "3",  icon: "📹", bg: "rgba(139,92,246,0.12)" },
    { label: "Archivos",     value: "12", icon: "📁", bg: "rgba(16,185,129,0.12)" },
    { label: "Anuncios",     value: "2",  icon: "📢", bg: "rgba(245,158,11,0.12)" },
  ];
  const now = new Date().toLocaleDateString("es", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="content-area">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Buenos días, {currentUser.name.split(" ")[0]} 👋</h1>
        <p className="page-sub" style={{ textTransform: "capitalize" }}>{now} · Aquí está tu resumen del día</p>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Actividad Reciente</span>
            <button className="card-action">Ver todo</button>
          </div>
          {DEMO_MESSAGES.general.slice(-4).reverse().map(msg => {
            const user = getUserById(msg.uid);
            return (
              <div key={msg.id} className="activity-item">
                <Avatar user={user} size={34} />
                <div className="activity-content">
                  <div className="activity-name">{user.name}</div>
                  <div className="activity-text">{msg.text}</div>
                </div>
                <div className="activity-time">{msg.time}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">📢 Anuncios</span></div>
            {DEMO_ANNOUNCEMENTS.slice(0, 2).map((a, i) => (
              <div key={a.id} className="activity-item">
                <div style={{ width: 36, height: 36, borderRadius: 10, background: a.important ? "rgba(239,68,68,0.12)" : "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {a.important ? "📌" : "📢"}
                </div>
                <div className="activity-content">
                  <div className="activity-name">{a.title}</div>
                  <div className="activity-text">{a.content.slice(0, 60)}...</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{a.date}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">📅 Próximas Reuniones</span></div>
            {DEMO_MEETINGS.map(m => (
              <div key={m.id} className="activity-item" style={{ alignItems: "center" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📹</div>
                <div className="activity-content">
                  <div className="activity-name" style={{ fontSize: 13 }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.time}</div>
                </div>
                <button className="join-btn" style={{ padding: "5px 10px", fontSize: 11, marginLeft: 0 }}>Unirse</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chat View ────────────────────────────────────────────────
function ChatView({ activeChannel, currentUser }) {
  const [allMessages, setAllMessages] = useState(DEMO_MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const channel = DEMO_CHANNELS.find(c => c.id === activeChannel);
  const messages = allMessages[activeChannel] || [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length, activeChannel]);

  // Firebase real-time listener
  useEffect(() => {
    if (!window.FB) return;
    const q = window.FB.query(
      window.FB.collection(window.FB.db, "channels", activeChannel, "messages"),
      window.FB.orderBy("createdAt", "asc"),
      window.FB.limit(100)
    );
    const unsub = window.FB.onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({
        id: d.id, uid: d.data().uid, text: d.data().text,
        time: d.data().createdAt?.toDate?.()?.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }) || "ahora",
        reactions: d.data().reactions || []
      }));
      if (msgs.length > 0) setAllMessages(prev => ({ ...prev, [activeChannel]: msgs }));
    });
    return () => unsub();
  }, [activeChannel]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    const time = new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
    const newMsg = { id: Date.now().toString(), uid: currentUser.id, text, time, reactions: [] };
    setAllMessages(prev => ({ ...prev, [activeChannel]: [...(prev[activeChannel] || []), newMsg] }));
    setInput("");
    inputRef.current?.focus();

    // Write to Firebase if connected
    if (window.FB) {
      try {
        await window.FB.addDoc(window.FB.collection(window.FB.db, "channels", activeChannel, "messages"), {
          uid: currentUser.id, text, reactions: [],
          createdAt: window.FB.serverTimestamp()
        });
      } catch (e) { /* silent */ }
    }
  };

  return (
    <div className="chat-layout" style={{ height: "calc(100vh - 58px)" }}>
      <div className="chat-main">
        <div className="chat-header">
          <div>
            <div className="chat-title">{channel?.icon} {channel?.name}</div>
            <div className="chat-sub">{DEMO_USERS.filter(u => u.online).length} miembros en línea</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {["🔍","📌","⚙️"].map((ic, i) => <button key={i} className="icon-btn">{ic}</button>)}
          </div>
        </div>

        <div className="chat-messages">
          <div className="date-divider"><span>Hoy</span></div>
          {messages.map((msg, i) => {
            const user = DEMO_USERS.find(u => u.id === msg.uid) || currentUser;
            const isMe = msg.uid === currentUser.id;
            const showAvatar = i === 0 || messages[i-1]?.uid !== msg.uid;
            return (
              <div key={msg.id} className={`message-row ${isMe ? "mine" : ""}`} style={{ marginBottom: showAvatar ? 12 : 2 }}>
                {showAvatar ? <Avatar user={user} size={34} showStatus={false} /> : <div style={{ width: 34 }} />}
                <div style={{ maxWidth: "65%", minWidth: 0 }}>
                  {showAvatar && !isMe && <div className="message-sender" style={{ color: user.color }}>{user.name}</div>}
                  <div className="message-bubble">
                    {msg.text}
                    <div className="message-time">{msg.time}</div>
                  </div>
                  {msg.reactions.length > 0 && (
                    <div className="message-reactions">
                      {msg.reactions.map((r, ri) => <span key={ri} className="reaction-pill">{r.emoji} {r.count}</span>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-area">
          <div className="chat-input-box">
            <button className="chat-tool-btn">😊</button>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={`Mensaje en #${channel?.name}...`}
            />
            <button className="chat-tool-btn">📎</button>
            <button className={`send-btn ${input.trim() ? "active" : "inactive"}`} onClick={sendMessage}>✈️</button>
          </div>
        </div>
      </div>

      <div className="members-panel">
        <div className="members-section">
          <div className="members-title">En línea — {DEMO_USERS.filter(u=>u.online).length}</div>
          {DEMO_USERS.filter(u => u.online).map(u => (
            <div key={u.id} className="member-item">
              <Avatar user={u} size={28} />
              <div>
                <div className="member-name">{u.name.split(" ")[0]}</div>
                <div className="member-role">{u.role}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="members-section" style={{ marginTop: 12 }}>
          <div className="members-title">Desconectados — {DEMO_USERS.filter(u=>!u.online).length}</div>
          {DEMO_USERS.filter(u => !u.online).map(u => (
            <div key={u.id} className="member-item offline">
              <Avatar user={u} size={28} />
              <div className="member-name">{u.name.split(" ")[0]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Video Call View (WebRTC) ─────────────────────────────────
function VideoCallView() {
  const [inCall, setInCall] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const localVideoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const startCall = async () => {
    setInCall(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (e) {
      console.warn("Camera/mic not available in this environment:", e.message);
    }
  };

  const endCall = () => {
    setInCall(false);
    clearInterval(timerRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  };

  const toggleCam = () => {
    if (streamRef.current) streamRef.current.getVideoTracks().forEach(t => t.enabled = !camOn);
    setCamOn(c => !c);
  };

  const toggleMic = () => {
    if (streamRef.current) streamRef.current.getAudioTracks().forEach(t => t.enabled = !micOn);
    setMicOn(m => !m);
  };

  const toggleScreen = async () => {
    try {
      if (!screenShare) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        setScreenShare(true);
        screenStream.getVideoTracks()[0].onended = () => { setScreenShare(false); if (streamRef.current && localVideoRef.current) localVideoRef.current.srcObject = streamRef.current; };
      } else {
        setScreenShare(false);
        if (streamRef.current && localVideoRef.current) localVideoRef.current.srcObject = streamRef.current;
      }
    } catch (e) { setScreenShare(false); }
  };

  useEffect(() => () => { clearInterval(timerRef.current); if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); }, []);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  if (!inCall) {
    return (
      <div className="content-area">
        <div className="page-header">
          <div>
            <h1 className="page-title">Videollamadas</h1>
            <p className="page-sub">Organiza y únete a reuniones virtuales usando WebRTC</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-action" onClick={startCall}>📹 Nueva Videollamada</button>
            <button className="btn-secondary">📅 Programar</button>
          </div>
        </div>

        <div className="meetings-list">
          {DEMO_MEETINGS.map(m => {
            const participants = m.participants.map(id => getUserById(id));
            return (
              <div key={m.id} className="meeting-card">
                <div className="meeting-icon">📹</div>
                <div style={{ flex: 1 }}>
                  <div className="meeting-title">{m.title}</div>
                  <div className="meeting-time">🕐 {m.time}</div>
                  <div className="meeting-avatars">
                    {participants.map(u => (
                      <div key={u.id} className="meeting-avatar" style={{ background: u.color, fontSize: 9 }} title={u.name}>{u.avatar}</div>
                    ))}
                    <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 10, alignSelf: "center" }}>{participants.length} participantes</span>
                  </div>
                </div>
                <button className="join-btn" onClick={startCall}>Unirse</button>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24, padding: 18, background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>ℹ️ Tecnología WebRTC</div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Las videollamadas usan <strong>WebRTC peer-to-peer</strong> directamente en el navegador, sin necesidad de servidores de video de terceros. Para producción multi-usuario, conectar un servidor TURN/STUN (ver <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4 }}>/backend/src/webrtc</code>).
          </p>
        </div>
      </div>
    );
  }

  const onlineUsers = DEMO_USERS.filter(u => u.online);
  return (
    <div className="video-room">
      <div className="video-header">
        <span className="video-title">Reunión de Equipo General</span>
        <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          <span className="recording-dot" />
          En curso · {fmt(elapsed)}
        </span>
      </div>
      <div className={`video-grid count-${onlineUsers.length}`}>
        {onlineUsers.map((user, i) => (
          <div key={user.id} className={`video-tile ${i === 0 ? "speaking" : ""}`}>
            {i === 0 && <video ref={localVideoRef} autoPlay muted playsInline className="local-video" style={{ display: camOn ? "block" : "none" }} />}
            {(!camOn || i !== 0) && <Avatar user={user} size={60} showStatus={false} />}
            <div className="video-tile-name">{user.name}</div>
            <div className="video-tile-role">{user.role}</div>
            {i === 0 && <span className="speaking-badge">Hablando</span>}
          </div>
        ))}
      </div>
      <div className="video-controls">
        <button className={`ctrl-btn ${!micOn ? "active-btn" : ""}`} onClick={toggleMic}>
          <span className="ctrl-icon">{micOn ? "🎤" : "🔇"}</span>
          <span className="ctrl-label">{micOn ? "Silenciar" : "Activar"}</span>
        </button>
        <button className={`ctrl-btn ${!camOn ? "active-btn" : ""}`} onClick={toggleCam}>
          <span className="ctrl-icon">{camOn ? "📹" : "📷"}</span>
          <span className="ctrl-label">{camOn ? "Apagar cám" : "Encender"}</span>
        </button>
        <button className={`ctrl-btn ${screenShare ? "active-btn" : ""}`} onClick={toggleScreen}>
          <span className="ctrl-icon">🖥️</span>
          <span className="ctrl-label">{screenShare ? "Detener" : "Compartir"}</span>
        </button>
        <button className="ctrl-btn">
          <span className="ctrl-icon">💬</span>
          <span className="ctrl-label">Chat</span>
        </button>
        <button className="ctrl-btn">
          <span className="ctrl-icon">👥</span>
          <span className="ctrl-label">Personas</span>
        </button>
        <button className="end-call-btn" onClick={endCall}>Salir de la llamada</button>
      </div>
    </div>
  );
}

// ─── Files View ───────────────────────────────────────────────
function FilesView() {
  const [filter, setFilter] = useState("Todos");
  const [files, setFiles] = useState(DEMO_FILES);
  const typeColors = { pdf: "#EF4444", ppt: "#F59E0B", xls: "#10B981", doc: "#2563EB", fig: "#8B5CF6", zip: "#6B7280" };
  const filters = ["Todos", "PDF", "Presentaciones", "Hojas de cálculo", "Documentos"];

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    const newFile = {
      id: Date.now().toString(), name: file.name,
      size: (file.size / 1024 / 1024).toFixed(1) + " MB",
      type: ext, date: "Ahora", author: "Tú",
      icon: ext === "pdf" ? "📄" : ext === "pptx" ? "📊" : ext === "xlsx" ? "📈" : "📝"
    };
    setFiles(prev => [newFile, ...prev]);
    if (window.FB) {
      try {
        const storageRef = window.FB.ref(window.FB.storage, `files/${Date.now()}_${file.name}`);
        await window.FB.uploadBytes(storageRef, file);
        const url = await window.FB.getDownloadURL(storageRef);
        await window.FB.addDoc(window.FB.collection(window.FB.db, "files"), { ...newFile, url, createdAt: window.FB.serverTimestamp() });
      } catch (e) { /* silent */ }
    }
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Archivos</h1>
          <p className="page-sub">Gestiona y comparte documentos del equipo</p>
        </div>
        <label className="btn-action" style={{ cursor: "pointer" }}>
          ↑ Subir Archivo
          <input type="file" style={{ display: "none" }} onChange={handleUpload} />
        </label>
      </div>

      <label className="upload-zone">
        <input type="file" onChange={handleUpload} />
        <div className="upload-zone-icon">📤</div>
        <div className="upload-zone-text">Arrastra archivos aquí o haz clic para subir</div>
        <div className="upload-zone-sub">PDF, PPTX, XLSX, DOCX, imágenes — máx. 50MB</div>
      </label>

      <div className="filter-tabs">
        {filters.map(f => (
          <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="files-table">
        <div className="files-table-header">
          {["Nombre", "Tamaño", "Subido por", "Fecha", ""].map((h, i) => (
            <div key={i} className="files-table-col">{h}</div>
          ))}
        </div>
        {files.map((file, i) => (
          <div key={file.id} className="files-table-row">
            <div className="file-name-cell">
              <div className="file-type-icon" style={{ background: (typeColors[file.type] || "#6B7280") + "18" }}>{file.icon}</div>
              <span className="file-name-text">{file.name}</span>
            </div>
            <span className="file-cell-text">{file.size}</span>
            <span className="file-cell-text">{file.author}</span>
            <span className="file-cell-text">{file.date}</span>
            <div className="file-actions">
              <button className="file-btn download">↓</button>
              <button className="file-btn">⋯</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Announcements View ───────────────────────────────────────
function AnnouncementsView({ currentUser }) {
  const [announcements, setAnnouncements] = useState(DEMO_ANNOUNCEMENTS);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [important, setImportant] = useState(false);

  const publish = async () => {
    if (!title.trim() || !content.trim()) return;
    const newA = {
      id: Date.now().toString(), title: title.trim(), content: content.trim(),
      author: currentUser.name, authorId: currentUser.id,
      date: "Ahora mismo", important
    };
    setAnnouncements(prev => [newA, ...prev]);
    setTitle(""); setContent(""); setImportant(false); setShowForm(false);
    if (window.FB) {
      try {
        await window.FB.addDoc(window.FB.collection(window.FB.db, "announcements"), {
          ...newA, createdAt: window.FB.serverTimestamp()
        });
      } catch (e) { /* silent */ }
    }
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Anuncios Corporativos</h1>
          <p className="page-sub">Comunicados oficiales de la empresa</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {(currentUser.role === "Gerente" || currentUser.role === "Admin") && (
            <button className="btn-action" onClick={() => setShowForm(s => !s)}>
              {showForm ? "✕ Cancelar" : "+ Nuevo Anuncio"}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="form-card">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)" }}>Crear Anuncio</h3>
          <div className="form-group">
            <label className="form-label">Título</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título del anuncio" />
          </div>
          <div className="form-group">
            <label className="form-label">Contenido</label>
            <textarea className="form-input" value={content} onChange={e => setContent(e.target.value)} placeholder="Describe el anuncio..." rows={4} style={{ resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <input type="checkbox" id="imp" checked={important} onChange={e => setImportant(e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer" }} />
            <label htmlFor="imp" style={{ fontSize: 14, color: "var(--text-secondary)", cursor: "pointer" }}>Marcar como importante</label>
          </div>
          <button className="btn-action" onClick={publish}>📢 Publicar Anuncio</button>
        </div>
      )}

      {announcements.map(a => {
        const user = DEMO_USERS.find(u => u.id === a.authorId) || DEMO_USERS[3];
        return (
          <div key={a.id} className={`announcement-card ${a.important ? "important" : ""}`}>
            {a.important && <div className="important-badge">📌 IMPORTANTE</div>}
            <h2 className="announcement-title">{a.title}</h2>
            <p className="announcement-body">{a.content}</p>
            <div className="announcement-footer">
              <Avatar user={user} size={30} showStatus={false} />
              <div>
                <span className="announcement-author">{a.author}</span>
                <span className="announcement-date">{a.date}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Admin View ───────────────────────────────────────────────
function AdminView() {
  const [users, setUsers] = useState(DEMO_USERS);
  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Administración</h1>
          <p className="page-sub">Gestión de usuarios, roles y configuración del sistema</p>
        </div>
        <button className="btn-action">+ Invitar Usuario</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total usuarios", value: users.length, icon: "👥", color: "rgba(37,99,235,0.12)" },
          { label: "En línea ahora", value: users.filter(u=>u.online).length, icon: "🟢", color: "rgba(16,185,129,0.12)" },
          { label: "Departamentos", value: [...new Set(users.map(u=>u.dept))].length, icon: "🏢", color: "rgba(245,158,11,0.12)" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="users-table">
        <div className="users-table-header">
          {["Usuario", "Departamento", "Rol", "Estado", ""].map((h, i) => (
            <div key={i} className="files-table-col">{h}</div>
          ))}
        </div>
        {users.map(user => (
          <div key={user.id} className="users-table-row">
            <div className="user-cell">
              <Avatar user={user} size={36} />
              <div>
                <div className="user-cell-name">{user.name}</div>
                <div className="user-cell-role">{user.role}</div>
              </div>
            </div>
            <span className="table-text">{user.dept}</span>
            <span className={`role-pill ${user.role === "Gerente" ? "admin" : "employee"}`}>
              {user.role === "Gerente" ? "Admin" : "Empleado"}
            </span>
            <div className="online-status">
              <div className="status-dot" style={{ background: user.online ? "#10B981" : "#374151" }} />
              <span className="table-text">{user.online ? "En línea" : "Desconectado"}</span>
            </div>
            <button className="file-btn">⋯</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [fbReady, setFbReady] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeChannel, setActiveChannel] = useState("general");

  // Wait for Firebase
  useEffect(() => {
    if (window.FB) { setFbReady(true); return; }
    const handler = () => setFbReady(true);
    window.addEventListener("firebase-ready", handler);
    const t = setTimeout(() => setFbReady(true), 3000); // fallback
    return () => { window.removeEventListener("firebase-ready", handler); clearTimeout(t); };
  }, []);

  // Firebase auth listener
  useEffect(() => {
    if (!fbReady || !window.FB) return;
    const unsub = window.FB.onAuthStateChanged(window.FB.auth, async (user) => {
      if (user) {
        try {
          const snap = await window.FB.getDoc(window.FB.doc(window.FB.db, "users", user.uid));
          if (snap.exists()) { setCurrentUser({ id: user.uid, ...snap.data() }); return; }
        } catch (e) { /* silent */ }
        setCurrentUser({ id: user.uid, name: user.displayName || user.email?.split("@")[0] || "Usuario", role: "Empleado", avatar: (user.displayName || user.email || "U")[0].toUpperCase(), dept: "General", online: true, color: "#2563EB", email: user.email });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsub();
  }, [fbReady]);

  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = async () => {
    if (window.FB) { try { await window.FB.signOut(window.FB.auth); } catch (e) { /* silent */ } }
    setCurrentUser(null);
  };

  if (!fbReady) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Iniciando NexoWork...</p>
    </div>
  );

  if (!currentUser) return <AuthScreen onLogin={handleLogin} />;

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":     return <Dashboard currentUser={currentUser} />;
      case "chat":          return <ChatView activeChannel={activeChannel} currentUser={currentUser} />;
      case "videocall":     return <VideoCallView />;
      case "files":         return <FilesView />;
      case "announcements": return <AnnouncementsView currentUser={currentUser} />;
      case "admin":         return <AdminView />;
      default:              return <Dashboard currentUser={currentUser} />;
    }
  };

  return (
    <div className="app-wrapper">
      <Sidebar
        active={activeSection} setActive={setActiveSection}
        activeChannel={activeChannel} setActiveChannel={setActiveChannel}
        currentUser={currentUser} unreadCounts={{}}
      />
      <div className="main-area">
        <TopBar currentUser={currentUser} onLogout={handleLogout} />
        {renderContent()}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
