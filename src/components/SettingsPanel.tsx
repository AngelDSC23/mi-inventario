import React, { useState } from "react";
import TagInput from "./TagInput";
import { Section, Field, FieldType } from "../types";

interface SettingsPanelProps {
  currentSection: Section;
  selectedFieldIndex: number | null;
  setSelectedFieldIndex: (index: number | null) => void;
  addField: (field: Field) => void;
  deleteField: () => void;
  moveField: (direction: "left" | "right") => void;
  updateField: (index: number, updates: Partial<Field>) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  currentSection,
  selectedFieldIndex,
  setSelectedFieldIndex,
  addField,
  deleteField,
  moveField,
  updateField,
}) => {
  const [pendingType, setPendingType] = useState<FieldType>("text"); // tipo a crear
  const selectedField =
    selectedFieldIndex !== null ? currentSection.fields[selectedFieldIndex] : null;

  const handleRename = (newName: string) => {
    if (selectedFieldIndex !== null) {
      updateField(selectedFieldIndex, { name: newName });
    }
  };

  const handleTypeToggle = (type: FieldType) => {
    if (selectedFieldIndex !== null) {
      updateField(selectedFieldIndex, { type });
    }
  };

  const handleAddField = (name: string) => {
    const newField: Field = {
      name,
      type: pendingType,
    };
    addField(newField);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">
        Configurar columnas de {currentSection.name}
      </h2>

      {/* Selector de tipo de campo a crear */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setPendingType("text")}
          className={`px-3 py-1 rounded border ${
            pendingType === "text"
              ? "bg-blue-600 border-blue-400 text-white"
              : "bg-gray-700 border-gray-600 text-gray-200"
          }`}
        >
          Texto
        </button>
        <button
          onClick={() => setPendingType("checkbox")}
          className={`px-3 py-1 rounded border ${
            pendingType === "checkbox"
              ? "bg-blue-600 border-blue-400 text-white"
              : "bg-gray-700 border-gray-600 text-gray-200"
          }`}
        >
          Checkbox
        </button>
      </div>

      {/* Añadir nueva columna */}
      <TagInput
        onAdd={handleAddField}
        placeholder="Nueva columna"
      />

      {/* Lista horizontal de etiquetas */}
      <div className="flex gap-2 flex-wrap">
        {currentSection.fields.map((f, i) => (
          <button
            key={i}
            onClick={() =>
              setSelectedFieldIndex(selectedFieldIndex === i ? null : i)
            }
            className={`p-2 rounded border ${
              selectedFieldIndex === i
                ? "bg-blue-600 border-blue-400"
                : "bg-gray-700 border-gray-600"
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* Panel de edición de la etiqueta seleccionada */}
      {selectedField && selectedFieldIndex !== null && (
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-3">
          <input
            value={selectedField.name}
            onChange={(e) => handleRename(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleTypeToggle("text")}
              className={`px-3 py-1 rounded border ${
                selectedField.type === "text"
                  ? "bg-blue-600 border-blue-400 text-white"
                  : "bg-gray-700 border-gray-600 text-gray-200"
              }`}
            >
              Texto
            </button>
            <button
              onClick={() => handleTypeToggle("checkbox")}
              className={`px-3 py-1 rounded border ${
                selectedField.type === "checkbox"
                  ? "bg-blue-600 border-blue-400 text-white"
                  : "bg-gray-700 border-gray-600 text-gray-200"
              }`}
            >
              Checkbox
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => moveField("left")}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            >
              ◀️
            </button>
            <button
              onClick={() => moveField("right")}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            >
              ▶️
            </button>
            <button
              onClick={deleteField}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
            >
              🗑 Eliminar columna
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
