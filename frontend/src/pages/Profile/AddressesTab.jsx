import { useTranslation } from "react-i18next"
import { FaHome, FaCheckCircle, FaPlus, FaTrash } from "react-icons/fa"

// كارت العنوان المحفوظ — مستخدم هنا بس
function AddressCard({ addr, onEdit, onDelete, t }) {
  const addressText = [addr.governorate, addr.address].filter(Boolean).join(" - ")

  return (
    <div className="bg-white dark:bg-black rounded-2xl border border-[#f0f0f0] dark:border-gray-700 px-4 sm:px-5 py-4 sm:py-[18px] relative flex flex-col gap-2.5">
      {addr.is_default && (
        <span className="self-start bg-[#fff4ea] dark:bg-[#3a2410] text-[#E8821A] text-xs font-bold px-2.5 py-[3px] rounded-[20px] border border-[#fed7aa] dark:border-[#5c3d1a]">
          {t("addresses.default")}
        </span>
      )}

      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="mb-1.5 mt-0 text-[15px] sm:text-[17px] font-bold text-[#222] dark:text-gray-100">{addr.full_name}</p>
          <p className="m-0 text-[13.5px] sm:text-[14.5px] text-[#666] dark:text-gray-400 leading-[1.7]">{addressText}</p>
        </div>
        <div className="w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-[10px] bg-[#f8f8f8] dark:bg-gray-700 flex items-center justify-center shrink-0">
          <FaHome className="text-[#888] dark:text-gray-400 text-sm sm:text-[15px]" />
        </div>
      </div>

      {addr.phone && (
        <div className="flex items-center gap-2 text-[13px] sm:text-sm text-[#666] dark:text-gray-400 flex-wrap">
          <FaCheckCircle className="text-[#4caf50] text-xs shrink-0" />
          {addr.phone}
        </div>
      )}

      <div className="border-t border-[#f5f5f5] dark:border-gray-700 mt-0.5 pt-2.5 flex items-center justify-between">
        <button
          onClick={() => onEdit(addr)}
          className="bg-transparent border-none text-[#3b82f6] text-[13px] sm:text-sm font-semibold cursor-pointer p-0"
          style={{ fontFamily: "'Cairo',sans-serif" }}
        >
          {t("addresses.edit")}
        </button>
        <button
          onClick={() => onDelete(addr)}
          className="bg-transparent border-none text-[#e53935] text-[13px] sm:text-sm font-semibold cursor-pointer p-0 flex items-center gap-1.5"
          style={{ fontFamily: "'Cairo',sans-serif" }}
        >
          <FaTrash className="text-xs" /> {t("addresses.delete")}
        </button>
      </div>
    </div>
  )
}

export default function AddressesTab({ addresses, onEdit, onAdd, onDelete }) {
  const { t } = useTranslation()
  const hasAddresses = addresses.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="m-0 text-xl sm:text-[22px] font-bold text-[#222] dark:text-gray-100">{t("addresses.title")}</h2>
        <p className="mt-1 mb-0 text-sm sm:text-[15px] text-[#aaa] dark:text-gray-500">{t("addresses.subtitle")}</p>
      </div>

      {!hasAddresses ? (
        <div className="bg-white dark:bg-black rounded-2xl border border-[#f0f0f0] dark:border-gray-700 text-center py-8 sm:py-9">
          <p className="text-[#bbb] dark:text-gray-500 text-[15px] sm:text-base m-0">{t("addresses.none")}</p>
        </div>
      ) : (
        // ✅ FIX: دلوقتي بتعرض كل العناوين المحفوظة (مش عنوان واحد بس)، كل
        // عنوان جديد بيتضاف جنب اللي قبله من غير ما يمسح أي حاجة
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {addresses.map(addr => (
            <AddressCard
              key={addr.id}
              addr={addr}
              onEdit={onEdit}
              onDelete={onDelete}
              t={t}
            />
          ))}
        </div>
      )}

      <button
        onClick={onAdd}
        className="w-full sm:w-auto border-[1.5px] border-dashed border-[#e0e0e0] dark:border-gray-600 rounded-[14px] bg-white dark:bg-transparent text-[#E8821A] text-[15px] sm:text-base font-semibold cursor-pointer flex items-center justify-center gap-2 py-3.5 sm:py-[14px] sm:max-w-[280px]"
        style={{ fontFamily: "'Cairo',sans-serif" }}
      >
        <FaPlus /> {t("addresses.add")}
      </button>
    </div>
  )
}