import React from "react";
import { Section } from "../types";
import TagInput from "./TagInput";

interface SectionEditorModalProps {
  sections: Section[];
  addSection: (name: string) => void;
  deleteSection: (index: number) => void;
  onClose: () => void;
}

const SectionEditorModal: React.FC<SectionEditorModalProps> = ({
  sections,
  addSection,
  deleteSection,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-2">Editar apartados</h2>
        <TagInput onAdd={addSection} placeholder="Nuevo apartado" />
        <div className="mt-4 space-y-2">
          {sections.map((sec, idx) => (
            <div
              key={sec.name}
              className="flex justify-between items-center bg-gray-700 p-2 rounded"
            >
              <span>{sec.name}</span>
              <button
                onClick={() => deleteSection(idx)}
                className="p-1 bg-red-600 rounded hover:bg-red-700"
              >
                🗑
              </button>
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
