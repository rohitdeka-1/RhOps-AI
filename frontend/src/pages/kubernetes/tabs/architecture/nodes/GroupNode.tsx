import { memo } from 'react';

function GroupNode({ data }: { data: any }) {
  const { label } = data;

  return (
    <div className="relative w-full h-full border border-dashed border-border bg-muted/5 rounded-xl pointer-events-none">
      <div className="absolute -top-3 left-4 bg-background px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Namespace: {label}
      </div>
    </div>
  );
}

export default memo(GroupNode);
