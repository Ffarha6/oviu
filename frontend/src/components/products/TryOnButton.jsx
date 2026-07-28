import { useNavigate } from "react-router-dom";

/**
 * TryOnButton — ضعه في أي مكان في الموقع
 *
 * Props:
 *  glassId  : number | null   — لو عند نظارة → يبعت ?glass=ID في الـ URL
 *  variant  : "primary" | "outline" | "icon"
 *  size     : "sm" | "md" | "lg"
 *  label    : string (اختياري)
 *  style    : object (اختياري)
 */
export default function TryOnButton({ glassId = null, variant = "primary", size = "md", label, style = {} }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(glassId ? `/virtual-tryon?glass=${glassId}` : "/virtual-tryon");
  };

  const sizes = {
    sm: { padding: "6px 14px",  fontSize: 12, gap: 5, icon: 14 },
    md: { padding: "9px 20px",  fontSize: 13, gap: 7, icon: 16 },
    lg: { padding: "12px 28px", fontSize: 15, gap: 8, icon: 18 },
  };

  const s = sizes[size] || sizes.md;

  const base = {
    display: "inline-flex", alignItems: "center", gap: s.gap,
    padding: s.padding, fontSize: s.fontSize, fontWeight: 600,
    fontFamily: "'Cairo', sans-serif", borderRadius: 10,
    cursor: "pointer", transition: "all .2s",
    border: "1.5px solid #E8821A", ...style,
  };

  const variants = {
    primary: { background: "#E8821A", color: "#fff" },
    outline: { background: "#fff",    color: "#E8821A" },
    icon:    { background: "transparent", color: "#E8821A", border: "none", padding: "4px" },
  };

  return (
    <button style={{ ...base, ...variants[variant] }} onClick={handleClick}>
      <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.5" cy="13" r="4.5" />
        <circle cx="16.5" cy="13" r="4.5" />
        <path d="M12 13 L12 10" /><path d="M7.5 7 L16.5 7" />
        <path d="M3 10.5 Q3 7 7.5 7" /><path d="M21 10.5 Q21 7 16.5 7" />
      </svg>
      {variant !== "icon" && (label || (glassId ? "جرب الآن" : "تجربة افتراضية"))}
    </button>
  );
}

// ================================================================
// أمثلة الاستخدام:
// ================================================================
//
// 1. في ProductCard (عند كل نظارة):
//    <TryOnButton glassId={product.id} variant="outline" size="sm" />
//
// 2. في ProductDetail (زرار كبير):
//    <TryOnButton glassId={product.id} variant="primary" size="lg" label="جرب هذه النظارة" />
//
// 3. في Navbar أو Hero:
//    <TryOnButton variant="outline" size="md" />
//
// 4. Icon فقط في الكارد:
//    <TryOnButton glassId={product.id} variant="icon" />