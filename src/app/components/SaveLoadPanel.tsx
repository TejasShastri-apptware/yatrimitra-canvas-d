import React, { useState } from 'react';
import { Download, Upload, Save, FolderOpen } from 'lucide-react';
import { Button } from './ui/button';
import type { FloorPlanElement } from '../types/floorplan';
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
    <div className="flex items-center gap-2">
      {/* Save to Browser */}
      <Dialog open={isOpenSave} onOpenChange={setIsOpenSave}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-800"
            title="Save to Browser"
          >
            <Save className="h-4 w-4" />
            <span className="ml-2">Save</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Save Diagram</DialogTitle>
            <DialogDescription className="text-slate-400">
              Save your floor plan to browser storage
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-300">Diagram Name</Label>
              <Input
                value={diagramName}
                onChange={(e) => setDiagramName(e.target.value)}
                placeholder="e.g., Office Layout"
                className="bg-slate-800 border-slate-700 text-white mt-2"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveToBrowser()}
              />
            </div>
            <Button
              onClick={handleSaveToBrowser}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!diagramName.trim()}
            >
              Save to Browser
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load from Browser */}
      <Dialog open={isOpenLoad} onOpenChange={setIsOpenLoad}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-800"
            title="Load from Browser"
          >
            <FolderOpen className="h-4 w-4" />
            <span className="ml-2">Load</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Load Diagram</DialogTitle>
            <DialogDescription className="text-slate-400">
              Load a previously saved diagram
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-96 overflow-y-auto">
            {savedDiagrams.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No saved diagrams</p>
            ) : (
              savedDiagrams.map((diagram, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-800 rounded border border-slate-700 hover:border-slate-600"
                >
                  <div className="flex-1">
                    <p className="text-white">{diagram.name}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(diagram.date).toLocaleString()} • {diagram.elements.length} elements
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleLoadFromBrowser(diagram)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteDiagram(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Export to File */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExportToFile}
        disabled={elements.length === 0}
        className="text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-50"
        title="Export to JSON file"
      >
        <Download className="h-4 w-4" />
        <span className="ml-2">Export</span>
      </Button>

      {/* Import from File */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-300 hover:text-white hover:bg-slate-800"
          title="Import from JSON file"
          onClick={() => document.getElementById('file-import-input')?.click()}
        >
          <Upload className="h-4 w-4" />
          <span className="ml-2">Import</span>
        </Button>
        <input
          id="file-import-input"
          type="file"
          accept=".json"
          onChange={handleImportFromFile}
          className="hidden"
        />
      </div>
    </div>
  );
}