export default function Spinner({ size = 20 }) {
  return (
    <span
      className="inline-block rounded-full border-2 border-ink-300 border-t-ink-800 animate-spin align-middle"
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
}
