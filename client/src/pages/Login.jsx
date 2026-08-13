import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, LogIn, Mail, ShieldCheck } from "lucide-react";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "../App.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const data = await loginUser(form); login(data);
      showToast(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role === "admin" ? "/admin" : "/");
    } catch (err) { showToast(err.message, "error"); }
    finally { setLoading(false); }
  };

  return <div className="auth-shell">
    <div className="auth-card">
      <div className="auth-brand"><div className="brand"><div className="brand-mark"><ShieldCheck size={21} /></div><div>Lost &amp; Found<small>Campus recovery platform</small></div></div></div>
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-subtitle">Sign in to report items, search the campus board, and manage claims.</p>
      <form className="auth-form" onSubmit={submit}>
        <div className="form-group"><label className="label">Email address</label><div className="field-wrap"><Mail className="field-icon-email" size={20} /><input className="input has-icon" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div></div>
        <div className="form-group"><label className="label">Password</label><div className="password-wrap"><KeyRound className="field-icon-password" size={17} /><input className="input has-icon" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /><button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
        <button className="btn btn-primary" disabled={loading}>{loading ? "Signing in…" : <><LogIn size={17} /> Sign in</>}</button>
      </form>
      <p className="auth-footer">New here? <Link className="auth-link" to="/signup">Create an account</Link></p>
    </div>
  </div>;
}
