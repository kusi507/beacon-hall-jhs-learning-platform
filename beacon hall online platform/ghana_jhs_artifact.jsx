import { useState, useEffect } from "react";

const COLORS = {
  gold: "#D4A017", goldLight: "#F5E6B3", goldDark: "#8B6914",
  green: "#2D6A4F", greenLight: "#D8F3DC", greenDark: "#1B4332",
  red: "#C1121F", redLight: "#FFDAD9",
  white: "#FFFEF7", offWhite: "#F8F5EC",
  gray50: "#F4F2EB", gray100: "#E8E4D9", gray300: "#B5B0A0",
  gray500: "#7A7468", gray700: "#4A4640", gray900: "#2C2A26",
};

// ── In-memory DB (no localStorage needed in artifact) ─────────────────────────
let STORE = {
  users: [
    { id: "t1", email: "teacher@demo.gh", password: "demo123", role: "teacher", name: "Abena Mensah", school: "Accra Academy", class: "Basic 7" },
    { id: "s1", email: "student@demo.gh", password: "demo123", role: "student", name: "Kwame Asante", school: "Accra Academy", class: "Basic 7" },
  ],
  quizzes: [
    {
      id: "q1", teacherId: "t1", title: "Ghana Independence Quiz",
      classCode: "CLASS7A", createdAt: new Date().toISOString(),
      questions: [
        { id: "qq1", text: "In what year did Ghana gain independence?", options: ["1957","1960","1963","1950"], correct: 0 },
        { id: "qq2", text: "Who was Ghana's first president?", options: ["Jerry Rawlings","John Mahama","Kwame Nkrumah","Kofi Atta Agyekum"], correct: 2 },
        { id: "qq3", text: "What is the capital city of Ghana?", options: ["Kumasi","Accra","Tamale","Cape Coast"], correct: 1 },
        { id: "qq4", text: "What is the currency of Ghana?", options: ["Naira","Cedi","Dalasi","Franc"], correct: 1 },
        { id: "qq5", text: "Which river is the largest in Ghana?", options: ["Pra River","Ankobra River","Volta River","Tano River"], correct: 2 },
      ]
    },
    {
      id: "q2", teacherId: "t1", title: "Basic Mathematics — Fractions",
      classCode: "CLASS7A", createdAt: new Date().toISOString(),
      questions: [
        { id: "mq1", text: "What is ½ + ¼?", options: ["¾","1","½","⅔"], correct: 0 },
        { id: "mq2", text: "What is ⅔ × 3?", options: ["1","2","3","6"], correct: 1 },
        { id: "mq3", text: "Which fraction is largest?", options: ["¼","½","⅓","⅕"], correct: 1 },
      ]
    }
  ],
  submissions: [],
  currentUser: null,
};

const DB = {
  get: (k) => STORE[k] ?? null,
  set: (k, v) => { STORE[k] = v; },
};

const Auth = {
  login: (email, password) => (DB.get("users") || []).find(u => u.email === email && u.password === password) || null,
  register: (data) => {
    const users = DB.get("users") || [];
    if (users.find(u => u.email === data.email)) return { error: "Email already registered" };
    const user = { ...data, id: "u" + Date.now() };
    DB.set("users", [...users, user]);
    return { user };
  },
};

// ── UI Primitives ──────────────────────────────────────────────────────────────
const GhanaFlag = () => (
  <svg width="28" height="18" viewBox="0 0 28 18" style={{ borderRadius: 3, flexShrink: 0 }}>
    <rect width="28" height="6" fill="#E8B400" />
    <rect y="6" width="28" height="6" fill="#2D6A4F" />
    <rect y="12" width="28" height="6" fill="#C1121F" />
    <polygon points="14,3 15.8,8.5 11,5.5 17,5.5 12.2,8.5" fill="#1A1916" />
  </svg>
);

const Btn = ({ children, onClick, variant = "primary", size = "md", disabled, style: s }) => {
  const sizes = { sm: { padding: "6px 14px", fontSize: 13 }, md: { padding: "10px 20px", fontSize: 15 }, lg: { padding: "13px 28px", fontSize: 16 } };
  const variants = {
    primary: { background: COLORS.green, color: COLORS.white, border: "none" },
    ghost: { background: "transparent", color: COLORS.green, border: `1.5px solid ${COLORS.green}` },
    gold: { background: COLORS.gold, color: COLORS.white, border: "none" },
    secondary: { background: COLORS.goldLight, color: COLORS.goldDark, border: "none" },
    danger: { background: COLORS.redLight, color: COLORS.red, border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...sizes[size], ...variants[variant], borderRadius: 8, fontFamily: "system-ui,sans-serif", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 6, transition: "filter 0.15s", ...s }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = "brightness(1.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.filter = ""; }}>
      {children}
    </button>
  );
};

const Input = ({ label, type = "text", value, onChange, placeholder, error }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.gray700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${error ? COLORS.red : COLORS.gray100}`, borderRadius: 8, fontSize: 14, background: COLORS.white, color: COLORS.gray900, boxSizing: "border-box", outline: "none", fontFamily: "system-ui,sans-serif" }} />
    {error && <p style={{ color: COLORS.red, fontSize: 12, margin: "4px 0 0" }}>{error}</p>}
  </div>
);

const Card = ({ children, style: s }) => (
  <div style={{ background: COLORS.white, border: `1px solid ${COLORS.gray100}`, borderRadius: 12, padding: 20, ...s }}>{children}</div>
);

const Badge = ({ children, color = "green" }) => {
  const map = { green: [COLORS.greenLight, COLORS.greenDark], gold: [COLORS.goldLight, COLORS.goldDark], red: [COLORS.redLight, COLORS.red] };
  return <span style={{ background: map[color][0], color: map[color][1], padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{children}</span>;
};

const TopBar = ({ user, onLogout }) => (
  <div style={{ background: COLORS.green, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, flexShrink: 0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <GhanaFlag />
      <span style={{ color: COLORS.white, fontWeight: 800, fontSize: 17 }}>EduGhana</span>
      <span style={{ color: COLORS.goldLight, fontSize: 11 }}>JHS Portal</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ textAlign: "right" }}>
        <div style={{ color: COLORS.white, fontWeight: 700, fontSize: 13 }}>{user.name}</div>
        <div style={{ color: COLORS.goldLight, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>{user.role}</div>
      </div>
      <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.18)", border: "none", color: COLORS.white, padding: "5px 11px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Logout</button>
    </div>
  </div>
);

// ── Auth Screens ───────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin, onGoRegister }) => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    const u = Auth.login(email, pw);
    if (!u) { setErr("Invalid email or password."); return; }
    onLogin(u);
  };
  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
          <GhanaFlag /><span style={{ fontSize: 26, fontWeight: 800, color: COLORS.green }}>EduGhana</span>
        </div>
        <p style={{ color: COLORS.gray500, fontSize: 13, margin: 0 }}>JHS Learning Portal · Basic 7–9</p>
      </div>
      <Card style={{ width: "100%", maxWidth: 400 }}>
        <h2 style={{ margin: "0 0 18px", fontSize: 20, color: COLORS.gray900 }}>Sign in</h2>
        {err && <div style={{ background: COLORS.redLight, color: COLORS.red, padding: "9px 13px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{err}</div>}
        <div style={{ background: COLORS.gray50, border: `1px solid ${COLORS.gray100}`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: COLORS.gray500, lineHeight: 1.6 }}>
          <strong style={{ color: COLORS.gray700 }}>Demo accounts</strong><br />
          🧑‍🏫 Teacher: teacher@demo.gh / demo123<br />
          🎓 Student: student@demo.gh / demo123
        </div>
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@school.edu.gh" />
        <Input label="Password" type="password" value={pw} onChange={setPw} placeholder="Password" />
        <Btn onClick={submit} style={{ width: "100%", justifyContent: "center" }}>Sign in →</Btn>
        <p style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: COLORS.gray500 }}>
          No account? <span onClick={onGoRegister} style={{ color: COLORS.green, cursor: "pointer", fontWeight: 700 }}>Create one</span>
        </p>
      </Card>
    </div>
  );
};

const RegisterScreen = ({ onLogin, onGoLogin }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", school: "", class: "" });
  const [err, setErr] = useState("");
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.name || !form.email || !form.password) { setErr("Please fill all required fields."); return; }
    const { user, error } = Auth.register(form);
    if (error) { setErr(error); return; }
    onLogin(user);
  };
  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <GhanaFlag /><span style={{ fontSize: 24, fontWeight: 800, color: COLORS.green }}>EduGhana</span>
        </div>
      </div>
      <Card style={{ width: "100%", maxWidth: 420 }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 19, color: COLORS.gray900 }}>Create your account</h2>
        {err && <div style={{ background: COLORS.redLight, color: COLORS.red, padding: "9px 13px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{err}</div>}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.gray700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>I am a</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {["student","teacher"].map(r => (
              <div key={r} onClick={() => set("role")(r)}
                style={{ border: `2px solid ${form.role === r ? COLORS.green : COLORS.gray100}`, borderRadius: 10, padding: 14, textAlign: "center", cursor: "pointer", background: form.role === r ? COLORS.greenLight : COLORS.white, transition: "all 0.15s" }}>
                <div style={{ fontSize: 22, marginBottom: 3 }}>{r === "student" ? "🎓" : "👩‍🏫"}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: form.role === r ? COLORS.greenDark : COLORS.gray700, textTransform: "capitalize" }}>{r}</div>
              </div>
            ))}
          </div>
        </div>
        <Input label="Full name *" value={form.name} onChange={set("name")} placeholder="e.g. Abena Asante" />
        <Input label="Email *" type="email" value={form.email} onChange={set("email")} placeholder="you@school.edu.gh" />
        <Input label="Password *" type="password" value={form.password} onChange={set("password")} placeholder="Min. 6 characters" />
        <Input label="School" value={form.school} onChange={set("school")} placeholder="e.g. Achimota School" />
        <Input label="Class" value={form.class} onChange={set("class")} placeholder="e.g. Basic 7A" />
        <Btn onClick={submit} style={{ width: "100%", justifyContent: "center" }}>Create account →</Btn>
        <p style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: COLORS.gray500 }}>
          Have an account? <span onClick={onGoLogin} style={{ color: COLORS.green, cursor: "pointer", fontWeight: 700 }}>Sign in</span>
        </p>
      </Card>
    </div>
  );
};

// ── Teacher Views ──────────────────────────────────────────────────────────────
const TeacherDashboard = ({ user, setView }) => {
  const [, redraw] = useState(0);
  const quizzes = (DB.get("quizzes") || []).filter(q => q.teacherId === user.id);
  const submissions = DB.get("submissions") || [];
  const mySubmissions = submissions.filter(s => quizzes.some(q => q.id === s.quizId));
  return (
    <div style={{ padding: 20, maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: COLORS.gray900 }}>Welcome, {user.name.split(" ")[0]} 👋</h1>
          <p style={{ margin: "3px 0 0", color: COLORS.gray500, fontSize: 13 }}>{user.school || "EduGhana"} · Teacher</p>
        </div>
        <Btn onClick={() => setView("createQuiz")} variant="gold">+ Create Quiz</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Quizzes Created", value: quizzes.length, icon: "📝" },
          { label: "Total Submissions", value: mySubmissions.length, icon: "📬" },
          { label: "Students Reached", value: [...new Set(mySubmissions.map(s => s.studentId))].length, icon: "🎓" },
        ].map(m => (
          <div key={m.label} style={{ background: COLORS.white, border: `1px solid ${COLORS.gray100}`, borderRadius: 10, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>{m.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.green }}>{m.value}</div>
            <div style={{ fontSize: 11, color: COLORS.gray500, marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 17, color: COLORS.gray900, marginBottom: 12 }}>Your Quizzes</h2>
      {quizzes.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: COLORS.gray300, border: `2px dashed ${COLORS.gray100}`, borderRadius: 12 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
          <p style={{ margin: 0 }}>No quizzes yet. Hit "+ Create Quiz" to start!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {quizzes.map(q => {
            const subs = submissions.filter(s => s.quizId === q.id);
            const avg = subs.length ? Math.round(subs.reduce((a, s) => a + s.score, 0) / subs.length) : null;
            return (
              <Card key={q.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "16px 20px" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.gray900 }}>{q.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.gray500, marginTop: 3 }}>
                    Code: <strong style={{ color: COLORS.green }}>{q.classCode}</strong> · {q.questions.length} Qs · {subs.length} submission{subs.length !== 1 ? "s" : ""}
                    {avg !== null && <> · Avg: <strong>{avg}%</strong></>}
                  </div>
                </div>
                <Btn size="sm" variant="ghost" onClick={() => setView({ name: "quizResults", quizId: q.id })}>View Results</Btn>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CreateQuiz = ({ user, setView }) => {
  const [title, setTitle] = useState("");
  const [classCode, setClassCode] = useState("");
  const [questions, setQuestions] = useState([{ text: "", options: ["","","",""], correct: 0 }]);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedCode, setSavedCode] = useState("");

  const addQ = () => { if (questions.length < 10) setQuestions([...questions, { text: "", options: ["","","",""], correct: 0 }]); };
  const removeQ = i => setQuestions(questions.filter((_, idx) => idx !== i));
  const updateQ = (i, field, val) => { const qs = [...questions]; qs[i] = { ...qs[i], [field]: val }; setQuestions(qs); };
  const updateOpt = (qi, oi, val) => { const qs = [...questions]; qs[qi].options[oi] = val; setQuestions(qs); };

  const save = () => {
    if (!title.trim()) { setErr("Enter a quiz title."); return; }
    if (!classCode.trim()) { setErr("Enter a class code."); return; }
    for (const q of questions) {
      if (!q.text.trim()) { setErr("All questions need text."); return; }
      if (q.options.some(o => !o.trim())) { setErr("All options must be filled."); return; }
    }
    const quiz = { id: "q" + Date.now(), teacherId: user.id, title: title.trim(), classCode: classCode.trim().toUpperCase(), createdAt: new Date().toISOString(), questions: questions.map((q, i) => ({ ...q, id: "qq" + i })) };
    DB.set("quizzes", [...(DB.get("quizzes") || []), quiz]);
    setSavedCode(classCode.toUpperCase());
    setSaved(true);
  };

  if (saved) return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
      <h2 style={{ color: COLORS.green }}>Quiz Published!</h2>
      <Card style={{ marginBottom: 20 }}>
        <p style={{ margin: "0 0 10px", color: COLORS.gray700, fontSize: 14 }}>Share this class code with your students:</p>
        <div style={{ fontSize: 34, fontWeight: 800, color: COLORS.green, margin: "10px 0", letterSpacing: "0.12em" }}>{savedCode}</div>
        <p style={{ margin: 0, fontSize: 13, color: COLORS.gray500 }}>Students enter this to find and take "{title}"</p>
      </Card>
      <Btn onClick={() => setView("dashboard")}>Back to Dashboard</Btn>
    </div>
  );

  return (
    <div style={{ padding: 20, maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setView("dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.green, fontSize: 20, padding: 0 }}>←</button>
        <h1 style={{ margin: 0, fontSize: 20, color: COLORS.gray900 }}>Create New Quiz</h1>
      </div>
      {err && <div style={{ background: COLORS.redLight, color: COLORS.red, padding: "9px 13px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{err}</div>}
      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 14px", color: COLORS.gray900 }}>Quiz Details</h3>
        <Input label="Quiz Title *" value={title} onChange={setTitle} placeholder="e.g. Chapter 3: Ghana History" />
        <Input label="Class Code *" value={classCode} onChange={v => setClassCode(v.toUpperCase())} placeholder="e.g. CLASS7A" />
        <p style={{ margin: 0, fontSize: 12, color: COLORS.gray500 }}>Students enter this code to access the quiz. No spaces.</p>
      </Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: COLORS.gray900 }}>Questions ({questions.length}/10)</h3>
        {questions.length < 10 && <Btn size="sm" variant="secondary" onClick={addQ}>+ Add Question</Btn>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {questions.map((q, qi) => (
          <Card key={qi} style={{ background: COLORS.gray50, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, color: COLORS.green, fontSize: 13 }}>Question {qi + 1}</span>
              {questions.length > 1 && <button onClick={() => removeQ(qi)} style={{ background: "none", border: "none", color: COLORS.red, cursor: "pointer", fontSize: 12 }}>Remove</button>}
            </div>
            <textarea value={q.text} onChange={e => updateQ(qi, "text", e.target.value)} placeholder="Type your question here..." rows={2}
              style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${COLORS.gray100}`, borderRadius: 8, fontSize: 13, resize: "vertical", background: COLORS.white, boxSizing: "border-box", marginBottom: 10, fontFamily: "system-ui,sans-serif" }} />
            <p style={{ margin: "0 0 8px", fontSize: 12, color: COLORS.gray700, fontWeight: 600 }}>Options — click a letter to mark as correct answer:</p>
            {q.options.map((opt, oi) => (
              <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <button onClick={() => updateQ(qi, "correct", oi)}
                  style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${q.correct === oi ? COLORS.green : COLORS.gray300}`, background: q.correct === oi ? COLORS.green : "transparent", color: q.correct === oi ? COLORS.white : COLORS.gray300, cursor: "pointer", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                  {["A","B","C","D"][oi]}
                </button>
                <input value={opt} onChange={e => updateOpt(qi, oi, e.target.value)} placeholder={`Option ${["A","B","C","D"][oi]}`}
                  style={{ flex: 1, padding: "7px 11px", border: `1.5px solid ${q.correct === oi ? COLORS.green : COLORS.gray100}`, borderRadius: 8, fontSize: 13, background: q.correct === oi ? COLORS.greenLight : COLORS.white, fontFamily: "system-ui,sans-serif" }} />
              </div>
            ))}
          </Card>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <Btn variant="ghost" onClick={() => setView("dashboard")}>Cancel</Btn>
        <Btn variant="gold" onClick={save}>Publish Quiz 🚀</Btn>
      </div>
    </div>
  );
};

const QuizResults = ({ user, quizId, setView }) => {
  const quiz = (DB.get("quizzes") || []).find(q => q.id === quizId);
  const submissions = (DB.get("submissions") || []).filter(s => s.quizId === quizId);
  const users = DB.get("users") || [];
  if (!quiz) return <div style={{ padding: 20 }}>Not found. <span onClick={() => setView("dashboard")} style={{ color: COLORS.green, cursor: "pointer" }}>Back</span></div>;
  const avg = submissions.length ? Math.round(submissions.reduce((a, s) => a + s.score, 0) / submissions.length) : 0;
  return (
    <div style={{ padding: 20, maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setView("dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.green, fontSize: 20, padding: 0 }}>←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, color: COLORS.gray900 }}>{quiz.title}</h1>
          <p style={{ margin: "3px 0 0", color: COLORS.gray500, fontSize: 12 }}>Code: <strong>{quiz.classCode}</strong> · {quiz.questions.length} questions</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {[{ label: "Submissions", value: submissions.length, icon: "📬" }, { label: "Avg Score", value: avg + "%", icon: "📊" }, { label: "Passed ≥50%", value: submissions.filter(s => s.score >= 50).length, icon: "✅" }].map(m => (
          <div key={m.label} style={{ background: COLORS.white, border: `1px solid ${COLORS.gray100}`, borderRadius: 10, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>{m.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.green }}>{m.value}</div>
            <div style={{ fontSize: 11, color: COLORS.gray500, marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>
      {submissions.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: COLORS.gray300, border: `2px dashed ${COLORS.gray100}`, borderRadius: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
          <p style={{ margin: 0, fontSize: 14 }}>No submissions yet. Share code <strong>{quiz.classCode}</strong> with students.</p>
        </div>
      ) : (
        <Card>
          <h3 style={{ margin: "0 0 14px" }}>Student Submissions</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: COLORS.gray50 }}>
                  {["Student", "Score", ...quiz.questions.map((_, i) => `Q${i+1}`)].map(h => (
                    <th key={h} style={{ padding: "9px 12px", textAlign: "left", borderBottom: `1px solid ${COLORS.gray100}`, color: COLORS.gray700, fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => {
                  const student = users.find(u => u.id === sub.studentId);
                  return (
                    <tr key={sub.id} style={{ borderBottom: `1px solid ${COLORS.gray50}` }}>
                      <td style={{ padding: "9px 12px", fontWeight: 600 }}>{student?.name || "Unknown"}</td>
                      <td style={{ padding: "9px 12px" }}><Badge color={sub.score >= 70 ? "green" : sub.score >= 50 ? "gold" : "red"}>{sub.score}%</Badge></td>
                      {quiz.questions.map((q, qi) => (
                        <td key={qi} style={{ padding: "9px 12px", textAlign: "center" }}>
                          <span style={{ color: sub.answers[qi] === q.correct ? COLORS.green : COLORS.red, fontWeight: 700 }}>{sub.answers[qi] === q.correct ? "✓" : "✗"}</span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

// ── Student Views ──────────────────────────────────────────────────────────────
const StudentDashboard = ({ user, setView }) => {
  const [code, setCode] = useState("");
  const [results, setResults] = useState(null);
  const [searchErr, setSearchErr] = useState("");
  const [, redraw] = useState(0);
  const submissions = (DB.get("submissions") || []).filter(s => s.studentId === user.id);
  const allQuizzes = DB.get("quizzes") || [];

  const search = () => {
    setSearchErr(""); setResults(null);
    if (!code.trim()) { setSearchErr("Enter a class code."); return; }
    const found = allQuizzes.filter(q => q.classCode === code.trim().toUpperCase());
    if (!found.length) { setSearchErr("No quizzes found. Double-check the code with your teacher."); return; }
    setResults(found);
  };

  return (
    <div style={{ padding: 20, maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: COLORS.gray900 }}>Hello, {user.name.split(" ")[0]}! 👋</h1>
        <p style={{ margin: "3px 0 0", color: COLORS.gray500, fontSize: 13 }}>{user.school || "EduGhana"} · Student</p>
      </div>
      <Card style={{ marginBottom: 20, background: `linear-gradient(135deg, ${COLORS.greenLight}, ${COLORS.goldLight})`, border: "none" }}>
        <h3 style={{ margin: "0 0 12px", color: COLORS.greenDark }}>📌 Find a Quiz</h3>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: COLORS.gray700 }}>Get the class code from your teacher, then enter it below:</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. CLASS7A" onKeyDown={e => e.key === "Enter" && search()}
            style={{ flex: 1, minWidth: 150, padding: "10px 14px", border: `1.5px solid ${COLORS.gray100}`, borderRadius: 8, fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "system-ui,sans-serif" }} />
          <Btn onClick={search}>Find Quizzes →</Btn>
        </div>
        {searchErr && <p style={{ margin: "8px 0 0", color: COLORS.red, fontSize: 13 }}>{searchErr}</p>}
        {results && (
          <div style={{ marginTop: 14 }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, color: COLORS.gray700, fontWeight: 600 }}>{results.length} quiz{results.length !== 1 ? "zes" : ""} found:</p>
            {results.map(q => {
              const taken = submissions.some(s => s.quizId === q.id);
              return (
                <div key={q.id} style={{ background: COLORS.white, border: `1px solid ${COLORS.gray100}`, borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: COLORS.gray900, fontSize: 14 }}>{q.title}</div>
                    <div style={{ fontSize: 12, color: COLORS.gray500 }}>{q.questions.length} questions</div>
                  </div>
                  {taken ? <Badge color="gold">Completed ✓</Badge> : <Btn size="sm" onClick={() => setView({ name: "takeQuiz", quizId: q.id })}>Start →</Btn>}
                </div>
              );
            })}
          </div>
        )}
      </Card>
      <h2 style={{ fontSize: 17, color: COLORS.gray900, marginBottom: 12 }}>Completed Quizzes</h2>
      {submissions.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: COLORS.gray300, border: `2px dashed ${COLORS.gray100}`, borderRadius: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
          <p style={{ margin: 0, fontSize: 14 }}>No quizzes taken yet. Enter a class code above to get started!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {submissions.map(sub => {
            const quiz = allQuizzes.find(q => q.id === sub.quizId);
            return (
              <Card key={sub.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, padding: "14px 18px" }}>
                <div>
                  <div style={{ fontWeight: 700, color: COLORS.gray900, fontSize: 14 }}>{quiz?.title || "Quiz"}</div>
                  <div style={{ fontSize: 12, color: COLORS.gray500 }}>{quiz?.questions.length} questions · {new Date(sub.submittedAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Badge color={sub.score >= 70 ? "green" : sub.score >= 50 ? "gold" : "red"}>{sub.score}%</Badge>
                  <Btn size="sm" variant="ghost" onClick={() => setView({ name: "quizFeedback", submissionId: sub.id })}>Review</Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const TakeQuiz = ({ user, quizId, setView }) => {
  const quiz = (DB.get("quizzes") || []).find(q => q.id === quizId);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    if (!started || submitted) return;
    const t = setInterval(() => setTimeLeft(tl => { if (tl <= 1) { clearInterval(t); doSubmit(); return 0; } return tl - 1; }), 1000);
    return () => clearInterval(t);
  }, [started, submitted]);

  if (!quiz) return <div style={{ padding: 20 }}>Quiz not found.</div>;

  const existing = (DB.get("submissions") || []).find(s => s.quizId === quizId && s.studentId === user.id);
  if (existing) return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: 48 }}>✋</div>
      <h2 style={{ color: COLORS.gray900 }}>Already Submitted</h2>
      <p style={{ color: COLORS.gray500, fontSize: 14 }}>You already completed this quiz and scored <strong>{existing.score}%</strong>.</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <Btn onClick={() => setView({ name: "quizFeedback", submissionId: existing.id })}>Review Answers</Btn>
        <Btn variant="ghost" onClick={() => setView("dashboard")}>Dashboard</Btn>
      </div>
    </div>
  );

  const doSubmit = () => {
    const correct = quiz.questions.filter((q, i) => answers[i] === q.correct).length;
    const pct = Math.round((correct / quiz.questions.length) * 100);
    const sub = { id: "sub" + Date.now(), quizId, studentId: user.id, answers: quiz.questions.map((_, i) => answers[i] ?? -1), score: pct, submittedAt: new Date().toISOString() };
    DB.set("submissions", [...(DB.get("submissions") || []), sub]);
    setScore({ pct, correct, total: quiz.questions.length, subId: sub.id });
    setSubmitted(true);
  };

  const mins = Math.floor(timeLeft / 60), secs = timeLeft % 60;

  if (!started) return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 10 }}>📝</div>
      <h2 style={{ color: COLORS.gray900, marginBottom: 4 }}>{quiz.title}</h2>
      <p style={{ color: COLORS.gray500, marginBottom: 20, fontSize: 14 }}>Get ready — answer all questions carefully.</p>
      <Card style={{ textAlign: "left", marginBottom: 20 }}>
        {[`${quiz.questions.length} multiple-choice questions`, "30 minute time limit", "One attempt only — choose wisely!", "See your score instantly after submitting"].map((info, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.gray700, marginBottom: 8 }}>
            <span style={{ color: COLORS.green, fontWeight: 700 }}>✓</span> {info}
          </div>
        ))}
      </Card>
      <Btn size="lg" onClick={() => setStarted(true)} style={{ width: "100%", justifyContent: "center" }}>Start Quiz →</Btn>
    </div>
  );

  if (submitted && score) return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 8 }}>{score.pct >= 70 ? "🏆" : score.pct >= 50 ? "👍" : "📚"}</div>
      <h2 style={{ color: COLORS.gray900 }}>Quiz Complete!</h2>
      <div style={{ background: score.pct >= 70 ? COLORS.greenLight : score.pct >= 50 ? COLORS.goldLight : COLORS.redLight, border: `2px solid ${score.pct >= 70 ? COLORS.green : score.pct >= 50 ? COLORS.gold : COLORS.red}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 52, fontWeight: 800, color: score.pct >= 70 ? COLORS.greenDark : score.pct >= 50 ? COLORS.goldDark : COLORS.red }}>{score.pct}%</div>
        <p style={{ margin: "4px 0 0", color: COLORS.gray700, fontSize: 15 }}>{score.correct} of {score.total} correct</p>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: COLORS.gray500 }}>{score.pct >= 70 ? "Excellent work! 🌟" : score.pct >= 50 ? "Good effort! Keep studying." : "Keep practicing — you'll improve!"}</p>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <Btn onClick={() => setView({ name: "quizFeedback", submissionId: score.subId })}>Review Answers</Btn>
        <Btn variant="ghost" onClick={() => setView("dashboard")}>Dashboard</Btn>
      </div>
    </div>
  );

  const q = quiz.questions[current];
  return (
    <div style={{ padding: 20, maxWidth: 620, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 13, color: COLORS.gray500, fontWeight: 600 }}>Question {current + 1} of {quiz.questions.length}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: timeLeft < 300 ? COLORS.red : COLORS.gray700 }}>⏱ {mins}:{secs.toString().padStart(2, "0")}</span>
      </div>
      <div style={{ height: 5, background: COLORS.gray100, borderRadius: 3, marginBottom: 20 }}>
        <div style={{ height: "100%", width: `${(current / quiz.questions.length) * 100}%`, background: COLORS.green, borderRadius: 3, transition: "width 0.3s" }} />
      </div>
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.gray900, margin: "0 0 18px", lineHeight: 1.5 }}>{q.text}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {q.options.map((opt, oi) => {
            const sel = answers[current] === oi;
            return (
              <div key={oi} onClick={() => setAnswers({ ...answers, [current]: oi })}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: `2px solid ${sel ? COLORS.green : COLORS.gray100}`, background: sel ? COLORS.greenLight : COLORS.white, cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${sel ? COLORS.green : COLORS.gray300}`, background: sel ? COLORS.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: sel ? COLORS.white : COLORS.gray500, fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{["A","B","C","D"][oi]}</div>
                <span style={{ fontSize: 14, color: sel ? COLORS.greenDark : COLORS.gray900 }}>{opt}</span>
              </div>
            );
          })}
        </div>
      </Card>
      <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
        <Btn variant="ghost" onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>← Previous</Btn>
        {current < quiz.questions.length - 1
          ? <Btn onClick={() => setCurrent(c => c + 1)} disabled={answers[current] === undefined}>Next →</Btn>
          : <Btn variant="gold" onClick={doSubmit} disabled={answers[current] === undefined}>Submit Quiz 🚀</Btn>}
      </div>
    </div>
  );
};

const QuizFeedback = ({ user, submissionId, setView }) => {
  const sub = (DB.get("submissions") || []).find(s => s.id === submissionId);
  const quiz = sub ? (DB.get("quizzes") || []).find(q => q.id === sub.quizId) : null;
  if (!sub || !quiz) return <div style={{ padding: 20 }}>Not found. <span onClick={() => setView("dashboard")} style={{ color: COLORS.green, cursor: "pointer" }}>Back</span></div>;
  return (
    <div style={{ padding: 20, maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setView("dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.green, fontSize: 20, padding: 0 }}>←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, color: COLORS.gray900 }}>Answer Review</h1>
          <p style={{ margin: "3px 0 0", color: COLORS.gray500, fontSize: 12 }}>{quiz.title} · Score: <strong>{sub.score}%</strong></p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {quiz.questions.map((q, qi) => {
          const given = sub.answers[qi], correct = given === q.correct;
          return (
            <Card key={qi} style={{ borderLeft: `4px solid ${correct ? COLORS.green : COLORS.red}`, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                <p style={{ margin: 0, fontWeight: 700, color: COLORS.gray900, fontSize: 14, flex: 1 }}>{qi + 1}. {q.text}</p>
                <span style={{ fontSize: 18 }}>{correct ? "✅" : "❌"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correct, isGiven = oi === given;
                  return (
                    <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 11px", borderRadius: 7, background: isCorrect ? COLORS.greenLight : (isGiven && !isCorrect) ? COLORS.redLight : "transparent", border: `1px solid ${isCorrect ? COLORS.green : isGiven ? COLORS.red : COLORS.gray100}` }}>
                      <span style={{ width: 20, height: 20, borderRadius: "50%", background: isCorrect ? COLORS.green : isGiven ? COLORS.red : COLORS.gray100, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: isCorrect || isGiven ? COLORS.white : COLORS.gray500, flexShrink: 0 }}>{["A","B","C","D"][oi]}</span>
                      <span style={{ fontSize: 13, color: isCorrect ? COLORS.greenDark : isGiven ? COLORS.red : COLORS.gray700, flex: 1 }}>{opt}</span>
                      {isCorrect && <span style={{ fontSize: 11, color: COLORS.green, fontWeight: 700 }}>Correct</span>}
                      {isGiven && !isCorrect && <span style={{ fontSize: 11, color: COLORS.red, fontWeight: 700 }}>Your answer</span>}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("login");
  const [view, setView] = useState("dashboard");

  const handleLogin = u => { setUser(u); setView("dashboard"); };
  const handleLogout = () => { setUser(null); setScreen("login"); };

  if (!user) {
    if (screen === "register") return <RegisterScreen onLogin={handleLogin} onGoLogin={() => setScreen("login")} />;
    return <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen("register")} />;
  }

  const v = typeof view === "string" ? { name: view } : view;
  const renderView = () => {
    if (user.role === "teacher") {
      if (v.name === "createQuiz") return <CreateQuiz user={user} setView={setView} />;
      if (v.name === "quizResults") return <QuizResults user={user} quizId={v.quizId} setView={setView} />;
      return <TeacherDashboard user={user} setView={setView} />;
    } else {
      if (v.name === "takeQuiz") return <TakeQuiz user={user} quizId={v.quizId} setView={setView} />;
      if (v.name === "quizFeedback") return <QuizFeedback user={user} submissionId={v.submissionId} setView={setView} />;
      return <StudentDashboard user={user} setView={setView} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite, fontFamily: "system-ui, sans-serif" }}>
      <TopBar user={user} onLogout={handleLogout} />
      <div style={{ paddingBottom: 48 }}>{renderView()}</div>
    </div>
  );
}
