import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, Mail, Phone, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { signupUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "../App.css";

export default function Signup() {
  const navigate = useNavigate(); const { login } = useAuth(); const { showToast } = useToast();
  const [form,setForm]=useState({name:"",email:"",phone:"",password:""}); const [loading,setLoading]=useState(false); const [showPassword,setShowPassword]=useState(false);
  const submit=async(e)=>{e.preventDefault();setLoading(true);try{const data=await signupUser(form);login(data);showToast("Account created successfully!");navigate("/");}catch(err){showToast(err.message,"error");}finally{setLoading(false);}};
  return <div className="auth-shell"><div className="auth-card">
    <div className="auth-brand"><div className="brand"><div className="brand-mark"><ShieldCheck size={21}/></div><div>Lost &amp; Found<small>Campus recovery platform</small></div></div></div>
    <h1 className="auth-title">Create your account</h1><p className="auth-subtitle">Join the campus lost &amp; found community in a few seconds.</p>
    <form className="auth-form" onSubmit={submit}>
      <div className="form-group"><label className="label">Full name</label><div className="field-wrap"><UserRound className="field-icon" size={17}/><input className="input has-icon" name="name" placeholder="Your full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div></div>
      <div className="form-group"><label className="label">Email address</label><div className="field-wrap"><Mail className="field-icon" size={17}/><input className="input has-icon" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div></div>
      <div className="form-group"><label className="label">Phone number</label><div className="field-wrap"><Phone className="field-icon" size={17}/><input className="input has-icon" name="phone" placeholder="Your phone number" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required/></div></div>
      <div className="form-group"><label className="label">Password</label><div className="password-wrap"><KeyRound className="field-icon" size={17}/><input className="input has-icon" name="password" type={showPassword?"text":"password"} placeholder="Create a password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/><button type="button" className="password-toggle" onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>
      <button className="btn btn-primary" disabled={loading}>{loading?"Creating account…":<><UserPlus size={17}/> Create account</>}</button>
    </form>
    <p className="auth-footer">Already have an account? <Link className="auth-link" to="/login">Sign in</Link></p>
  </div></div>;
}
