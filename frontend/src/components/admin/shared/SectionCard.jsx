export default function SectionCard({ title, action, children, className = "" }) {
  return (
    <div className={`bg-surface rounded-2xl p-5 flex flex-col gap-4 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between">
          {title && <h3 className="text-sm font-bold text-primary">{title}</h3>}
          {action && (
            <button className="text-xs font-medium text-secondary hover:underline">
              {action}
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}