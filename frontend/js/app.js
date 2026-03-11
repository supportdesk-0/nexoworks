// ═══════════════════════════════════════════════════════════
//  NEXOWORK — Main React Application
//  100% Firebase real-time: mensajes, usuarios, anuncios
//  WebRTC para videollamadas
// ═══════════════════════════════════════════════════════════

const { useState, useEffect, useRef } = React;

const CHANNELS = [
  { id: "general",    name: "general",    icon: "#" },
  { id: "tecnologia", name: "tecnología", icon: "#" },
  { id: "marketing",  name: "marketing",  icon: "#" },
  { id: "diseno",     name: "diseño",     icon: "#" },
  { id: "anuncios",   name: "anuncios",   icon: "📢" },
];

const COLORS = ["#2563EB","#8B5CF6","#10B981","#F59E0B","#EC4899","#14B8A6","#EF4444"];

function fb() { return window.FB; }

// ─── Avatar ───────────────────────────────────────────────────
function Avatar({ user, size = 36, showStatus = true }) {
  if (!user) return null;
  const color    = user.color || "#2563EB";
  const initials = user.avatar || (user.name || "?")[0].toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${color}cc, ${color})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: 700, fontSize: Math.round(size * 0.35),
      boxShadow: `0 2px 8px ${color}40`, position: "relative",
    }}>
      {initials}
      {showStatus && (
        <div style={{
          position: "absolute", bottom: 1, right: 1,
          width: Math.round(size * 0.28), height: Math.round(size * 0.28),
          borderRadius: "50%", border: "2px solid var(--bg-surface)",
          background: user.online ? "#10B981" : "#374151",
        }} />
      )}
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [name, setName]             = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const F = fb();
      if (!F) { setError("Firebase no está configurado. Revisa el archivo index.html."); setLoading(false); return; }

      if (isRegister) {
        const cred   = await F.createUserWithEmailAndPassword(F.auth, email, password);
        const uid    = cred.user.uid;
        const avatar = (name.trim()[0] + (name.trim().split(" ")[1]?.[0] || "")).toUpperCase();
        const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
        const userData = { name: name.trim(), email, role: "employee", dept: "General", avatar, color, online: true, createdAt: new Date().toISOString() };
        await F.setDoc(F.doc(F.db, "users", uid), userData);
        onLogin({ id: uid, ...userData });
      } else {
        const cred = await F.signInWithEmailAndPassword(F.auth, email, password);
        const uid  = cred.user.uid;
        try { await F.setDoc(F.doc(F.db, "users", uid), { online: true }, { merge: true }); } catch(e) {}
        const snap = await F.getDoc(F.doc(F.db, "users", uid));
        const data = snap.exists() ? snap.data() : { name: email.split("@")[0], role: "employee", avatar: email[0].toUpperCase(), color: "#2563EB", online: true };
        onLogin({ id: uid, ...data });
      }
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("email-already-in-use")) setError("Ese correo ya está registrado.");
      else if (msg.includes("wrong-password") || msg.includes("invalid-credential")) setError("Contraseña incorrecta.");
      else if (msg.includes("user-not-found")) setError("No existe cuenta con ese correo.");
      else if (msg.includes("weak-password")) setError("La contraseña debe tener mínimo 6 caracteres.");
      else setError(msg.replace("Firebase: ","").replace(/ \(auth\/.*\)/,""));
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
        <h1 className="auth-headline">Comunica.<br /><span>Colabora.</span><br />Avanza.</h1>
        <p className="auth-subline">La plataforma que conecta a todo tu equipo en tiempo real desde cualquier dispositivo.</p>
        <div className="auth-features">
          {[
            { icon: "💬", text: "Chat en tiempo real — todos se ven al instante" },
            { icon: "👥", text: "Ver quién está en línea en tu equipo" },
            { icon: "📹", text: "Videollamadas con WebRTC — sin plugins" },
            { icon: "📢", text: "Anuncios corporativos para todos" },
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
          <h2 className="auth-form-title">{isRegister ? "Crear cuenta" : "Bienvenido"}</h2>
          <p className="auth-form-sub">{isRegister ? "Únete a tu equipo en NexoWork" : "Inicia sesión en tu espacio de trabajo"}</p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <input className="form-input" type="text" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input className="form-input" type="email" placeholder="correo@empresa.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Cargando..." : (isRegister ? "Crear cuenta" : "Iniciar sesión")}
            </button>
          </form>
          <div className="auth-toggle">
            {isRegister ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
            <span onClick={() => { setIsRegister(!isRegister); setError(""); }}>
              {isRegister ? "Iniciar sesión" : "Registrarse"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ active, setActive, activeChannel, setActiveChannel, currentUser, onlineUsers }) {
  const [collapsed, setCollapsed] = useState(false);
  const navItems = [
    { id: "dashboard",     icon: "🏠", label: "Dashboard" },
    { id: "chat",          icon: "💬", label: "Mensajes" },
    { id: "videocall",     icon: "📹", label: "Videollamadas" },
    { id: "files",         icon: "📁", label: "Archivos" },
    { id: "announcements", icon: "📢", label: "Anuncios" },
    { id: "admin",         icon: "⚙️", label: "Administración" },
  ];
  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="logo-mark">⚡</div>
        {!collapsed && <div><div className="logo-text">NexoWork</div><div className="logo-sub">Equipo</div></div>}
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)}>{collapsed ? "›" : "‹"}</button>
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
            {CHANNELS.map(ch => (
              <button key={ch.id} className={`channel-item ${activeChannel === ch.id ? "active" : ""}`} onClick={() => setActiveChannel(ch.id)}>
                <span className="channel-name">{ch.icon} {ch.name}</span>
              </button>
            ))}
            <div className="nav-section-title">En línea ahora</div>
            {onlineUsers.filter(u => u.id !== currentUser.id).map(u => (
              <div key={u.id} style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", flexShrink: 0 }} />
                <span className="channel-name">{u.name?.split(" ")[0]} {u.name?.split(" ")[1]?.[0] || ""}.</span>
              </div>
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

// ─── Top Bar ──────────────────────────────────────────────────
function TopBar({ currentUser, onLogout, onlineCount }) {
  return (
    <div className="topbar">
      <div className="search-bar">
        <span style={{ color: "var(--text-muted)" }}>🔍</span>
        <input placeholder="Buscar mensajes, personas..." />
      </div>
      <div className="topbar-actions">
        <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
          {onlineCount} en línea
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Avatar user={currentUser} size={32} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{currentUser.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{currentUser.role || "Empleado"}</div>
          </div>
        </div>
        <button className="icon-btn" title="Cerrar sesión" onClick={onLogout}>🚪</button>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────
function Dashboard({ currentUser, onlineUsers, recentMessages }) {
  const now = new Date().toLocaleDateString("es", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="content-area">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Hola, {currentUser.name?.split(" ")[0]} 👋</h1>
        <p className="page-sub" style={{ textTransform: "capitalize" }}>{now}</p>
      </div>
      <div className="stats-grid">
        {[
          { label: "Usuarios en línea", value: onlineUsers.length,       icon: "🟢", bg: "rgba(16,185,129,0.12)" },
          { label: "Canales",           value: CHANNELS.length,          icon: "💬", bg: "rgba(37,99,235,0.12)" },
          { label: "Mensajes recientes",value: recentMessages.length,    icon: "✉️", bg: "rgba(139,92,246,0.12)" },
          { label: "Tu rol",            value: currentUser.role || "Empleado", icon: "🏷️", bg: "rgba(245,158,11,0.12)" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div>
              <div className="stat-value" style={{ fontSize: typeof s.value === "string" ? 16 : 28 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">Mensajes Recientes</span></div>
          {recentMessages.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              Nadie ha escrito todavía. ¡Ve al chat y empieza!
            </div>
          ) : recentMessages.map((msg, i) => (
            <div key={i} className="activity-item">
              <Avatar user={msg.user} size={34} />
              <div className="activity-content">
                <div className="activity-name">{msg.user?.name || "Usuario"} <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>en #{msg.channel}</span></div>
                <div className="activity-text">{msg.text}</div>
              </div>
              <div className="activity-time">{msg.time}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">👥 Equipo en línea</span></div>
          {onlineUsers.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Nadie más en línea</div>
          ) : onlineUsers.map(u => (
            <div key={u.id} className="activity-item" style={{ alignItems: "center" }}>
              <Avatar user={u} size={34} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.dept || "General"}</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981" }} />
                <span style={{ fontSize: 11, color: "#10B981" }}>En línea</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chat — 100% Firebase real-time ──────────────────────────
function ChatView({ activeChannel, currentUser, allUsers }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(true);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const channel   = CHANNELS.find(c => c.id === activeChannel);

  useEffect(() => {
    setMessages([]); setLoading(true);
    const F = fb();
    if (!F) return;
    const q = F.query(
      F.collection(F.db, "channels", activeChannel, "messages"),
      F.orderBy("createdAt", "asc"),
      F.limit(100)
    );
    const unsub = F.onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => {
        const data = d.data();
        const ts   = data.createdAt?.toDate?.();
        return { id: d.id, uid: data.uid, text: data.text, reactions: data.reactions || [],
          time: ts ? ts.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }) : "ahora" };
      });
      setMessages(msgs); setLoading(false);
    });
    return () => unsub();
  }, [activeChannel]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput(""); inputRef.current?.focus();
    const F = fb();
    if (!F) return;
    try {
      await F.addDoc(F.collection(F.db, "channels", activeChannel, "messages"), {
        uid: currentUser.id, text, reactions: [], createdAt: F.serverTimestamp(),
      });
    } catch (e) { console.error("Error enviando:", e); }
  };

  const getUser = (uid) => allUsers.find(u => u.id === uid) || { name: "Usuario", avatar: "U", color: "#6B7280" };

  return (
    <div className="chat-layout" style={{ height: "calc(100vh - 58px)" }}>
      <div className="chat-main">
        <div className="chat-header">
          <div>
            <div className="chat-title">{channel?.icon} {channel?.name}</div>
            <div className="chat-sub">{allUsers.filter(u => u.online).length} en línea ahora</div>
          </div>
        </div>
        <div className="chat-messages">
          {loading && <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>Cargando mensajes...</div>}
          {!loading && messages.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
              <div>No hay mensajes todavía.</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>¡Sé el primero en escribir algo!</div>
            </div>
          )}
          <div className="date-divider"><span>Hoy</span></div>
          {messages.map((msg, i) => {
            const user = getUser(msg.uid);
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
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={`Escribe en #${channel?.name}...`} />
            <button className={`send-btn ${input.trim() ? "active" : "inactive"}`} onClick={sendMessage}>✈️</button>
          </div>
        </div>
      </div>
      <div className="members-panel">
        <div className="members-title" style={{ padding: "0 14px 10px" }}>En línea — {allUsers.filter(u=>u.online).length}</div>
        {allUsers.filter(u => u.online).map(u => (
          <div key={u.id} className="member-item">
            <Avatar user={u} size={28} />
            <div><div className="member-name">{u.name?.split(" ")[0]}</div><div className="member-role">{u.role || "Empleado"}</div></div>
          </div>
        ))}
        <div className="members-title" style={{ padding: "14px 14px 10px" }}>Desconectados — {allUsers.filter(u=>!u.online).length}</div>
        {allUsers.filter(u => !u.online).map(u => (
          <div key={u.id} className="member-item offline">
            <Avatar user={u} size={28} />
            <div className="member-name">{u.name?.split(" ")[0]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Video Call (WebRTC) ──────────────────────────────────────
function VideoCallView({ currentUser, onlineUsers }) {
  const [inCall, setInCall]           = useState(false);
  const [camOn, setCamOn]             = useState(true);
  const [micOn, setMicOn]             = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [elapsed, setElapsed]         = useState(0);
  const localVideoRef = useRef(null);
  const streamRef     = useRef(null);
  const timerRef      = useRef(null);

  const startCall = async () => {
    setInCall(true); setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (e) { console.warn("Cámara no disponible:", e.message); }
  };

  const endCall = () => {
    setInCall(false); clearInterval(timerRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  };

  const toggleCam = () => { if (streamRef.current) streamRef.current.getVideoTracks().forEach(t => t.enabled = !camOn); setCamOn(c => !c); };
  const toggleMic = () => { if (streamRef.current) streamRef.current.getAudioTracks().forEach(t => t.enabled = !micOn); setMicOn(m => !m); };
  const toggleScreen = async () => {
    try {
      if (!screenShare) {
        const s = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = s;
        setScreenShare(true);
        s.getVideoTracks()[0].onended = () => { setScreenShare(false); if (streamRef.current && localVideoRef.current) localVideoRef.current.srcObject = streamRef.current; };
      } else { setScreenShare(false); if (streamRef.current && localVideoRef.current) localVideoRef.current.srcObject = streamRef.current; }
    } catch (e) { setScreenShare(false); }
  };

  useEffect(() => () => { clearInterval(timerRef.current); if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); }, []);
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  if (!inCall) return (
    <div className="content-area">
      <div className="page-header">
        <div><h1 className="page-title">Videollamadas</h1><p className="page-sub">Reuniones en tiempo real</p></div>
        <button className="btn-action" onClick={startCall}>📹 Iniciar Videollamada</button>
      </div>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>👥 Disponibles ahora mismo</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {onlineUsers.map(u => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px" }}>
              <Avatar user={u} size={28} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</div>
                <div style={{ fontSize: 11, color: "#10B981" }}>● En línea</div>
              </div>
            </div>
          ))}
          {onlineUsers.length === 0 && <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Nadie más en línea ahora.</div>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="video-room">
      <div className="video-header">
        <span className="video-title">Videollamada en curso</span>
        <span style={{ color: "var(--text-secondary)", fontSize: 13 }}><span className="recording-dot" /> {fmt(elapsed)}</span>
      </div>
      <div className={`video-grid count-${Math.max(onlineUsers.length + 1, 1)}`}>
        <div className="video-tile speaking">
          <video ref={localVideoRef} autoPlay muted playsInline className="local-video" style={{ display: camOn ? "block" : "none" }} />
          {!camOn && <Avatar user={currentUser} size={60} showStatus={false} />}
          <div className="video-tile-name">{currentUser.name} (Tú)</div>
          <span className="speaking-badge">Tú</span>
        </div>
        {onlineUsers.filter(u => u.id !== currentUser.id).map(u => (
          <div key={u.id} className="video-tile">
            <Avatar user={u} size={60} showStatus={false} />
            <div className="video-tile-name">{u.name}</div>
            <div className="video-tile-role">{u.role || "Empleado"}</div>
          </div>
        ))}
      </div>
      <div className="video-controls">
        <button className={`ctrl-btn ${!micOn ? "active-btn" : ""}`} onClick={toggleMic}><span className="ctrl-icon">{micOn ? "🎤" : "🔇"}</span><span className="ctrl-label">{micOn ? "Silenciar" : "Activar"}</span></button>
        <button className={`ctrl-btn ${!camOn ? "active-btn" : ""}`} onClick={toggleCam}><span className="ctrl-icon">{camOn ? "📹" : "📷"}</span><span className="ctrl-label">{camOn ? "Apagar" : "Encender"}</span></button>
        <button className={`ctrl-btn ${screenShare ? "active-btn" : ""}`} onClick={toggleScreen}><span className="ctrl-icon">🖥️</span><span className="ctrl-label">{screenShare ? "Detener" : "Compartir"}</span></button>
        <button className="end-call-btn" onClick={endCall}>Salir</button>
      </div>
    </div>
  );
}

// ─── Announcements — Firebase real-time ──────────────────────
function AnnouncementsView({ currentUser, allUsers }) {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [important, setImportant] = useState(false);

  useEffect(() => {
    const F = fb();
    if (!F) return;
    const q = F.query(F.collection(F.db, "announcements"), F.orderBy("createdAt", "desc"), F.limit(20));
    const unsub = F.onSnapshot(q, snap => {
      setAnnouncements(snap.docs.map(d => {
        const data = d.data();
        const ts   = data.createdAt?.toDate?.();
        return { id: d.id, ...data, date: ts ? ts.toLocaleDateString("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Ahora" };
      }));
    });
    return () => unsub();
  }, []);

  const publish = async () => {
    if (!title.trim() || !content.trim()) return;
    const F = fb();
    if (!F) return;
    await F.addDoc(F.collection(F.db, "announcements"), {
      title: title.trim(), content: content.trim(), author: currentUser.name,
      authorId: currentUser.id, important, createdAt: F.serverTimestamp(),
    });
    setTitle(""); setContent(""); setImportant(false); setShowForm(false);
  };

  const getUser = (uid) => allUsers.find(u => u.id === uid) || { name: "Usuario", avatar: "U", color: "#6B7280" };

  return (
    <div className="content-area">
      <div className="page-header">
        <div><h1 className="page-title">Anuncios Corporativos</h1><p className="page-sub">Comunicados para todo el equipo</p></div>
        <button className="btn-action" onClick={() => setShowForm(s => !s)}>{showForm ? "✕ Cancelar" : "+ Nuevo Anuncio"}</button>
      </div>
      {showForm && (
        <div className="form-card">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)" }}>Crear Anuncio</h3>
          <div className="form-group"><label className="form-label">Título</label><input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título del anuncio" /></div>
          <div className="form-group"><label className="form-label">Contenido</label><textarea className="form-input" value={content} onChange={e => setContent(e.target.value)} placeholder="Escribe el anuncio..." rows={4} style={{ resize: "vertical" }} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <input type="checkbox" id="imp" checked={important} onChange={e => setImportant(e.target.checked)} style={{ width: 16, height: 16 }} />
            <label htmlFor="imp" style={{ fontSize: 14, color: "var(--text-secondary)", cursor: "pointer" }}>Marcar como importante</label>
          </div>
          <button className="btn-action" onClick={publish}>📢 Publicar</button>
        </div>
      )}
      {announcements.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📢</div>
          <div>No hay anuncios todavía. ¡Crea el primero!</div>
        </div>
      )}
      {announcements.map(a => {
        const user = getUser(a.authorId);
        return (
          <div key={a.id} className={`announcement-card ${a.important ? "important" : ""}`}>
            {a.important && <div className="important-badge">📌 IMPORTANTE</div>}
            <h2 className="announcement-title">{a.title}</h2>
            <p className="announcement-body">{a.content}</p>
            <div className="announcement-footer">
              <Avatar user={user} size={30} showStatus={false} />
              <div><span className="announcement-author">{a.author}</span><span className="announcement-date"> · {a.date}</span></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Files ────────────────────────────────────────────────────
function FilesView({ currentUser }) {
  const [files, setFiles] = useState([]);
  const typeIcons = { pdf: "📄", pptx: "📊", xlsx: "📈", docx: "📝", zip: "🗜️", png: "🖼️", jpg: "🖼️", fig: "🎨" };

  useEffect(() => {
    const F = fb();
    if (!F) return;
    const q = F.query(F.collection(F.db, "files"), F.orderBy("createdAt", "desc"), F.limit(50));
    const unsub = F.onSnapshot(q, snap => setFiles(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const F = fb();
    if (!F) return;
    try {
      const storageRef = F.ref(F.storage, `files/${Date.now()}_${file.name}`);
      await F.uploadBytes(storageRef, file);
      const url = await F.getDownloadURL(storageRef);
      const ext = file.name.split(".").pop().toLowerCase();
      await F.addDoc(F.collection(F.db, "files"), {
        name: file.name, url, size: (file.size / 1024 / 1024).toFixed(1) + " MB",
        type: ext, author: currentUser.name, authorId: currentUser.id, createdAt: F.serverTimestamp(),
      });
    } catch (e) { console.error("Error subiendo:", e); }
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div><h1 className="page-title">Archivos</h1><p className="page-sub">Documentos compartidos del equipo</p></div>
        <label className="btn-action" style={{ cursor: "pointer" }}>↑ Subir<input type="file" style={{ display: "none" }} onChange={handleUpload} /></label>
      </div>
      <label className="upload-zone">
        <input type="file" onChange={handleUpload} />
        <div className="upload-zone-icon">📤</div>
        <div className="upload-zone-text">Arrastra archivos aquí o haz clic</div>
        <div className="upload-zone-sub">PDF, PPTX, XLSX, imágenes — máx. 50MB</div>
      </label>
      {files.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}><div style={{ fontSize: 36 }}>📁</div><div style={{ marginTop: 10 }}>No hay archivos todavía.</div></div>
      ) : (
        <div className="files-table">
          <div className="files-table-header">{["Nombre","Tamaño","Subido por","Fecha",""].map((h,i) => <div key={i} className="files-table-col">{h}</div>)}</div>
          {files.map(file => {
            const icon = typeIcons[file.type] || "📄";
            const ts   = file.createdAt?.toDate?.();
            return (
              <div key={file.id} className="files-table-row">
                <div className="file-name-cell"><div className="file-type-icon" style={{ background: "rgba(37,99,235,0.1)" }}>{icon}</div><span className="file-name-text">{file.name}</span></div>
                <span className="file-cell-text">{file.size || "—"}</span>
                <span className="file-cell-text">{file.author || "—"}</span>
                <span className="file-cell-text">{ts ? ts.toLocaleDateString("es") : "—"}</span>
                <div className="file-actions">{file.url && <a href={file.url} target="_blank" className="file-btn download" style={{ textDecoration: "none" }}>↓</a>}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Admin ────────────────────────────────────────────────────
function AdminView({ allUsers }) {
  return (
    <div className="content-area">
      <div className="page-header"><div><h1 className="page-title">Administración</h1><p className="page-sub">Usuarios registrados en el sistema</p></div></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total usuarios", value: allUsers.length, icon: "👥", bg: "rgba(37,99,235,0.12)" },
          { label: "En línea", value: allUsers.filter(u=>u.online).length, icon: "🟢", bg: "rgba(16,185,129,0.12)" },
          { label: "Departamentos", value: [...new Set(allUsers.map(u=>u.dept).filter(Boolean))].length || 1, icon: "🏢", bg: "rgba(245,158,11,0.12)" },
        ].map((s,i) => (
          <div key={i} className="stat-card"><div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div><div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div></div>
        ))}
      </div>
      <div className="users-table">
        <div className="users-table-header">{["Usuario","Departamento","Rol","Estado",""].map((h,i) => <div key={i} className="files-table-col">{h}</div>)}</div>
        {allUsers.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No hay usuarios registrados.</div>}
        {allUsers.map(user => (
          <div key={user.id} className="users-table-row">
            <div className="user-cell"><Avatar user={user} size={36} /><div><div className="user-cell-name">{user.name}</div><div className="user-cell-role">{user.email || ""}</div></div></div>
            <span className="table-text">{user.dept || "General"}</span>
            <span className={`role-pill ${user.role === "admin" || user.role === "gerente" ? "admin" : "employee"}`}>{user.role || "Empleado"}</span>
            <div className="online-status"><div className="status-dot" style={{ background: user.online ? "#10B981" : "#374151" }} /><span className="table-text">{user.online ? "En línea" : "Desconectado"}</span></div>
            <button className="file-btn">⋯</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────
function App() {
  const [currentUser, setCurrentUser]     = useState(null);
  const [fbReady, setFbReady]             = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeChannel, setActiveChannel] = useState("general");
  const [allUsers, setAllUsers]           = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);

  // Wait for Firebase SDK
  useEffect(() => {
    if (window.FB) { setFbReady(true); return; }
    const handler = () => setFbReady(true);
    window.addEventListener("firebase-ready", handler);
    const t = setTimeout(() => setFbReady(true), 4000);
    return () => { window.removeEventListener("firebase-ready", handler); clearTimeout(t); };
  }, []);

  // Auth state listener
  useEffect(() => {
    if (!fbReady || !window.FB) return;
    const F = fb();
    const unsub = F.onAuthStateChanged(F.auth, async (user) => {
      if (user) {
        try {
          await F.setDoc(F.doc(F.db, "users", user.uid), { online: true }, { merge: true });
          const snap = await F.getDoc(F.doc(F.db, "users", user.uid));
          if (snap.exists()) { setCurrentUser({ id: user.uid, ...snap.data() }); }
          else { setCurrentUser({ id: user.uid, name: user.email?.split("@")[0] || "Usuario", email: user.email, role: "employee", avatar: (user.email||"U")[0].toUpperCase(), color: "#2563EB", online: true }); }
        } catch(e) { setCurrentUser(null); }
      } else { setCurrentUser(null); }
    });
    return () => unsub();
  }, [fbReady]);

  // Listen to ALL users — real-time presence
  useEffect(() => {
    if (!currentUser) return;
    const F = fb();
    if (!F) return;
    const unsub = F.onSnapshot(F.collection(F.db, "users"), snap => {
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [currentUser?.id]);

  // Recent messages for dashboard
  useEffect(() => {
    if (!currentUser || allUsers.length === 0) return;
    const F = fb();
    if (!F) return;
    const allMsgs = [];
    const unsubs = CHANNELS.slice(0,3).map(ch => {
      const q = F.query(F.collection(F.db, "channels", ch.id, "messages"), F.orderBy("createdAt", "desc"), F.limit(3));
      return F.onSnapshot(q, snap => {
        snap.docs.forEach(d => {
          const data = d.data();
          const user = allUsers.find(u => u.id === data.uid) || { name: "Usuario", avatar: "U", color: "#6B7280" };
          const ts   = data.createdAt?.toDate?.();
          allMsgs.push({ id: d.id, text: data.text, user, channel: ch.name, time: ts ? ts.toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit"}) : "" });
        });
        setRecentMessages([...allMsgs].slice(0,8));
      });
    });
    return () => unsubs.forEach(u => u());
  }, [currentUser?.id, allUsers.length]);

  // Mark offline on close
  useEffect(() => {
    if (!currentUser) return;
    const F = fb();
    const markOffline = () => { try { F?.setDoc(F.doc(F.db,"users",currentUser.id),{online:false},{merge:true}); } catch(e){} };
    window.addEventListener("beforeunload", markOffline);
    return () => { window.removeEventListener("beforeunload", markOffline); markOffline(); };
  }, [currentUser?.id]);

  const handleLogin = (user) => setCurrentUser(user);
  const handleLogout = async () => {
    const F = fb();
    if (F && currentUser) { try { await F.setDoc(F.doc(F.db,"users",currentUser.id),{online:false},{merge:true}); await F.signOut(F.auth); } catch(e){} }
    setCurrentUser(null);
  };

  if (!fbReady) return <div className="loading-screen"><div className="spinner" /><p>Iniciando NexoWork...</p></div>;
  if (!currentUser) return <AuthScreen onLogin={handleLogin} />;

  const onlineUsers = allUsers.filter(u => u.online);

  const renderContent = () => {
    switch(activeSection) {
      case "dashboard":     return <Dashboard currentUser={currentUser} onlineUsers={onlineUsers} recentMessages={recentMessages} />;
      case "chat":          return <ChatView activeChannel={activeChannel} currentUser={currentUser} allUsers={allUsers} />;
      case "videocall":     return <VideoCallView currentUser={currentUser} onlineUsers={onlineUsers} />;
      case "files":         return <FilesView currentUser={currentUser} />;
      case "announcements": return <AnnouncementsView currentUser={currentUser} allUsers={allUsers} />;
      case "admin":         return <AdminView allUsers={allUsers} />;
      default:              return <Dashboard currentUser={currentUser} onlineUsers={onlineUsers} recentMessages={recentMessages} />;
    }
  };

  return (
    <div className="app-wrapper">
      <Sidebar active={activeSection} setActive={setActiveSection} activeChannel={activeChannel} setActiveChannel={setActiveChannel} currentUser={currentUser} onlineUsers={onlineUsers} />
      <div className="main-area">
        <TopBar currentUser={currentUser} onLogout={handleLogout} onlineCount={onlineUsers.length} />
        {renderContent()}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
