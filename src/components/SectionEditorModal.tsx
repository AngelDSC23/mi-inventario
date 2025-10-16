import React, { useState } from "react";
import { Section } from "../types";
import TagInput from "./TagInput";

interface SectionEditorModalProps {
  sections: Section[];
  addSection: (name: string) => void;
  deleteSection: (index: number) => void;
  renameSection: (index: number, newName: string) => void;
  moveSection: (index: number, direction: "up" | "down") => void;
  onClose: () => void;
}

const SectionEditorModal: React.FC<SectionEditorModalProps> = ({
  sections,
  addSection,
  deleteSection,
  renameSection,
  moveSection,
  onClose,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newName, setNewName] = useState("");

  const startRename = (idx: number, currentName: string) => {
    setEditingIndex(idx);
    setNewName(currentName);
  };

  const confirmRename = () => {
    if (editingIndex !== null && newName.trim() !== "") {
      renameSection(editingIndex, newName.trim());
      setEditingIndex(null);
      setNewName("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-2">Editar apartados</h2>

        <TagInput onAdd={addSection} placeholder="Nuevo apartado" />

        <div className="mt-4 space-y-2">
          {sections.map((sec, idx) => (
            <div
              key={sec.name}
              className="flex justify-between items-center bg-gray-700 p-2 rounded"
            >
              {editingIndex === idx ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={confirmRename}
                  onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                  className="flex-1 p-1 rounded text-black"
                  autoFocus
                />
              ) : (
                <span
                  onDoubleClick={() => startRename(idx, sec.name)}
                  className="flex-1 cursor-pointer"
                >
                  {sec.name}
                </span>
              )}

              <div className="flex gap-1">
                <button
                  onClick={() => moveSection(idx, "up")}
                  disabled={idx === 0}
                  className="p-1 bg-gray-600 rounded hover:bg-gray-500 text-white disabled:opacity-50"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveSection(idx, "down")}
                  disabled={idx === sections.length - 1}
                  className="p-1 bg-gray-600 rounded hover:bg-gray-500 text-white disabled:opacity-50"
                >
                  ↓
                </button>
                <button
                  onClick={() => deleteSection(idx)}
                  className="p-1 bg-red-600 rounded hover:bg-red-700 text-white"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 p-2 rounded"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default SectionEditorModal;
