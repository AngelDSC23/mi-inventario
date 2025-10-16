import React, { useState } from "react";
import { Entry, Section, Field } from "./types";
import Sidebar from "./components/Sidebar";
import TableView from "./components/TableView";
import CardView from "./components/CardView";
import SettingsPanel from "./components/SettingsPanel";
import SectionEditorModal from "./components/SectionEditorModal";

const App: React.FC = () => {
  /** -----------------------------
   *   ESTADO PRINCIPAL
   *  ----------------------------- */
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

  // Estados para manejo de entradas
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempEntry, setTempEntry] = useState<Entry | null>(null);

  const currentSection = sections[currentSectionIndex];

  /** -----------------------------
   *   SECCIONES
   *  ----------------------------- */
  const addSection = (name: string) => {
    if (!name.trim()) return;
    setSections((prev) => [...prev, { name, fields: [], entries: [] }]);
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
      const updated = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= updated.length) return prev;
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return updated;
    });
  };

  /** -----------------------------
   *   CAMPOS (FIELDS)
   *  ----------------------------- */
  const addField = (field: Field) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[currentSectionIndex] = {
        ...updated[currentSectionIndex],
        fields: [...updated[currentSectionIndex].fields, field],
      };
      return updated;
    });
  };

  const deleteField = () => {
    if (selectedFieldIndex === null) return;
    setSections((prev) => {
      const updated = [...prev];
      const fields = [...updated[currentSectionIndex].fields];
      fields.splice(selectedFieldIndex, 1);
      updated[currentSectionIndex] = { ...updated[currentSectionIndex], fields };
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
      updated[currentSectionIndex] = { ...updated[currentSectionIndex], fields };
      return updated;
    });
  };

  const updateField = (index: number, updates: Partial<Field>) => {
    setSections((prev) => {
      const updated = [...prev];
      const section = updated[currentSectionIndex];
      const fields = [...section.fields];
      fields[index] = { ...fields[index], ...updates };
      updated[currentSectionIndex] = { ...section, fields };
      return updated;
    });
  };

  /** -----------------------------
   *   ENTRADAS (ENTRIES)
   *  ----------------------------- */
  const handleAddEntry = () => {
    if (tempEntry) return; // evitar múltiples temporales
    const newEntry: Entry = Object.fromEntries(
      currentSection.fields.map((f) => [f.name, f.type === "checkbox" ? false : ""])
    );
    setTempEntry(newEntry);
    setEditingId(Date.now());
  };

  const handleConfirmEntry = (confirmed: Entry) => {
    setSections((prev) => {
      const updated = [...prev];
      const entries = [...updated[currentSectionIndex].entries, confirmed];
      updated[currentSectionIndex] = { ...updated[currentSectionIndex], entries };
      return updated;
    });
    setTempEntry(null);
    setEditingId(null);
  };

  const handleUpdateEntry = (index: number, field: string, value: any) => {
    setSections((prev) => {
      const updated = [...prev];
      const entries = [...updated[currentSectionIndex].entries];
      entries[index] = { ...entries[index], [field]: value };
      updated[currentSectionIndex] = { ...updated[currentSectionIndex], entries };
      return updated;
    });
  };

  const handleDeleteEntry = (index: number) => {
    setSections((prev) => {
      const updated = [...prev];
      const entries = updated[currentSectionIndex].entries.filter(
        (_, i) => i !== index
      );
      updated[currentSectionIndex] = { ...updated[currentSectionIndex], entries };
      return updated;
    });
  };

  /** -----------------------------
   *   RENDER
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
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">{currentSection.name}</h1>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setViewMode(viewMode === "table" ? "cards" : "table")
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

        {/* Vista principal */}
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

      {/* Panel lateral de configuración */}
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
