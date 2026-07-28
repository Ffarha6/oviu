import { Search, ChevronDown, RotateCcw } from "lucide-react";

const paymentOptions = [
  { value: "", label: "كل طرق الدفع" },
  { value: "cash", label: "عند الاستلام" },
  { value: "card", label: "بطاقة ائتمان" },
  { value: "wallet", label: "محفظة" },
];

const datePresets = [
  { value: "", label: "كل الفترات" },
  { value: "today", label: "اليوم" },
  { value: "week", label: "آخر أسبوع" },
  { value: "month", label: "آخر شهر" },
  { value: "custom", label: "فترة مخصصة" },
];

export default function OrdersToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  paymentMethod,
  onPaymentMethodChange,
  datePreset,
  onDatePresetChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onReset,
}) {
  const statuses = ["كل الحالات", "قيد الانتظار", "مؤكد", "قيد المعالجة", "تم الشحن", "تم التوصيل", "ملغي"];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] flex items-center gap-2 bg-background border border-primary/10 rounded-xl px-3.5 py-2.5">
          <Search size={16} className="text-primary/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحثي عن طلب، عميل، أو رقم هاتف..."
            className="bg-transparent outline-none text-sm flex-1 text-primary placeholder:text-primary/40"
          />
        </div>

        <SelectField value={status} onChange={onStatusChange} options={statuses.map((s) => ({ value: s, label: s }))} />
        <SelectField value={paymentMethod} onChange={onPaymentMethodChange} options={paymentOptions} />
        <SelectField value={datePreset} onChange={onDatePresetChange} options={datePresets} />

        <button onClick={onReset} className="flex items-center gap-2 text-sm text-primary/50 px-3 py-2.5 hover:text-primary transition">
          <RotateCcw size={14} />
          إعادة تعيين
        </button>
      </div>

      {datePreset === "custom" && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-primary/60">
            من
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="bg-background border border-primary/10 rounded-lg px-3 py-2 text-sm text-primary outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-primary/60">
            إلى
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="bg-background border border-primary/10 rounded-lg px-3 py-2 text-sm text-primary outline-none"
            />
          </label>
        </div>
      )}
    </div>
  );
}

function SelectField({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-background border border-primary/10 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-primary/70 min-w-[140px] cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="text-primary/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}