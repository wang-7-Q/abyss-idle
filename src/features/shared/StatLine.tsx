interface StatLineProps {
  label: string;
  value: string | number;
}

export function StatLine({ label, value }: StatLineProps) {
  return (
    <div className="stat-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
