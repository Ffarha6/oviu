import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Save, Ban, PlayCircle } from "lucide-react";
import api from "../../../api/axios";

export default function KnowledgeBasePanel({ onClose }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchFaqs = () => {
    setLoading(true);
    api.get("/dashboard/chatbot/faqs/")
      .then((res) => setFaqs(res.data))
      .catch((err) => console.error("فشل تحميل الأسئلة الشائعة:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFaqs(); }, []);

  const handleSave = async () => {
    if (!editing.question?.trim() || !editing.answer?.trim()) return;
    setSaving(true);
    try {
      if (editing.id) {
        await api.patch(`/dashboard/chatbot/faqs/${editing.id}/`, { question: editing.question, answer: editing.answer });
      } else {
        await api.post("/dashboard/chatbot/faqs/", { question: editing.question, answer: editing.answer });
      }
      setEditing(null);
      fetchFaqs();
    } catch (err) {
      alert("حصل خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (faq) => {
    try {
      await api.patch(`/dashboard/chatbot/faqs/${faq.id}/`, { is_active: !faq.is_active });
      fetchFaqs();
    } catch (err) {
      alert("حصل خطأ");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنتِ متأكدة من حذف هذا السؤال؟")) return;
    try {
      await api.delete(`/dashboard/chatbot/faqs/${id}/`);
      fetchFaqs();
    } catch (err) {
      alert("حصل خطأ أثناء الحذف");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl p-5 w-full max-w-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-primary">قاعدة المعرفة (الأسئلة الشائعة)</h3>
          <button onClick={onClose} className="text-primary/40 hover:text-primary"><X size={18} /></button>
        </div>

        {editing ? (
          <div className="space-y-3 mb-4 bg-background rounded-xl p-4">
            <div>
              <label className="block text-xs font-medium text-primary/60 mb-1">السؤال</label>
              <input
                type="text"
                value={editing.question || ""}
                onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                className="w-full bg-surface border border-primary/10 rounded-lg px-3 py-2 text-sm text-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary/60 mb-1">الإجابة</label>
              <textarea
                value={editing.answer || ""}
                onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                rows={3}
                className="w-full bg-surface border border-primary/10 rounded-lg px-3 py-2 text-sm text-primary outline-none resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 bg-primary text-background text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} حفظ
              </button>
              <button onClick={() => setEditing(null)} className="text-xs text-primary/50 px-3 py-2">إلغاء</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditing({ question: "", answer: "" })}
            className="flex items-center gap-2 bg-primary text-background text-sm font-semibold px-4 py-2.5 rounded-xl mb-4"
          >
            <Plus size={15} /> إضافة سؤال جديد
          </button>
        )}

        {loading ? (
          <p className="text-center text-sm text-primary/40 py-6">جاري التحميل...</p>
        ) : faqs.length === 0 ? (
          <p className="text-center text-sm text-primary/40 py-6">مفيش أسئلة مضافة لسه</p>
        ) : (
          <ul className="space-y-2">
            {faqs.map((f) => (
              <li key={f.id} className={`bg-background rounded-xl p-3 ${!f.is_active ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-primary">{f.question}</p>
                    <p className="text-xs text-primary/60 mt-1">{f.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleToggleActive(f)} className="w-7 h-7 rounded-lg flex items-center justify-center text-primary/50 hover:bg-surface" title={f.is_active ? "إيقاف" : "تفعيل"}>
                      {f.is_active ? <Ban size={13} /> : <PlayCircle size={13} />}
                    </button>
                    <button onClick={() => setEditing(f)} className="w-7 h-7 rounded-lg flex items-center justify-center text-primary/50 hover:bg-surface">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(f.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-surface">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}