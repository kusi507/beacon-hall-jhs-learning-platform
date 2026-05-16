import { useState, useEffect, useCallback } from "react";

// ─── Palette & Tokens ────────────────────────────────────────────────────────
const COLORS = {
  gold: "#D4A017",
  goldLight: "#F5E6B3",
  goldDark: "#8B6914",
  green: "#2D6A4F",
  greenLight: "#D8F3DC",
  greenDark: "#1B4332",
  red: "#C1121F",
  redLight: "#FFDAD9",
  white: "#FFFEF7",
  offWhite: "#F8F5EC",
  gray50: "#F4F2EB",
  gray100: "#E8E4D9",
  gray300: "#B5B0A0",
  gray500: "#7A7468",
  gray700: "#4A4640",
  gray900: "#2C2A26",
  black: "#1A1916",
};

const style = (obj) => obj;

// ─── Local Storage "DB" ──────────────────────────────────────────────────────
const DB = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  init: () => {
    if (!DB.get("users")) {
      DB.set("users", [
        { id: "t1", email: "teacher@demo.gh", password: "demo123", role: "teacher", name: "Abena Mensah", school: "Accra Academy", class: "Basic 7" },
        { id: "s1", email: "student@demo.gh", password: "demo123", role: "student", name: "Kwame Asante", school: "Accra Academy", class: "Basic 7" },
      ]);
    }
    if (!DB.get("quizzes")) {
      DB.set("quizzes", [
        {
          id: "q1", teacherId: "t1", title: "Ghana Independence Quiz",
          classCode: "CLASS7A", createdAt: new Date().toISOString(),
          questions: [
            { id: "qq1", text: "In what year did Ghana gain independence?", options: ["1957","1960","1963","1950"], correct: 0 },
            { id: "qq2", text: "Who was Ghana's first president?", options: ["Jerry Rawlings","John Mahama","Kwame Nkrumah","Kofi Atta Agyekum"], correct: 2 },
            { id: "qq3", text: "What is the capital city of Ghana?", options: ["Kumasi","Accra","Tamale","Cape Coast"], correct: 1 },
          ]
        }
      ]);
    }
    if (!DB.get("submissions")) DB.set("submissions", []);
  }
};

// ─── Auth Helpers ─────────────────────────────────────────────────────────────
const Auth = {
  login: (email, password) => {
    const users = DB.get("users") || [];
    return users.find(u => u.email === email && u.password === password) || null;
  },
  register: (data) => {
    const users = DB.get("users") || [];
    if (users.find(u => u.email === data.email)) return { error: "Email already registered" };
    const user = { ...data, id: "u" + Date.now() };
    DB.set("users", [...users, user]);
    return { user };
  },
  current: () => DB.get("currentUser"),
  setCurrent: (u) => DB.set("currentUser", u),
  logout: () => localStorage.removeItem("currentUser"),
};

// ─── Shared UI Components ─────────────────────────────────────────────────────
const GhanaFlag = () => (
  <svg width="28" height="18" viewBox="0 0 28 18" style={{ borderRadius: 3, flexShrink: 0 }}>
    <rect width="28" height="6" fill="#E8B400" />
    <rect y="6" width="28" height="6" fill="#2D6A4F" />
    <rect y="12" width="28" height="6" fill="#C1121F" />
    <polygon points="14,5 15.5,9.5 11.5,7 16.5,7 12.5,9.5" fill="#1A1916" />
  </svg>
);

const Btn = ({ children, onClick, variant = "primary", size = "md", disabled, style: s, type = "button" }) => {
  const base = {
    border: "none", cursor: disabled ? "not-allowed" : "pointer", borderRadius: 8,
    fontFamily: "'Nunito', sans-serif", fontWeight: 700, transition: "all 0.15s",
    display: "inline-flex", alignItems: "center", gap: 6, opacity: disabled ? 0.5 : 1,
  };
  const sizes = { sm: { padding: "6px 14px", fontSize: 13 }, md: { padding: "10px 20px", fontSize: 15 }, lg: { padding: "13px 28px", fontSize: 16 } };
  const variants = {
    primary: { background: COLORS.green, color: COLORS.white },
    secondary: { background: COLORS.goldLight, color: COLORS.goldDark },
    danger: { background: COLORS.redLight, color: COLORS.red },
    ghost: { background: "transparent", color: COLORS.green, border: `1.5px solid ${COLORS.green}` },
    gold: { background: COLORS.gold, color: COLORS.white },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...s }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = "brightness(1.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.filter = ""; }}>
      {children}
    </button>
  );
};

const Input = ({ label, type = "text", value, onChange, placeholder, required, error }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: COLORS.gray700, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
      style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${error ? COLORS.red : COLORS.gray100}`, borderRadius: 8, fontSize: 15, fontFamily: "'Nunito', sans-serif", background: COLORS.white, color: COLORS.gray900, boxSizing: "border-box", outline: "none" }} />
    {error && <p style={{ color: COLORS.red, fontSize: 12, marginTop: 4 }}>{error}</p>}
  </div>
);

const Card = ({ children, style: s }) => (
  <div style={{ background: COLORS.white, border: `1px solid ${COLORS.gray100}`, borderRadius: 12, padding: "24px", ...s }}>{children}</div>
);

const Badge = ({ children, color = "green" }) => {
  const colors = { green: { bg: COLORS.greenLight, text: COLORS.greenDark }, gold: { bg: COLORS.goldLight, text: COLORS.goldDark }, red: { bg: COLORS.redLight, text: COLORS.red } };
  return <span style={{ background: colors[color].bg, color: colors[color].text, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{children}</span>;
};

const TopBar = ({ user, onLogout }) => (
  <div style={{ background: COLORS.green, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <GhanaFlag />
      <span style={{ color: COLORS.white, fontWeight: 800, fontSize: 18, fontFamily: "'Nunito', sans-serif" }}>EduGhana</span>
      <span style={{ color: COLORS.goldLight, fontSize: 12, marginTop: 1 }}>JHS Portal</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ textAlign: "right" }}>
        <div style={{ color: COLORS.white, fontWeight: 700, fontSize: 14 }}>{user.name}</div>
        <div style={{ color: COLORS.goldLight, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{user.role}</div>
      </div>
      <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: COLORS.white, padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>Logout</button>
    </div>
  </div>
);

// ─── Auth Screens ─────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin, onGoRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const user = Auth.login(email, password);
    if (!user) { setError("Invalid email or password."); return; }
    Auth.setCurrent(user);
    onLogin(user);
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ marginBottom: 28, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <GhanaFlag />
          <span style={{ fontSize: 28, fontWeight: 800, color: COLORS.green, fontFamily: "'Nunito', sans-serif" }}>EduGhana</span>
        </div>
        <p style={{ color: COLORS.gray500, fontSize: 14, margin: 0 }}>JHS Learning Portal · Basic 7–9</p>
      </div>
      <Card style={{ width: "100%", maxWidth: 420 }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 22, color: COLORS.gray900, fontFamily: "'Nunito', sans-serif" }}>Sign in</h2>
        {error && <div style={{ background: COLORS.redLight, color: COLORS.red, padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
        <Input label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@school.edu.gh" />
        <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" />
        <div style={{ background: COLORS.gray50, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: COLORS.gray500 }}>
          <strong>Demo accounts:</strong><br />
          Teacher: teacher@demo.gh / demo123<br />
          Student: student@demo.gh / demo123
        </div>
        <Btn onClick={submit} style={{ width: "100%" }}>Sign in →</Btn>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: COLORS.gray500 }}>
          No account? <span onClick={onGoRegister} style={{ color: COLORS.green, cursor: "pointer", fontWeight: 700 }}>Create one</span>
        </p>
      </Card>
    </div>
  );
};

const RegisterScreen = ({ onLogin, onGoLogin }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", school: "", class: "" });
  const [error, setError] = useState("");

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name || !form.email || !form.password) { setError("Please fill all required fields."); return; }
    const { user, error: e } = Auth.register(form);
    if (e) { setError(e); return; }
    Auth.setCurrent(user);
    onLogin(user);
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.offWhite, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <GhanaFlag />
          <span style={{ fontSize: 26, fontWeight: 800, color: COLORS.green, fontFamily: "'Nunito', sans-serif" }}>EduGhana</span>
        </div>
      </div>
      <Card style={{ width: "100%", maxWidth: 440 }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 20, color: COLORS.gray900, fontFamily: "'Nunito', sans-serif" }}>Create your account</h2>
        {error && <div style={{ background: COLORS.redLight, color: COLORS.red, padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: COLORS.gray700, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>I am a</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {["student", "teacher"].map(r => (
              <div key={r} onClick={() => set("role")(r)} style={{ border: `2px solid ${form.role === r ? COLORS.green : COLORS.gray100}`, borderRadius: 10, padding: "14px", textAlign: "center", cursor: "pointer", background: form.role === r ? COLORS.greenLight : COLORS.white, transition: "all 0.15s" }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{r === "student" ? "🎓" : "👩‍🏫"}</div>
                <div style={{ fontWeight: 700, color: form.role === r ? COLORS.greenDark : COLORS.gray700, textTransform: "capitalize" }}>{r}</div>
              </div>
            ))}
          </div>
        </div>
        <Input label="Full name *" value={form.name} onChange={set("name")} placeholder="e.g. Abena Asante" />
        <Input label="Email address *" type="email" value={form.email} onChange={set("email")} placeholder="you@school.edu.gh" />
        <Input label="Password *" type="password" value={form.password} onChange={set("password")} placeholder="Min. 6 characters" />
        <Input label="School name" value={form.school} onChange={set("school")} placeholder="e.g. Achimota School" />
        <Input label="Class / Grade" value={form.class} onChange={set("class")} placeholder="e.g. Basic 7A" />
        <Btn onClick={submit} style={{ width: "100%" }}>Create account →</Btn>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: COLORS.gray500 }}>
          Already have an account? <span onClick={onGoLogin} style={{ color: COLORS.green, cursor: "pointer", fontWeight: 700 }}>Sign in</span>
        </p>
      </Card>
    </div>
  );
};

// ─── Teacher Views ────────────────────────────────────────────────────────────
const TeacherDashboard = ({ user, setView }) => {
  const quizzes = (DB.get("quizzes") || []).filter(q => q.teacherId === user.id);
  const submissions = DB.get("submissions") || [];

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, color: COLORS.gray900, fontFamily: "'Nunito', sans-serif" }}>Welcome back, {user.name.split(" ")[0]} 👋</h1>
          <p style={{ margin: "4px 0 0", color: COLORS.gray500, fontSize: 14 }}>{user.school || "EduGhana"} · {user.class || "Teacher"}</p>
        </div>
        <Btn onClick={() => setView("createQuiz")} variant="gold">+ Create Quiz</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Quizzes Created", value: quizzes.length, icon: "📝" },
          { label: "Total Submissions", value: submissions.filter(s => quizzes.some(q => q.id === s.quizId)).length, icon: "📊" },
          { label: "Students Reached", value: [...new Set(submissions.filter(s => quizzes.some(q => q.id === s.quizId)).map(s => s.studentId))].length, icon: "🎓" },
        ].map(m => (
          <div key={m.label} style={{ background: COLORS.white, border: `1px solid ${COLORS.gray100}`, borderRadius: 10, padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: 26 }}>{m.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.green, fontFamily: "'Nunito', sans-serif" }}>{m.value}</div>
            <div style={{ fontSize: 12, color: COLORS.gray500, marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 18, color: COLORS.gray900, marginBottom: 14, fontFamily: "'Nunito', sans-serif" }}>Your Quizzes</h2>
      {quizzes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", color: COLORS.gray300, border: `2px dashed ${COLORS.gray100}`, borderRadius: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p style={{ margin: 0, fontSize: 16 }}>No quizzes yet. Create your first quiz!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {quizzes.map(q => {
            const subs = submissions.filter(s => s.quizId === q.id);
            const avg = subs.length ? Math.round(subs.reduce((a, s) => a + s.score, 0) / subs.length) : null;
            return (
              <Card key={q.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "18px 24px" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.gray900 }}>{q.title}</div>
                  <div style={{ fontSize: 13, color: COLORS.gray500, marginTop: 3 }}>
                    Code: <strong style={{ color: COLORS.green }}>{q.classCode}</strong> · {q.questions.length} questions · {subs.length} submission{subs.length !== 1 ? "s" : ""}
                    {avg !== null && <> · Avg: <strong>{avg}%</strong></>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn size="sm" variant="ghost" onClick={() => setView({ name: "quizResults", quizId: q.id })}>View Results</Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CreateQuiz = ({ user, setView }) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [classCode, setClassCode] = useState("");
  const [questions, setQuestions] = useState([{ text: "", options: ["", "", "", ""], correct: 0 }]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const addQ = () => {
    if (questions.length >= 10) return;
    setQuestions([...questions, { text: "", options: ["", "", "", ""], correct: 0 }]);
  };

  const updateQ = (i, field, val) => {
    const qs = [...questions];
    qs[i] = { ...qs[i], [field]: val };
    setQuestions(qs);
  };

  const updateOption = (qi, oi, val) => {
    const qs = [...questions];
    qs[qi].options[oi] = val;
    setQuestions(qs);
  };

  const removeQ = (i) => setQuestions(questions.filter((_, idx) => idx !== i));

  const save = () => {
    if (!title.trim()) { setError("Please enter a quiz title."); return; }
    if (!classCode.trim()) { setError("Please enter a class code."); return; }
    for (const q of questions) {
      if (!q.text.trim()) { setError("All questions need text."); return; }
      if (q.options.some(o => !o.trim())) { setError("All options must be filled."); return; }
    }
    const quiz = { id: "q" + Date.now(), teacherId: user.id, title: title.trim(), classCode: classCode.trim().toUpperCase(), createdAt: new Date().toISOString(), questions: questions.map((q, i) => ({ ...q, id: "qq" + i })) };
    const quizzes = DB.get("quizzes") || [];
    DB.set("quizzes", [...quizzes, quiz]);
    setSaved(true);
  };

  if (saved) return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
      <h2 style={{ color: COLORS.green, fontFamily: "'Nunito', sans-serif" }}>Quiz Created!</h2>
      <Card style={{ marginBottom: 20 }}>
        <p style={{ margin: 0, color: COLORS.gray700 }}>Share this class code with your students:</p>
        <div style={{ fontSize: 36, fontWeight: 800, color: COLORS.green, fontFamily: "'Nunito', sans-serif", margin: "12px 0", letterSpacing: "0.1em" }}>{classCode.toUpperCase()}</div>
        <p style={{ margin: 0, fontSize: 14, color: COLORS.gray500 }}>Students enter this code to find and take "{title}"</p>
      </Card>
      <Btn onClick={() => setView("dashboard")}>Back to Dashboard</Btn>
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setView("dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.green, fontSize: 20, padding: 0 }}>←</button>
        <h1 style={{ margin: 0, fontSize: 22, color: COLORS.gray900, fontFamily: "'Nunito', sans-serif" }}>Create New Quiz</h1>
      </div>
      {error && <div style={{ background: COLORS.redLight, color: COLORS.red, padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 16px", color: COLORS.gray900, fontFamily: "'Nunito', sans-serif" }}>Quiz Details</h3>
        <Input label="Quiz Title *" value={title} onChange={setTitle} placeholder="e.g. Chapter 3: Ghana History" />
        <Input label="Class Code *" value={classCode} onChange={v => setClassCode(v.toUpperCase())} placeholder="e.g. CLASS7A" />
        <p style={{ margin: 0, fontSize: 13, color: COLORS.gray500 }}>Students will use this code to access the quiz. Keep it simple — no spaces.</p>
      </Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ margin: 0, color: COLORS.gray900, fontFamily: "'Nunito', sans-serif" }}>Questions ({questions.length}/10)</h3>
        {questions.length < 10 && <Btn size="sm" variant="secondary" onClick={addQ}>+ Add Question</Btn>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {questions.map((q, qi) => (
          <Card key={qi} style={{ background: COLORS.gray50 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, color: COLORS.green, fontSize: 14 }}>Question {qi + 1}</span>
              {questions.length > 1 && <button onClick={() => removeQ(qi)} style={{ background: "none", border: "none", color: COLORS.red, cursor: "pointer", fontSize: 13 }}>Remove</button>}
            </div>
            <textarea value={q.text} onChange={e => updateQ(qi, "text", e.target.value)} placeholder="Enter your question here..." rows={2}
              style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${COLORS.gray100}`, borderRadius: 8, fontSize: 14, fontFamily: "'Nunito', sans-serif", resize: "vertical", background: COLORS.white, boxSizing: "border-box", marginBottom: 12 }} />
            <p style={{ margin: "0 0 10px", fontSize: 13, color: COLORS.gray700, fontWeight: 600 }}>Answer Options (click ✓ to mark correct):</p>
            {q.options.map((opt, oi) => (
              <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <button onClick={() => updateQ(qi, "correct", oi)}
                  style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${q.correct === oi ? COLORS.green : COLORS.gray300}`, background: q.correct === oi ? COLORS.green : "transparent", color: q.correct === oi ? COLORS.white : COLORS.gray300, cursor: "pointer", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                  {["A","B","C","D"][oi]}
                </button>
                <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${["A","B","C","D"][oi]}`}
                  style={{ flex: 1, padding: "8px 12px", border: `1.5px solid ${q.correct === oi ? COLORS.green : COLORS.gray100}`, borderRadius: 8, fontSize: 14, fontFamily: "'Nunito', sans-serif", background: q.correct === oi ? COLORS.greenLight : COLORS.white }} />
              </div>
            ))}
          </Card>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
        <Btn variant="ghost" onClick={() => setView("dashboard")}>Cancel</Btn>
        <Btn variant="gold" onClick={save}>Save & Publish Quiz 🚀</Btn>
      </div>
    </div>
  );
};

const QuizResults = ({ user, quizId, setView }) => {
  const quizzes = DB.get("quizzes") || [];
  const quiz = quizzes.find(q => q.id === quizId);
  const submissions = (DB.get("submissions") || []).filter(s => s.quizId === quizId);
  const users = DB.get("users") || [];

  if (!quiz) return <div style={{ padding: 24 }}>Quiz not found. <span onClick={() => setView("dashboard")} style={{ color: COLORS.green, cursor: "pointer" }}>Back</span></div>;

  const avg = submissions.length ? Math.round(submissions.reduce((a, s) => a + s.score, 0) / submissions.length) : 0;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setView("dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.green, fontSize: 20, padding: 0 }}>←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: COLORS.gray900, fontFamily: "'Nunito', sans-serif" }}>{quiz.title}</h1>
          <p style={{ margin: "3px 0 0", color: COLORS.gray500, fontSize: 13 }}>Code: <strong>{quiz.classCode}</strong> · {quiz.questions.length} questions</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Submissions", value: submissions.length, icon: "📬" },
          { label: "Average Score", value: avg + "%", icon: "📊" },
          { label: "Passed (≥50%)", value: submissions.filter(s => s.score >= 50).length, icon: "✅" },
        ].map(m => (
          <div key={m.label} style={{ background: COLORS.white, border: `1px solid ${COLORS.gray100}`, borderRadius: 10, padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: 24 }}>{m.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.green, fontFamily: "'Nunito', sans-serif" }}>{m.value}</div>
            <div style={{ fontSize: 12, color: COLORS.gray500, marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>
      {submissions.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: COLORS.gray300, border: `2px dashed ${COLORS.gray100}`, borderRadius: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <p style={{ margin: 0 }}>No submissions yet. Share the code <strong>{quiz.classCode}</strong> with students.</p>
        </div>
      ) : (
        <Card>
          <h3 style={{ margin: "0 0 16px", fontFamily: "'Nunito', sans-serif" }}>Student Submissions</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: COLORS.gray50 }}>
                  {["Student", "Score", ...quiz.questions.map((_, i) => `Q${i + 1}`)].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", borderBottom: `1px solid ${COLORS.gray100}`, color: COLORS.gray700, fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => {
                  const student = users.find(u => u.id === sub.studentId);
                  return (
                    <tr key={sub.id} style={{ borderBottom: `1px solid ${COLORS.gray50}` }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600 }}>{student?.name || "Unknown"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <Badge color={sub.score >= 70 ? "green" : sub.score >= 50 ? "gold" : "red"}>{sub.score}%</Badge>
                      </td>
                      {quiz.questions.map((q, qi) => {
                        const ans = sub.answers[qi];
                        const correct = ans === q.correct;
                        return (
                          <td key={qi} style={{ padding: "10px 14px", textAlign: "center" }}>
                            <span style={{ color: correct ? COLORS.green : COLORS.red, fontWeight: 700 }}>{correct ? "✓" : "✗"}</span>
                          </td>
                        );
                      })}
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

// ─── Student Views ────────────────────────────────────────────────────────────
const StudentDashboard = ({ user, setView }) => {
  const [code, setCode] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const submissions = (DB.get("submissions") || []).filter(s => s.studentId === user.id);
  const allQuizzes = DB.get("quizzes") || [];
  const takenQuizzes = submissions.map(s => allQuizzes.find(q => q.id === s.quizId)).filter(Boolean);

  const search = () => {
    setSearchError("");
    setSearchResult(null);
    if (!code.trim()) { setSearchError("Enter a class code."); return; }
    const found = allQuizzes.filter(q => q.classCode === code.trim().toUpperCase());
    if (!found.length) { setSearchError("No quizzes found for this class code. Check with your teacher."); return; }
    setSearchResult(found);
  };

  return (
    <div style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, color: COLORS.gray900, fontFamily: "'Nunito', sans-serif" }}>Hello, {user.name.split(" ")[0]}! 👋</h1>
        <p style={{ margin: "4px 0 0", color: COLORS.gray500, fontSize: 14 }}>{user.school || "EduGhana"} · {user.class || "Student"}</p>
      </div>
      <Card style={{ marginBottom: 24, background: `linear-gradient(135deg, ${COLORS.greenLight} 0%, ${COLORS.goldLight} 100%)`, border: "none" }}>
        <h3 style={{ margin: "0 0 14px", color: COLORS.greenDark, fontFamily: "'Nunito', sans-serif" }}>📌 Find a Quiz</h3>
        <p style={{ margin: "0 0 14px", fontSize: 14, color: COLORS.gray700 }}>Ask your teacher for the class code, then enter it below:</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. CLASS7A" onKeyDown={e => e.key === "Enter" && search()}
            style={{ flex: 1, minWidth: 160, padding: "10px 14px", border: `1.5px solid ${COLORS.gray100}`, borderRadius: 8, fontSize: 16, fontFamily: "'Nunito', sans-serif", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }} />
          <Btn onClick={search} variant="primary">Find Quizzes →</Btn>
        </div>
        {searchError && <p style={{ margin: "10px 0 0", color: COLORS.red, fontSize: 14 }}>{searchError}</p>}
        {searchResult && (
          <div style={{ marginTop: 16 }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: COLORS.gray700, fontWeight: 600 }}>Found {searchResult.length} quiz{searchResult.length !== 1 ? "zes" : ""}:</p>
            {searchResult.map(q => {
              const taken = submissions.some(s => s.quizId === q.id);
              return (
                <div key={q.id} style={{ background: COLORS.white, border: `1px solid ${COLORS.gray100}`, borderRadius: 8, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: COLORS.gray900 }}>{q.title}</div>
                    <div style={{ fontSize: 13, color: COLORS.gray500 }}>{q.questions.length} questions</div>
                  </div>
                  {taken ? <Badge color="gold">Completed ✓</Badge> : <Btn size="sm" onClick={() => setView({ name: "takeQuiz", quizId: q.id })}>Start Quiz →</Btn>}
                </div>
              );
            })}
          </div>
        )}
      </Card>
      <h2 style={{ fontSize: 18, color: COLORS.gray900, marginBottom: 14, fontFamily: "'Nunito', sans-serif" }}>Your Completed Quizzes</h2>
      {submissions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: COLORS.gray300, border: `2px dashed ${COLORS.gray100}`, borderRadius: 12 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📚</div>
          <p style={{ margin: 0 }}>No quizzes taken yet. Enter a class code to get started!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {submissions.map(sub => {
            const quiz = allQuizzes.find(q => q.id === sub.quizId);
            return (
              <Card key={sub.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, padding: "16px 20px" }}>
                <div>
                  <div style={{ fontWeight: 700, color: COLORS.gray900 }}>{quiz?.title || "Unknown Quiz"}</div>
                  <div style={{ fontSize: 13, color: COLORS.gray500 }}>{quiz?.questions.length} questions · Taken on {new Date(sub.submittedAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
  const quizzes = DB.get("quizzes") || [];
  const quiz = quizzes.find(q => q.id === quizId);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || submitted) return;
    const t = setInterval(() => setTimeLeft(tl => { if (tl <= 1) { clearInterval(t); handleSubmit(); return 0; } return tl - 1; }), 1000);
    return () => clearInterval(t);
  }, [started, submitted]);

  if (!quiz) return <div style={{ padding: 24 }}>Quiz not found.</div>;

  const existing = (DB.get("submissions") || []).find(s => s.quizId === quizId && s.studentId === user.id);
  if (existing) return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: 48 }}>✋</div>
      <h2 style={{ color: COLORS.gray900, fontFamily: "'Nunito', sans-serif" }}>Already Submitted</h2>
      <p style={{ color: COLORS.gray500 }}>You already completed this quiz. You scored <strong>{existing.score}%</strong>.</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <Btn onClick={() => setView({ name: "quizFeedback", submissionId: existing.id })}>Review Answers</Btn>
        <Btn variant="ghost" onClick={() => setView("dashboard")}>Dashboard</Btn>
      </div>
    </div>
  );

  const handleSubmit = () => {
    const correct = quiz.questions.filter((q, i) => answers[i] === q.correct).length;
    const pct = Math.round((correct / quiz.questions.length) * 100);
    const sub = { id: "sub" + Date.now(), quizId, studentId: user.id, answers: quiz.questions.map((_, i) => answers[i] ?? -1), score: pct, submittedAt: new Date().toISOString() };
    const subs = DB.get("submissions") || [];
    DB.set("submissions", [...subs, sub]);
    setScore({ pct, correct, total: quiz.questions.length, subId: sub.id });
    setSubmitted(true);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerColor = timeLeft < 300 ? COLORS.red : COLORS.gray700;

  if (!started) return (
    <div style={{ padding: 24, maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
      <h2 style={{ color: COLORS.gray900, fontFamily: "'Nunito', sans-serif" }}>{quiz.title}</h2>
      <Card style={{ textAlign: "left", marginBottom: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[`${quiz.questions.length} multiple-choice questions`, "30 minute time limit", "One attempt only", "Instant results after submission"].map((info, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: COLORS.gray700 }}>
              <span style={{ color: COLORS.green, fontWeight: 700 }}>✓</span> {info}
            </div>
          ))}
        </div>
      </Card>
      <Btn size="lg" onClick={() => setStarted(true)} style={{ width: "100%" }}>Start Quiz →</Btn>
    </div>
  );

  if (submitted && score) return (
    <div style={{ padding: 24, maxWidth: 580, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: 60, marginBottom: 8 }}>{score.pct >= 70 ? "🏆" : score.pct >= 50 ? "👍" : "📚"}</div>
      <h2 style={{ fontFamily: "'Nunito', sans-serif", color: COLORS.gray900 }}>Quiz Complete!</h2>
      <div style={{ background: score.pct >= 70 ? COLORS.greenLight : score.pct >= 50 ? COLORS.goldLight : COLORS.redLight, border: `2px solid ${score.pct >= 70 ? COLORS.green : score.pct >= 50 ? COLORS.gold : COLORS.red}`, borderRadius: 16, padding: "28px", marginBottom: 20 }}>
        <div style={{ fontSize: 56, fontWeight: 800, color: score.pct >= 70 ? COLORS.greenDark : score.pct >= 50 ? COLORS.goldDark : COLORS.red, fontFamily: "'Nunito', sans-serif" }}>{score.pct}%</div>
        <p style={{ margin: 0, color: COLORS.gray700, fontSize: 16 }}>{score.correct} out of {score.total} correct</p>
        <p style={{ margin: "8px 0 0", color: COLORS.gray500, fontSize: 14 }}>{score.pct >= 70 ? "Excellent work! 🌟" : score.pct >= 50 ? "Good effort! Keep studying." : "Keep practicing — you'll improve!"}</p>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <Btn onClick={() => setView({ name: "quizFeedback", submissionId: score.subId })}>Review Answers</Btn>
        <Btn variant="ghost" onClick={() => setView("dashboard")}>Dashboard</Btn>
      </div>
    </div>
  );

  const q = quiz.questions[current];
  const progress = ((current) / quiz.questions.length) * 100;

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 14, color: COLORS.gray500, fontWeight: 600 }}>Question {current + 1} of {quiz.questions.length}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: timerColor }}>⏱ {mins}:{secs.toString().padStart(2, "0")}</span>
      </div>
      <div style={{ height: 6, background: COLORS.gray100, borderRadius: 3, marginBottom: 24 }}>
        <div style={{ height: "100%", width: `${progress}%`, background: COLORS.green, borderRadius: 3, transition: "width 0.3s" }} />
      </div>
      <Card style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: COLORS.gray900, margin: "0 0 20px", lineHeight: 1.5, fontFamily: "'Nunito', sans-serif" }}>{q.text}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, oi) => {
            const selected = answers[current] === oi;
            return (
              <div key={oi} onClick={() => setAnswers({ ...answers, [current]: oi })}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, border: `2px solid ${selected ? COLORS.green : COLORS.gray100}`, background: selected ? COLORS.greenLight : COLORS.white, cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${selected ? COLORS.green : COLORS.gray300}`, background: selected ? COLORS.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: selected ? COLORS.white : COLORS.gray500, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{["A","B","C","D"][oi]}</div>
                <span style={{ fontSize: 15, color: selected ? COLORS.greenDark : COLORS.gray900 }}>{opt}</span>
              </div>
            );
          })}
        </div>
      </Card>
      <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
        <Btn variant="ghost" onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>← Previous</Btn>
        {current < quiz.questions.length - 1
          ? <Btn onClick={() => setCurrent(c => c + 1)} disabled={answers[current] === undefined}>Next →</Btn>
          : <Btn variant="gold" onClick={handleSubmit} disabled={answers[current] === undefined}>Submit Quiz 🚀</Btn>}
      </div>
    </div>
  );
};

const QuizFeedback = ({ user, submissionId, setView }) => {
  const submissions = DB.get("submissions") || [];
  const sub = submissions.find(s => s.id === submissionId);
  const quizzes = DB.get("quizzes") || [];
  const quiz = sub ? quizzes.find(q => q.id === sub.quizId) : null;

  if (!sub || !quiz) return <div style={{ padding: 24 }}>Not found. <span onClick={() => setView("dashboard")} style={{ color: COLORS.green, cursor: "pointer" }}>Back</span></div>;

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setView("dashboard")} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.green, fontSize: 20, padding: 0 }}>←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontFamily: "'Nunito', sans-serif", color: COLORS.gray900 }}>Answer Review</h1>
          <p style={{ margin: "3px 0 0", color: COLORS.gray500, fontSize: 13 }}>{quiz.title} · Score: <strong>{sub.score}%</strong></p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {quiz.questions.map((q, qi) => {
          const given = sub.answers[qi];
          const correct = given === q.correct;
          return (
            <Card key={qi} style={{ borderLeft: `4px solid ${correct ? COLORS.green : COLORS.red}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                <p style={{ margin: 0, fontWeight: 700, color: COLORS.gray900, fontSize: 15, flex: 1 }}>{qi + 1}. {q.text}</p>
                <span style={{ fontSize: 20 }}>{correct ? "✅" : "❌"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correct;
                  const isGiven = oi === given;
                  return (
                    <div key={oi} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: isCorrect ? COLORS.greenLight : (isGiven && !isCorrect) ? COLORS.redLight : "transparent", border: `1px solid ${isCorrect ? COLORS.green : isGiven ? COLORS.red : COLORS.gray100}` }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: isCorrect ? COLORS.green : isGiven ? COLORS.red : COLORS.gray100, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: isCorrect || isGiven ? COLORS.white : COLORS.gray500, flexShrink: 0 }}>{["A","B","C","D"][oi]}</span>
                      <span style={{ fontSize: 14, color: isCorrect ? COLORS.greenDark : isGiven ? COLORS.red : COLORS.gray700 }}>{opt}</span>
                      {isCorrect && <span style={{ marginLeft: "auto", fontSize: 12, color: COLORS.green, fontWeight: 700 }}>Correct</span>}
                      {isGiven && !isCorrect && <span style={{ marginLeft: "auto", fontSize: 12, color: COLORS.red, fontWeight: 700 }}>Your answer</span>}
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

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("login");
  const [view, setView] = useState("dashboard");

  useEffect(() => {
    DB.init();
    const u = Auth.current();
    if (u) setUser(u);
  }, []);

  const handleLogin = (u) => { setUser(u); setView("dashboard"); };
  const handleLogout = () => { Auth.logout(); setUser(null); setScreen("login"); };

  if (!user) {
    if (screen === "register") return <RegisterScreen onLogin={handleLogin} onGoLogin={() => setScreen("login")} />;
    return <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen("register")} />;
  }

  const renderView = () => {
    const v = typeof view === "string" ? { name: view } : view;
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
    <div style={{ minHeight: "100vh", background: COLORS.offWhite, fontFamily: "'Nunito', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <TopBar user={user} onLogout={handleLogout} />
      <div style={{ paddingBottom: 40 }}>{renderView()}</div>
    </div>
  );
}
