import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { IconWorld, IconNetwork } from '@tabler/icons-react';

function EntryNode({ data }: { data: any }) {
  const { label, type, host } = data; // type = 'Ingress' | 'LoadBalancer'

  return (
    <div className="relative group min-w-[220px] bg-[#1a1b1e] border border-[#2e3036] rounded-xl shadow-lg hover:border-primary/50 cursor-pointer overflow-hidden text-white flex flex-col">
      <Handle type="target" position={Position.Left} className="w-1 h-1 opacity-0" />
      
      <div className="p-4 flex items-center gap-3">
        <div className="p-2 bg-[#2e3036] rounded-md text-gray-300">
          {type === 'Ingress' ? <IconWorld className="size-5" /> : <IconNetwork className="size-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate">{label}</h3>
          {host && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{host}</p>}
        </div>
      </div>

      <div className="px-4 pb-4 flex items-center gap-2">
        <span className="size-2 rounded-full bg-emerald-500"></span>
        <span className="text-xs text-emerald-500 font-medium">Online</span>
      </div>

      <Handle type="source" position={Position.Right} className="w-1 h-1 opacity-0" />
    </div>
  );
}

export default memo(EntryNode);
