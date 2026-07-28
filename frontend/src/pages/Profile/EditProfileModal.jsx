import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { EGYPT_GOVERNORATES, GENDER_OPTIONS, authFetch } from "./ProfileConstants"

// حقل إدخال نصي بسيط — مستخدم هنا بس
function Field({ label, name, type = "text", value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-[#888] dark:text-gray-400">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#e8e0d5] dark:border-gray-600 text-base outline-none transition-colors bg-white dark:bg-gray-700 text-[#222] dark:text-gray-100 focus:border-[#E8821A]"
        style={{ fontFamily: "'Cairo',sans-serif" }}
      />
    </div>
  )
}

// قائمة منسدلة — مستخدمة هنا بس
function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-[#888] dark:text-gray-400">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#e8e0d5] dark:border-gray-600 text-base outline-none cursor-pointer bg-white dark:bg-gray-700 focus:border-[#E8821A]
          ${value ? "text-[#222] dark:text-gray-100" : "text-[#aaa] dark:text-gray-500"}
        `}
        style={{ fontFamily: "'Cairo',sans-serif" }}
      >
        <option value="">اختر {label}</option>
        {options.map(opt => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function EditProfileModal({ user, onClose, onSave }) {
  const { refreshUser } = useAuth()
  const [form, setForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    phone: user.phone || "",
    date_of_birth: user.date_of_birth || "",
    governorate: user.governorate || "",
    gender: user.gender || "",
    address: user.address || "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      const res = await authFetch("/api/auth/profile/", {
        method: "PATCH",
        body: JSON.stringify(form),
      })
      if (res.ok) {
        onSave(form)
        await refreshUser()
        onClose()
      } else {
        let detail = `فشل الحفظ (كود ${res.status})`
        try {
          const data = await res.json()
          detail = data?.detail || data?.error || JSON.stringify(data)
        } catch {
          // مفيش body قابل للقراءة كـ JSON
        }
        console.error("Profile save error:", detail)
        setError(detail)
      }
    } catch (err) {
      console.error("Profile save network error:", err)
      setError("تعذر الاتصال بالسيرفر، تحقق من الإنترنت أو من عنوان الـ API")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div
        className="bg-white dark:bg-black rounded-2xl p-8 w-full max-w-[480px]"
        style={{ fontFamily: "'Cairo',sans-serif", direction: "rtl" }}
      >
        <h3 className="mb-6 mt-0 text-xl font-bold text-[#222] dark:text-gray-100">تعديل الملف الشخصي</h3>

        {error && (
          <div className="bg-[#fdecea] dark:bg-[#3a1a1a] border border-[#f5c2c0] dark:border-[#5c2626] text-[#c0392b] dark:text-[#f87171] rounded-lg px-3.5 py-2.5 text-[15px] mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Field label="الاسم الأول" name="first_name" value={form.first_name} onChange={handleFieldChange} />
          <Field label="الاسم الأخير" name="last_name" value={form.last_name} onChange={handleFieldChange} />
          <Field label="رقم الهاتف" name="phone" value={form.phone} onChange={handleFieldChange} />
          <Field label="تاريخ الميلاد" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleFieldChange} />
          <SelectField
            label="المحافظة"
            name="governorate"
            value={form.governorate}
            onChange={handleFieldChange}
            options={EGYPT_GOVERNORATES}
          />
          <SelectField
            label="الجنس"
            name="gender"
            value={form.gender}
            onChange={handleFieldChange}
            options={GENDER_OPTIONS}
          />
          <div className="flex flex-col gap-1.5" style={{ gridColumn: "1 / -1" }}>
            <label className="text-sm text-[#888] dark:text-gray-400">العنوان بالتفصيل</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleFieldChange}
              rows={3}
              placeholder="اسم الشارع، رقم المبنى، الشقة، المعلم القريب"
              className="px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#e8e0d5] dark:border-gray-600 text-base outline-none resize-none bg-white dark:bg-gray-700 text-[#222] dark:text-gray-100 focus:border-[#E8821A]"
              style={{ fontFamily: "'Cairo',sans-serif" }}
            />
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-[11px] bg-[#E8821A] text-white border-none rounded-[10px] text-base font-bold cursor-pointer"
            style={{ fontFamily: "'Cairo',sans-serif" }}
          >
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-[11px] bg-[#f5f5f5] dark:bg-gray-700 text-[#555] dark:text-gray-300 border-none rounded-[10px] text-base font-semibold cursor-pointer"
            style={{ fontFamily: "'Cairo',sans-serif" }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}