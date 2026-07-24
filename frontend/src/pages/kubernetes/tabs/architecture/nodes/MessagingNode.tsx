import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { IconMessageCircle2 } from '@tabler/icons-react';

import { cn } from '@/lib/utils';

function MessagingNode({ data }: { data: any }) {
  const { label, engine, status = "Running" } = data; // engine = 'kafka' | 'rabbitmq' | 'nats'

  const isRunning = status === "Running" || status === "Active" || status === "Online";
  const isWarning = status === "Warning" || status === "Pending";

  const dotColor = isRunning ? "bg-emerald-500" : isWarning ? "bg-yellow-500" : "bg-red-500";
  const textColor = isRunning ? "text-emerald-500" : isWarning ? "text-yellow-500" : "text-red-500";
  const displayText = status === "Running" ? "Online" : status;

  return (
    <div className="relative group min-w-[220px] bg-[#1a1b1e] border border-[#2e3036] rounded-xl shadow-lg hover:border-primary/50 cursor-pointer overflow-hidden text-white flex flex-col">
      <Handle type="target" position={Position.Left} className="w-1 h-1 opacity-0" />
      
      <div className="p-4 flex items-center gap-3">
        <div className="p-2 bg-[#2e3036] rounded-md text-purple-400">
          <IconMessageCircle2 className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate">{label}</h3>
          {engine && <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{engine}</p>}
        </div>
      </div>

      <div className="px-4 pb-4 flex items-center gap-2">
        <span className={cn("size-2 rounded-full", dotColor)}></span>
        <span className={cn("text-xs font-medium", textColor)}>{displayText}</span>
      </div>

      <Handle type="source" position={Position.Right} className="w-1 h-1 opacity-0" />
    </div>
  );
}

export default memo(MessagingNode);
