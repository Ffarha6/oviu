import { useState } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { FaTimes } from "react-icons/fa"
import { PHONE_CODES, getGovernorates, getAreasByGovernorate, authFetch } from "./ProfileConstants"

// ✅ isNew: true = بيضيف عنوان جديد (POST) - initialData بتبقى null
// ✅ isNew: false = بيعدّل عنوان موجود (PATCH) - initialData لازم يجيب معاها addressId
export default function AddressModal({ initialData, isNew, addressId, onClose, onSaved }) {
  const { t, i18n } = useTranslation()
  const governorates = getGovernorates(t)

  const [form, setForm] = useState({
    fullName: initialData?.fullName || "",
    phoneCode: initialData?.phoneCode || "+20",
    phone: initialData?.phone || "",
    governorate: initialData?.governorate || "",
    // ملحوظة: الباك إند حاليًا مبيرجعش المنطقة كحقل منفصل (بيتم دمجها جوه نص العنوان
    // وقت إرسال الطلب بس، مش وقت الحفظ)، فلو بنعدّل عنوان قديم، حقل المنطقة هيبدأ فاضي
    // والمستخدم يقدر يختاره تاني. أي عنوان جديد هيتحفظ بيه المنطقة عادي.
    area: initialData?.area || "",
    address: initialData?.address || "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // المناطق بتتغيّر حسب المحافظة المختارة
  const areas = getAreasByGovernorate(form.governorate)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "governorate") {
      // لو المستخدم غيّر المحافظة، لازم نصفّر المنطقة عشان متفضلش منطقة من محافظة تانية
      setForm(f => ({ ...f, governorate: value, area: "" }))
      return
    }
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSave = async () => {
    if (!form.fullName || !form.phone || !form.governorate || !form.area || !form.address) {
      setError(t("addressModal.fillRequired"))
      return
    }
    setError("")

    const payload = {
      full_name: form.fullName,
      phone: `${form.phoneCode}${form.phone}`,
      governorate: form.governorate,
      // بنبعتها كحقل منفصل احتياطًا لو الباك إند بيدعمها؛ لو مش مدعومة هيتجاهلها من غير مشاكل
      area: form.area,
      address: form.address,
    }

    setSaving(true)
    try {
      // ✅ الفرق الأساسي: إضافة عنوان جديد بتبعت POST لـ /api/auth/addresses/
      // (endpoint بيضيف صف جديد في القائمة)، وتعديل عنوان موجود بيبعت PATCH
      // لنفس العنوان بالـ id بتاعه - العنوان القديم مبيتمسحش ولا يتستبدل خالص
      const url = isNew ? "/api/auth/addresses/" : `/api/auth/addresses/${addressId}/`
      const res = await authFetch(url, {
        method: isNew ? "POST" : "PATCH",
        body: JSON.stringify(payload),
      })
      const rawText = await res.text()
      let data = {}
      if (rawText) {
        try { data = JSON.parse(rawText) } catch { data = {} }
      }
      if (!res.ok) {
        const firstFieldError = Object.values(data || {})[0]
        const message = Array.isArray(firstFieldError) ? firstFieldError[0] : (data.detail || data.error)
        setError(message || t("addressModal.saveFailed"))
        return
      }

      // لو الباك إند رجّع المنطقة اعتمدنا عليها، ولو لأ بنستخدم اللي المستخدم اختاره دلوقتي
      // عشان الشاشة تفضل متزامنة فورًا من غير ما نستنى تحديث تاني
      onSaved({ ...data, area: data.area || form.area })
      onClose()
    } catch {
      setError(t("addressModal.connectionError"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-3 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-black rounded-[20px] sm:rounded-[24px] w-full max-w-[600px] max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6"
        style={{ fontFamily: "'Cairo',sans-serif", direction: i18n.dir() }}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h3 className="font-bold text-black dark:text-gray-100 text-base sm:text-lg">
            {isNew ? t("addressModal.addTitle") : t("addressModal.editTitle")}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition shrink-0"
          >
            <FaTimes className="text-black dark:text-gray-300 text-sm sm:text-base" />
          </button>
        </div>

        {error && (
          <div className="bg-[#fdecea] dark:bg-[#3a1a1a] border border-[#f5c2c0] dark:border-[#5c2626] text-[#c0392b] dark:text-[#f87171] rounded-lg px-3.5 py-2.5 text-sm sm:text-[15px] mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-4 text-right">
          <div>
            <label className="text-sm font-semibold text-black dark:text-gray-200 mb-1.5 block">{t("addressModal.fullName")}</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder={t("addressModal.fullNamePlaceholder")}
              autoComplete="off"
              className="w-full bg-[#F7F2EE] dark:bg-gray-700 border border-black/10 dark:border-gray-600 rounded-[12px] px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-black dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-[#E8821A] transition text-right"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-black dark:text-gray-200 mb-1.5 block">{t("addressModal.phone")}</label>
            <div className="flex gap-2">
              <select
                value={form.phoneCode}
                onChange={e => setForm(f => ({ ...f, phoneCode: e.target.value }))}
                className="bg-[#F7F2EE] dark:bg-gray-700 border border-black/10 dark:border-gray-600 rounded-[12px] px-2.5 sm:px-3 py-2.5 sm:py-3 text-sm text-black dark:text-gray-100 outline-none focus:border-[#E8821A] transition shrink-0"
              >
                {PHONE_CODES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="1xxxxxxxxx"
                autoComplete="off"
                className="flex-1 min-w-0 bg-[#F7F2EE] dark:bg-gray-700 border border-black/10 dark:border-gray-600 rounded-[12px] px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-black dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-[#E8821A] transition text-right"
              />
            </div>
          </div>
        </div>

        {/* المحافظة والمنطقة جنب بعض — المنطقة بتتفعّل بعد اختيار المحافظة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-4 text-right">
          <div>
            <label className="text-sm font-semibold text-black dark:text-gray-200 mb-1.5 block">{t("addressModal.governorate")}</label>
            <select
              name="governorate"
              value={form.governorate}
              onChange={handleChange}
              className="w-full bg-[#F7F2EE] dark:bg-gray-700 border border-black/10 dark:border-gray-600 rounded-[12px] px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-black dark:text-gray-100 outline-none focus:border-[#E8821A] transition text-right"
            >
              <option value="">{t("addressModal.chooseGovernorate")}</option>
              {governorates.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-black dark:text-gray-200 mb-1.5 block">
              {t("addressModal.area", { defaultValue: "المنطقة / المركز" })}
            </label>
            <select
              name="area"
              value={form.area}
              onChange={handleChange}
              disabled={!form.governorate}
              className="w-full bg-[#F7F2EE] dark:bg-gray-700 border border-black/10 dark:border-gray-600 rounded-[12px] px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-black dark:text-gray-100 outline-none focus:border-[#E8821A] transition text-right disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {form.governorate
                  ? t("addressModal.chooseArea", { defaultValue: "اختر المنطقة" })
                  : t("addressModal.chooseGovernorateFirst", { defaultValue: "اختاري المحافظة أولاً" })}
              </option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-5 sm:mb-6 text-right">
          <label className="text-sm font-semibold text-black dark:text-gray-200 mb-1.5 block">{t("addressModal.addressDetails")}</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            placeholder={t("addressModal.addressPlaceholder")}
            autoComplete="off"
            className="w-full bg-[#F7F2EE] dark:bg-gray-700 border border-black/10 dark:border-gray-600 rounded-[12px] px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-black dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-[#E8821A] transition resize-none text-right"
          />
        </div>

        <div className="flex gap-2.5 sm:gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 bg-[#E8821A] hover:bg-[#c96e10] text-white font-bold text-sm py-2.5 sm:py-3 rounded-full transition flex items-center justify-center gap-2 ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {saving ? t("addressModal.saving") : (isNew ? t("addressModal.addButton") : t("addressModal.saveButton"))}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 border border-black/10 dark:border-gray-600 text-black dark:text-gray-200 font-semibold text-sm py-2.5 sm:py-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            {t("addressModal.cancel")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}