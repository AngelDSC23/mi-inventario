import React, { useState } from "react";
import { Entry, Section } from "./types";
import TableView from "./components/TableView";
import CardView from "./components/CardView";
import Sidebar from "./components/Sidebar";
import SettingsPanel from "./components/SettingsPanel";
import SectionEditorModal from "./components/SectionEditorModal";

const App: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([
    {
      name: "General",
      fields: [{ name: "Título", type: "text" }],
      entries: [],
    },
  ]);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [showSettings, setShowSettings] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempEntry, setTempEntry] = useState<Entry | null>(null);

  const currentSection = sections[currentSectionIndex];

  /** -----------------------------
   *   Gestión de secciones
   *  ----------------------------- */
  const addSection = (name: string) => {
    const newSection: Section = { name, fields: [], entries: [] };
    setSections((prev) => [...prev, newSection]);
  };

  const deleteSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
    if (currentSectionIndex >= index && currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const renameSection = (index: number, newName: string) => {
    setSections((prev) =>
      prev.map((sec, i) => (i === index ? { ...sec, name: newName } : sec))
    );
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    setSections((prev) => {
      const newSections = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= newSections.length) return prev;
      [newSections[index], newSections[target]] = [
        newSections[target],
        newSections[index],
      ];
      return newSections;
    });
  };

  /** -----------------------------
   *   Gestión de campos
   *  ----------------------------- */
  const addField = (field: { name: string; type: string }) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[currentSectionIndex].fields.push(field);
      return updated;
    });
  };

  const deleteField = () => {
    if (selectedFieldIndex === null) return;
    setSections((prev) => {
      const updated = [...prev];
      updated[currentSectionIndex].fields.splice(selectedFieldIndex, 1);
      return updated;
    });
    setSelectedFieldIndex(null);
  };

  const moveField = (direction: "left" | "right") => {
    if (selectedFieldIndex === null) return;
    setSections((prev) => {
      const updated = [...prev];
      const fields = [...updated[currentSectionIndex].fields];
      const target =
        direction === "left"
          ? selectedFieldIndex - 1
          : selectedFieldIndex + 1;
      if (target < 0 || target >= fields.length) return prev;
      [fields[selectedFieldIndex], fields[target]] = [
        fields[target],
        fields[selectedFieldIndex],
      ];
      updated[currentSectionIndex].fields = fields;
      return updated;
    });
    setSelectedFieldIndex(null);
  };

  const updateField = (index: number, updates: Partial<any>) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[currentSectionIndex].fields[index] = {
        ...updated[currentSectionIndex].fields[index],
        ...updates,
      };
      return updated;
    });
  };

  /** -----------------------------
   *   Gestión de entradas
   *  ----------------------------- */
  const handleAddEntry = () => {
    if (tempEntry) return; // evitar duplicados temporales
    const newEntry: Entry = Object.fromEntries(
      currentSection.fields.map((f) => [f.name, f.type === "checkbox" ? false : ""])
    );
    setTempEntry(newEntry);
    setEditingId(Date.now());
  };

  const handleConfirmEntry = (confirmedEntry: Entry) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[currentSectionIndex].entries.push(confirmedEntry);
      return updated;
    });
    setTempEntry(null);
    setEditingId(null);
  };

  const handleUpdateEntry = (index: number, fieldName: string, value: any) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[currentSectionIndex].entries[index][fieldName] = value;
      return updated;
    });
  };

  const handleDeleteEntry = (index: number) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[currentSectionIndex].entries.splice(index, 1);
      return updated;
    });
  };

  /** -----------------------------
   *   Render principal
   *  ----------------------------- */
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar
        sections={sections}
        currentSectionIndex={currentSectionIndex}
        setCurrentSectionIndex={setCurrentSectionIndex}
        onEditSections={() => setShowSectionEditor(true)}
        onToggleSettings={() => setShowSettings((p) => !p)}
      />

      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Barra superior */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">{currentSection.name}</h1>

          <div className="flex gap-2">
            <button
              onClick={() =>
                setViewMode((m) => (m === "table" ? "cards" : "table"))
              }
              className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
            >
              {viewMode === "table" ? "🔳 Vista tarjetas" : "📋 Vista tabla"}
            </button>

            <button
              onClick={() => setShowSettings((s) => !s)}
              className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
            >
              ⚙️ Ajustes
            </button>

            <button
              onClick={handleAddEntry}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
            >
              ➕ Añadir entrada
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === "table" ? (
            <TableView
              section={currentSection}
              editingId={editingId}
              tempEntry={tempEntry}
              onConfirmEntry={handleConfirmEntry}
              onUpdateEntry={handleUpdateEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          ) : (
            <CardView
              section={currentSection}
              editingId={editingId}
              tempEntry={tempEntry}
              onConfirmEntry={handleConfirmEntry}
              onUpdateEntry={handleUpdateEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          )}
        </div>
      </div>

      {/* Panel lateral de ajustes */}
      {showSettings && (
        <div className="w-80 bg-gray-850 p-4 border-l border-gray-700 overflow-y-auto">
          <SettingsPanel
            currentSection={currentSection}
            selectedFieldIndex={selectedFieldIndex}
            setSelectedFieldIndex={setSelectedFieldIndex}
            addField={addField}
            deleteField={deleteField}
            moveField={moveField}
            updateField={updateField}
          />
        </div>
      )}

      {/* Modal de edición de secciones */}
      {showSectionEditor && (
        <SectionEditorModal
          sections={sections}
          addSection={addSection}
          deleteSection={deleteSection}
          renameSection={renameSection}
          moveSection={moveSection}
          onClose={() => setShowSectionEditor(false)}
        />
      )}
    </div>
  );
};

export default App;
