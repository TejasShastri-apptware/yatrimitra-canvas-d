import React, { useState } from 'react';
import { Download, Upload, Save, FolderOpen } from 'lucide-react';
import { Button } from './ui/button';
import type { FloorPlanElement } from '../types/floorplan';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SaveLoadPanelProps {
  elements: FloorPlanElement[];
  onLoadElements: (elements: FloorPlanElement[]) => void;
}

interface SavedDiagram {
  name: string;
  date: string;
  elements: FloorPlanElement[];
}

export function SaveLoadPanel({ elements, onLoadElements }: SaveLoadPanelProps) {
  const [diagramName, setDiagramName] = useState('');
  const [savedDiagrams, setSavedDiagrams] = useState<SavedDiagram[]>(() => {
    const saved = localStorage.getItem('floorplan_diagrams');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOpenSave, setIsOpenSave] = useState(false);
  const [isOpenLoad, setIsOpenLoad] = useState(false);

  const handleSaveToBrowser = () => {
    if (!diagramName.trim()) {
      alert('Please enter a name for your diagram');
      return;
    }

    const newDiagram: SavedDiagram = {
      name: diagramName.trim(),
      date: new Date().toISOString(),
      elements: elements,
    };

    const updated = [...savedDiagrams, newDiagram];
    setSavedDiagrams(updated);
    localStorage.setItem('floorplan_diagrams', JSON.stringify(updated));
    setDiagramName('');
    setIsOpenSave(false);
  };

  const handleLoadFromBrowser = (diagram: SavedDiagram) => {
    if (window.confirm(`Load "${diagram.name}"? Current work will be replaced.`)) {
      onLoadElements(diagram.elements);
      setIsOpenLoad(false);
    }
  };

  const handleDeleteDiagram = (index: number) => {
    if (window.confirm('Delete this saved diagram?')) {
      const updated = savedDiagrams.filter((_, i) => i !== index);
      setSavedDiagrams(updated);
      localStorage.setItem('floorplan_diagrams', JSON.stringify(updated));
    }
  };

  const handleExportToFile = () => {
    const dataStr = JSON.stringify(
      {
        version: '1.0',
        created: new Date().toISOString(),
        elements: elements,
      },
      null,
      2
    );
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `floorplan-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.elements && Array.isArray(data.elements)) {
          if (window.confirm('Import this diagram? Current work will be replaced.')) {
            onLoadElements(data.elements);
          }
        } else {
          alert('Invalid file format');
        }
      } catch (error) {
        alert('Error reading file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <>
      <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      variant="ghost"
      size="sm"
      className="h-10 text-slate-300 hover:text-white hover:bg-slate-800"
    >
      <FolderOpen className="h-4 w-4" />
      <span className="ml-2">File</span>
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent className="w-48">
    <DropdownMenuLabel>File</DropdownMenuLabel>

    <DropdownMenuItem onSelect={() => setIsOpenSave(true)}>
      <Save className="h-4 w-4" />
      <span className="ml-2">Save to Browser</span>
    </DropdownMenuItem>

    <DropdownMenuItem onSelect={() => setIsOpenLoad(true)}>
      <FolderOpen className="h-4 w-4" />
      <span className="ml-2">Load from Browser</span>
    </DropdownMenuItem>

    <DropdownMenuSeparator />

    <DropdownMenuItem
      onSelect={handleExportToFile}
      disabled={elements.length === 0}
    >
      <Download className="h-4 w-4" />
      <span className="ml-2">Download Diagram</span>
    </DropdownMenuItem>

    <DropdownMenuItem
      onSelect={() =>
        document.getElementById("file-import-input")?.click()
      }
    >
      <Upload className="h-4 w-4" />
      <span className="ml-2">Import Diagram</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>



      {/* Hidden File Input */}
      <input
        id="file-import-input"
        type="file"
        accept=".json"
        onChange={handleImportFromFile}
        className="hidden"
      />

      {/* Keep Dialogs Below */}
      <Dialog open={isOpenSave} onOpenChange={setIsOpenSave}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          ...
        </DialogContent>
      </Dialog>

      <Dialog open={isOpenLoad} onOpenChange={setIsOpenLoad}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          ...
        </DialogContent>
      </Dialog>
    </>
  );

}