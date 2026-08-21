const STATUS_STYLES: Record<string, { bg: string; dot: string; label: string }> = {
  OPEN: { bg: 'bg-signal/10 text-signal', dot: 'bg-signal', label: 'Open' },
  MATCHED: { bg: 'bg-ink/10 text-ink', dot: 'bg-ink', label: 'Matched' },
  IN_PROGRESS: { bg: 'bg-ink/10 text-ink', dot: 'bg-ink', label: 'In progress' },
  COMPLETED: { bg: 'bg-fix/10 text-fix', dot: 'bg-fix', label: 'Completed' },
  CANCELLED: { bg: 'bg-line text-ink/50', dot: 'bg-ink/40', label: 'Cancelled' },
  PENDING: { bg: 'bg-signal/10 text-signal', dot: 'bg-signal', label: 'Payment pending' },
  PAID: { bg: 'bg-fix/10 text-fix', dot: 'bg-fix', label: 'Paid' },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || { bg: 'bg-line', dot: 'bg-ink/40', label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono font-medium ${style.bg}`}>
      <span className={`status-dot ${style.dot}`} />
      {style.label}
    </span>
  );
}
