import React from 'react';
import { Square, DoorOpen, Maximize2, Camera, MousePointer2, Hand, Trash2, RotateCw, Minus, Pencil, LucideIcon, MousePointer2Icon } from 'lucide-react';
import type { Tool, FloorPlanElement } from '../types/floorplan';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { SaveLoadPanel } from './SaveLoadPanel';


import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "./ui/dropdown-menu"



interface ToolbarProps {
  selectedTool: Tool;
  onToolChange: (tool: Tool) => void;
  onClear: () => void;
  onRotateSelected: () => void;
  hasElements: boolean;
  elements: FloorPlanElement[];
  onLoadElements: (elements: FloorPlanElement[]) => void;
}

type ToolSK = {
  id: Tool;
  icon: LucideIcon;
  label: string;
}
type ToolGroup = {
  label: string;
  tools: ToolSK[];
}

const toolgroup: ToolGroup[] = [
  {
    label: "Structure",
    tools: [
      { id: 'room' as Tool, icon: Square, label: 'Room' },
      { id: 'wall' as Tool, icon: Minus, label: 'Wall' }
    ]
  },
  {
    label: "Objects",
    tools: [
      { id: 'door' as Tool, icon: DoorOpen, label: 'Door' },
      { id: 'window' as Tool, icon: Maximize2, label: 'Window' },
      { id: 'camera' as Tool, icon: Camera, label: 'Camera' }
    ]
  }
]


export function Toolbar({ selectedTool, onToolChange, onClear, onRotateSelected, hasElements, elements, onLoadElements }: ToolbarProps) {
  const tools = [
    { id: 'select' as Tool, icon: MousePointer2, label: 'Select', shortcut: 'V' },
    { id: 'wall' as Tool, icon: Minus, label: 'Wall', shortcut: 'L' },
    { id: 'pencil' as Tool, icon: Pencil, label: 'Pencil', shortcut: 'P' },
    { id: 'room' as Tool, icon: Square, label: 'Room', shortcut: 'R' },
    { id: 'door' as Tool, icon: DoorOpen, label: 'Door', shortcut: 'D' },
    { id: 'window' as Tool, icon: Maximize2, label: 'Window', shortcut: 'W' },
    { id: 'camera' as Tool, icon: Camera, label: 'Camera', shortcut: 'C' },
    { id: 'pan' as Tool, icon: Hand, label: 'Pan', shortcut: 'H' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center gap-2">
      <div className='flex items-center gap-1'>
        <Button variant="ghost" size="sm" className='text-slate-300 hover:text-white hover:bg-slate-800' onSelect={() => onToolChange('select')}>
          <MousePointer2 className="h-4 w-4" />
          <span className="ml-2">Select</span>
        </Button>
      </div>

      <div className="flex items-center gap-1">
        {toolgroup.map((group) => (
          <DropdownMenu key={group.label}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                <span>{group.label}</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className='w-48'>
              <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
              {group.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <DropdownMenuItem key={tool.id} onSelect={() => onToolChange(tool.id)} className={selectedTool == tool.id ? 'bg-slate-800 text-white' : ""}>
                    <Icon className="h-4 w-4" />
                    <span className="ml-2">{tool.label}</span>
                  </DropdownMenuItem>
                )
              })}

            </DropdownMenuContent>

          </DropdownMenu>
        ))}
      </div>

      <Separator orientation="vertical" className="h-8 bg-slate-700" />

      <div className='flex items-center gap-1'>
        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800"
          onClick={() => onToolChange('pencil')}
        >
          <Pencil size={20} className="text-amber-100" />
          <span className="ml-2">Pencil</span>
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8 bg-slate-700" />

      <div className="flex items-center gap-1">
        {/* <Button
          variant="ghost"
          size="sm"
          onClick={onRotateSelected}
          className="text-slate-300 hover:text-white hover:bg-slate-800"
          title="Rotate Selected (R)"
        >
          <RotateCw className="h-4 w-4" />
          <span className="ml-2">Rotate</span>
        </Button> */}

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={!hasElements}
          className="group text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-50 transition-all duration-200"
          title="Clear All"
        >
          <Trash2
            className="
            h-5 w-5
            text-red-500
            transition-all duration-300 ease-out
            group-hover:scale-125
            group-hover:drop-shadow-[0_0_6px_rgba(255,0,0,0.6)]
          "
          />
          <span className="ml-2">Clear</span>
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8 bg-slate-700" />

      <SaveLoadPanel elements={elements} onLoadElements={onLoadElements} />
    </div>
  );
}