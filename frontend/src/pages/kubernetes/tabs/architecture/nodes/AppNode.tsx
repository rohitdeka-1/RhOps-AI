import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { IconBox, IconActivityHeartbeat } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

function AppNode({ data }: { data: any }) {
  const { label, status } = data;

  return (
    <div className="relative group min-w-[220px] bg-[#1a1b1e] border border-[#2e3036] rounded-xl shadow-lg hover:border-primary/50 cursor-pointer overflow-hidden text-white flex flex-col">
      <Handle type="target" position={Position.Left} className="w-1 h-1 opacity-0" />
      
      <div className="p-4 flex items-center gap-3">
        <div className="p-2 bg-[#2e3036] rounded-md text-gray-300">
          <IconBox className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate">{label}</h3>
          <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{data.kind}</p>
        </div>
      </div>

      <div className="px-4 pb-4 flex items-center gap-2">
        <span className={cn(
          "size-2 rounded-full",
          status === "Running" ? "bg-emerald-500" : status === "Pending" ? "bg-yellow-500" : "bg-red-500"
        )}></span>
        <span className="text-xs text-emerald-500 font-medium">Online</span>
      </div>

      <Handle type="source" position={Position.Right} className="w-1 h-1 opacity-0" />
    </div>
  );
}

export default memo(AppNode);
