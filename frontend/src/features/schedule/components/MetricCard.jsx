export default function MetricCard({ label, value, className = '' }) {
  return <article className="metric-card"><span>{label}</span><strong className={className}>{value}</strong></article>;
}
