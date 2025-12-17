import { useRow } from "dnd-timeline";
import type { RowDefinition } from "dnd-timeline";

interface RowProps extends RowDefinition {
  children: React.ReactNode;
}

export default function Row({ id, children }: RowProps) {
  const { setNodeRef, rowWrapperStyle, rowStyle } = useRow({ id });

  return (
    <div
      className="border-b border-white/5 bg-white/[0.02] rounded-lg overflow-visible"
      style={{ ...rowWrapperStyle, height: 48, marginBottom: 4, position: 'relative' }}
    >
      <div ref={setNodeRef} style={{ ...rowStyle, padding: '4px 0', position: 'relative', height: '100%' }}>
        {children}
      </div>
    </div>
  );
}