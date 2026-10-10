export default function EmptyState({ icon, title, hint, action }) {
  return (
    <div className="text-center py-16 px-4">
      {icon && <div className="text-4xl mb-3">{icon}</div>}
      <h2 className="font-serif text-xl text-ink-800 mb-2">{title}</h2>
      {hint && <p className="text-ink-500 text-sm max-w-md mx-auto">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
