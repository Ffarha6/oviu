import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Save } from "lucide-react";
import api from "../../../api/axios";

export default function CannedResponsesPanel({ onClose, onPick }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = () => {
    setLoading(true);
    api.get("/admin/chatbot/canned-responses/")
      .then((res) => setItems(res.data))
      .catch((err) => console.error("فشل تحميل الردود الجاهزة:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (!editing.title?.trim() || !editing.text?.trim()) return;
    setSaving(true);
    try {
      if (editing.id) {
        await api.patch(`/admin/chatbot/canned-responses/${editing.id}/`, { title: editing.title, text: editing.text });
      } else {
        await api.post("/admin/chatbot/canned-responses/", { title: editing.title, text: editing.text });
      }
      setEditing(null);
      fetchItems();
    } catch (err) {
      alert("حصل خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنتِ متأكدة من حذف هذا الرد؟")) return;
    try {
      await api.delete(`/admin/chatbot/canned-responses/${id}/`);
      fetchItems();
    } catch (err) {
      alert("حصل خطأ أثناء الحذف");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-primary">الردود الجاهزة</h3>
          <button onClick={onClose} className="text-primary/40 hover:text-primary"><X size={18} /></button>
        </div>

        {editing ? (
          <div className="space-y-3 mb-4 bg-background rounded-xl p-4">
            <div>
              <label className="block text-xs font-medium text-primary/60 mb-1">اسم الرد</label>
              <input
                type="text"
                value={editing.title || ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full bg-surface border border-primary/10 rounded-lg px-3 py-2 text-sm text-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary/60 mb-1">نص الرد</label>
              <textarea
                value={editing.text || ""}
                onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                rows={3}
                className="w-full bg-surface border border-primary/10 rounded-lg px-3 py-2 text-sm text-primary outline-none resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 bg-primary text-background text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} حفظ
              </button>
              <button onClick={() => setEditing(null)} className="text-xs text-primary/50 px-3 py-2">إلغاء</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setEditing({ title: "", text: "" })} className="flex items-center gap-2 bg-primary text-background text-sm font-semibold px-4 py-2.5 rounded-xl mb-4">
            <Plus size={15} /> إضافة رد جديد
          </button>
        )}

        {loading ? (
          <p className="text-center text-sm text-primary/40 py-6">جاري التحميل...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-primary/40 py-6">مفيش ردود جاهزة لسه</p>
        ) : (
          <ul className="space-y-2">
            {items.map((r) => (
              <li key={r.id} className="bg-background rounded-xl p-3 flex items-start justify-between gap-2">
                <button onClick={() => onPick?.(r.text)} className="min-w-0 flex-1 text-right">
                  <p className="text-sm font-semibold text-primary">{r.title}</p>
                  <p className="text-xs text-primary/60 mt-1 line-clamp-2">{r.text}</p>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditing(r)} className="w-7 h-7 rounded-lg flex items-center justify-center text-primary/50 hover:bg-surface">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-surface">
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}