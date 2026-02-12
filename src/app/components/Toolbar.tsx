import React from 'react';
import { Square, DoorOpen, Maximize2, Camera, MousePointer2, Hand, Trash2, RotateCw, Minus, Pencil } from 'lucide-react';
import type { Tool, FloorPlanElement } from '../types/floorplan';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { SaveLoadPanel } from './SaveLoadPanel';

interface ToolbarProps {
  selectedTool: Tool;
  onToolChange: (tool: Tool) => void;
  onClear: () => void;
  onRotateSelected: () => void;
  hasElements: boolean;
  elements: FloorPlanElement[];
  onLoadElements: (elements: FloorPlanElement[]) => void;
}

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
      <div className="flex items-center gap-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onToolChange(tool.id)}
              className={`relative ${selectedTool === tool.id
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              title={`${tool.label} (${tool.shortcut})`}
            >
              <Icon className="h-4 w-4" />
              <span className="ml-2">{tool.label}</span>
              <span className="ml-2 text-xs opacity-60">{tool.shortcut}</span>
            </Button>
          );
        })}
      </div>

      <Separator orientation="vertical" className="h-8 bg-slate-700" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRotateSelected}
          className="text-slate-300 hover:text-white hover:bg-slate-800"
          title="Rotate Selected (R)"
        >
          <RotateCw className="h-4 w-4" />
          <span className="ml-2">Rotate</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={!hasElements}
          className="text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-50"
          title="Clear All"
        >
          <Trash2 className="h-4 w-4" />
          <span className="ml-2">Clear</span>
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="px-2 py-1 bg-slate-800 rounded border border-slate-700">
            <span className="text-slate-500">Tip:</span> Hold Alt + Drag to pan
          </div>
          <div className="px-2 py-1 bg-slate-800 rounded border border-slate-700">
            <span className="text-slate-500">Delete:</span> Select + Backspace
          </div>
        </div>
      </div>

      <SaveLoadPanel elements={elements} onLoadElements={onLoadElements} />
    </div>
  );
}