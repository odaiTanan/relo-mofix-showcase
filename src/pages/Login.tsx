import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const success = await login(username, password);
    if (success) navigate("/admin");
    else setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    setLoading(false);
  };

  return (
    <div className="login-shell" dir="rtl">
      <aside className="login-rail">
        <div className="login-brand"><span>RELO</span><b>&</b><span>MOFIX</span><small>STUDIO CONTROL</small></div>
        <div className="login-rail-copy"><span>RELO / ADMIN</span><h2>إدارة المحتوى<br />بوضوح وأناقة.</h2><p>مساحة العمل الخاصة بإدارة الأعمال والتصنيفات المنشورة على الموقع.</p></div>
        <span className="login-rail-index">© 2026 RELO & MOFIX</span>
      </aside>
      <main className="login-main">
        <section className="login-card">
          <div className="login-heading"><span className="login-kicker">WELCOME BACK</span><h1>تسجيل الدخول</h1><p>أدخل بيانات حساب الإدارة للمتابعة.</p></div>
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="username">اسم المستخدم<div className="login-input-wrap"><User size={18} /><input id="username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="أدخل اسم المستخدم" autoComplete="username" required /></div></label>
            <label htmlFor="password">كلمة المرور<div className="login-input-wrap"><Lock size={18} /><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="أدخل كلمة المرور" autoComplete="current-password" required /></div></label>
            {error && <div className="login-error">{error}</div>}
            <button className="login-submit" type="submit" disabled={loading}><LogIn size={18} />{loading ? "جاري التحقق..." : "دخول إلى اللوحة"}</button>
          </form>
          <p className="login-note">الوصول مخصص للمستخدمين المصرح لهم فقط.</p>
        </section>
      </main>
    </div>
  );
}