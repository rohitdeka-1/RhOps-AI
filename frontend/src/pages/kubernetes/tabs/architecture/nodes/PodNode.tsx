import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { IconBox } from '@tabler/icons-react';

function PodNode({ data }: { data: any }) {
  const { label, status, restarts, isHealthy } = data;

  const healthColor = isHealthy === true ? 'bg-emerald-500' 
                    : isHealthy === false ? 'bg-red-500' 
                    : 'bg-yellow-500';

  return (
    <div className="relative flex items-center justify-between min-w-[150px] p-2 bg-card border border-border rounded-md shadow-sm hover:border-primary/50 transition-all cursor-pointer">
      <div className="flex items-center gap-2">
        <div className={`size-2 rounded-full ${healthColor}`}></div>
        <div className="truncate max-w-[90px]">
          <h3 className="text-[11px] font-medium text-foreground truncate">{label}</h3>
          <p className="text-[9px] text-muted-foreground">{status}</p>
        </div>
      </div>
      {restarts > 0 && (
        <div className="text-[9px] px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded-sm font-medium">
          {restarts} restarts
        </div>
      )}
    </div>
  );
}

export default memo(PodNode);
