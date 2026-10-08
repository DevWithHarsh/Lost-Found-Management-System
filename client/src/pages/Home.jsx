import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, CheckCircle2, ChevronDown, Copy, ImagePlus, LogOut, MapPin, Package, Phone, Plus, Search, Tag, UserRound, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { createClaimRequest, createFoundItem, getFoundItems } from "../services/api";
import "../App.css";

const categories = ["Wallets & Purses",
    "ID & Bank Cards",
    "Important Documents",
    "Keys",
    "Mobile & Electronics",
    "Bags & Backpacks",
    "Jewelry & Watches",
    "Other Valuables"];
const currentUserId = (user) => user?._id || user?.id;

export default function Home() {
    const { user, logout } = useAuth(); const { showToast } = useToast();
    const [items, setItems] = useState([]), [showForm, setShowForm] = useState(false), [search, setSearch] = useState(""), [category, setCategory] = useState("All"), [date, setDate] = useState(""), [loading, setLoading] = useState(true), [formLoading, setFormLoading] = useState(false), [claimItem, setClaimItem] = useState(null), [claimReason, setClaimReason] = useState(""), [claimLoading, setClaimLoading] = useState(false);
    const [copiedPhone, setCopiedPhone] = useState(null);
    const [form, setForm] = useState({ name: "", category: "", description: "", location: "", foundDate: "", image: null });
    const loadItems = async () => { try { setLoading(true); const data = await getFoundItems(); setItems(data.items || []); } catch (err) { showToast(err.message, "error"); } finally { setLoading(false); } };
    useEffect(() => { loadItems(); }, []);
    const filtered = useMemo(() => items.filter(item => item.name?.toLowerCase().includes(search.toLowerCase()) && (category === "All" || item.category === category) && (!date || new Date(item.foundDate).toISOString().slice(0, 10) === date)), [items, search, category, date]);
    const copyToClipboard = async (phone, e) => {
        if (e) e.stopPropagation();
        try {
            await navigator.clipboard.writeText(phone);
            setCopiedPhone(phone);
            showToast("Phone number copied to clipboard!");
            setTimeout(() => setCopiedPhone(null), 2000);
        } catch {
            showToast("Failed to copy phone number", "error");
        }
    };
    const submitFound = async (e) => { e.preventDefault(); setFormLoading(true); try { await createFoundItem(form); showToast("Found item reported successfully!"); setForm({ name: "", category: "", description: "", location: "", foundDate: "", image: null }); setShowForm(false); await loadItems(); } catch (err) { showToast(err.message, "error"); } finally { setFormLoading(false); } };
    const submitClaim = async (e) => { e.preventDefault(); setClaimLoading(true); try { await createClaimRequest(claimItem._id, claimReason); showToast("Claim request submitted successfully!"); setClaimItem(null); setClaimReason(""); } catch (err) { showToast(err.message, "error"); } finally { setClaimLoading(false); } };
    const doLogout = () => { logout(); showToast("You have been logged out.", "info"); };
    return <div className="app-shell">
        <header className="topbar"><div className="container topbar-inner"><div className="brand"><div className="brand-mark"><Package size={20} /></div><div>LDRP Lost &amp; Found<small>Campus recovery platform</small></div></div><div className="user-actions"><div className="user-chip"><div className="avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div><span>Hi, {user?.name}</span></div><button className="btn btn-secondary icon-btn" onClick={doLogout} title="Logout"><LogOut size={17} /></button></div></div></header>
        <main className="page container">
            <div className="hero-row"><div><span className="eyebrow"><CheckCircle2 size={14} /> Community item board</span><h1 className="title">Find what you lost.<br />Return what you found.</h1><p className="subtitle">Browse items reported by students and staff, or help someone recover a missing belonging by reporting a found item.</p></div><button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>{showForm ? <><X size={17} /> Close form</> : <><Plus size={17} /> Report found item</>}</button></div>
            {showForm && <form className="form-card" onSubmit={submitFound}><div className="form-header"><div><h2 className="section-title">Report a found item</h2><p className="section-note">Add enough detail for the owner to recognize it.</p></div><button type="button" className="btn btn-secondary icon-btn" onClick={() => setShowForm(false)}><X size={18} /></button></div><div className="form-grid">
                <div className="form-group"><label className="label">Item name</label><input className="input" name="name" placeholder="e.g. Blue Realme phone" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="form-group"><label className="label">Category</label><select className="select" name="category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required><option value="">Select category</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="form-group full"><label className="label">Description</label><textarea className="textarea" name="description" placeholder="Color, identifying marks, contents, condition…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></div>
                <div className="form-group"><label className="label">Found location</label><input className="input" name="location" placeholder="e.g. Library, 2nd floor" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required /></div>
                <div className="form-group"><label className="label">Found date</label><input className="input" name="foundDate" type="date" value={form.foundDate} onChange={e => setForm({ ...form, foundDate: e.target.value })} required /></div>
                <div className="form-group full"><label className="label">Photo (optional)</label><label className="file-box"><ImagePlus size={19} /><span>{form.image ? form.image.name : "Upload a clear photo"}</span><input hidden type="file" accept="image/*" onChange={e => setForm({ ...form, image: e.target.files?.[0] || null })} /></label></div>
                <div className="form-group full"><button className="btn btn-primary" disabled={formLoading}>{formLoading ? "Uploading…" : <><Plus size={17} /> Publish found item</>}</button></div>
            </div></form>}
            <div className="toolbar"><div className="field-wrap"><Search className="field-icon" size={17} /><input className="input has-icon" placeholder="Search by item name…" value={search} onChange={e => setSearch(e.target.value)} /></div><div className="field-wrap" style={{ flex: "0 1 200px" }}><ChevronDown className="field-icon" size={16} /><select className="select has-icon" value={category} onChange={e => setCategory(e.target.value)}><option value="All">All Categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div><div className="field-wrap" style={{ flex: "0 1 180px" }}><CalendarDays className="field-icon" size={17} /><input className="input has-icon" type="date" value={date} onChange={e => setDate(e.target.value)} /></div></div>
            <div className="grid">{loading ? <div className="loading"><Package className="spinner" size={25} /><p>Loading found items…</p></div> : filtered.length === 0 ? <div className="empty"><div className="empty-icon"><Search size={24} /></div><h3>No matching items</h3><p>Try a different name, category, or date.</p></div> : filtered.map(item => { const mine = currentUserId(item.reportedBy) === currentUserId(user); const available = item.status === "available"; return <article className="item-card" key={item._id}>{item.image ? <img className="item-image" src={item.image} alt={item.name} /> : <div className="image-placeholder"><Package size={42} /></div>}<div className="item-body"><div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}><h3 className="item-title">{item.name}</h3><span className={`badge ${available ? "badge-available" : "badge-claimed"}`}>{item.status}</span></div><div className="meta"><Tag size={14} />{item.category}</div><p className="description">{item.description}</p><div className="meta"><MapPin size={14} />{item.location}</div><div className="meta"><CalendarDays size={14} />{new Date(item.foundDate).toLocaleDateString()}</div><div className="card-footer"><div className="reporter-box"><span className="reporter">Reported by {item.reportedBy?.name || "User"}</span>{item.reportedBy?.phone && <div className="phone-row"><a href={`tel:${item.reportedBy.phone}`} className="founder-phone" title="Call founder"><Phone size={12} /> {item.reportedBy.phone}</a><button type="button" className="copy-btn" onClick={(e) => copyToClipboard(item.reportedBy.phone, e)} title="Copy phone number">{copiedPhone === item.reportedBy.phone ? <Check size={12} className="copied-icon" /> : <Copy size={12} />}</button></div>}</div>{available && !mine && <button className="btn btn-primary" onClick={() => { setClaimItem(item); setClaimReason(""); }}><UserRound size={15} /> Claim</button>}</div></div></article> })}</div>
        </main>
        {claimItem && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && !claimLoading && setClaimItem(null)}><form className="modal" onSubmit={submitClaim}><div className="modal-header"><div><h2 className="section-title">Claim this item</h2><p className="section-note">Help the admin verify that it belongs to you.</p></div><button type="button" className="btn btn-secondary icon-btn" onClick={() => setClaimItem(null)} disabled={claimLoading}><X size={18} /></button></div><div className="modal-body"><div className="claim-preview">{claimItem.image ? <img src={claimItem.image} alt="" /> : <div className="empty-icon" style={{ width: 60, height: 60, margin: 0 }}><Package size={25} /></div>}<div><strong>{claimItem.name}</strong><div className="reporter">{claimItem.category} · {claimItem.location}</div>{claimItem.reportedBy?.phone && <div className="reporter" style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}><Phone size={12} /> Founder: {claimItem.reportedBy.phone}<button type="button" className="copy-btn" style={{ width: 22, height: 22 }} onClick={(e) => copyToClipboard(claimItem.reportedBy.phone, e)} title="Copy phone number">{copiedPhone === claimItem.reportedBy.phone ? <Check size={11} className="copied-icon" /> : <Copy size={11} />}</button></div>}</div></div><div className="form-group"><label className="label">Why is this yours?</label><textarea className="textarea" value={claimReason} onChange={e => setClaimReason(e.target.value)} placeholder="Mention unique marks, contents, approximate purchase details, or anything an admin can use to verify ownership." required /></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setClaimItem(null)} disabled={claimLoading}>Cancel</button><button className="btn btn-primary" disabled={claimLoading}>{claimLoading ? "Submitting…" : <><CheckCircle2 size={17} /> Submit claim request</>}</button></div></div></form></div>}
    </div>;
}
