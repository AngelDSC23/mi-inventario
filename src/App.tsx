import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import TableView from "./components/TableView";
import CardView from "./components/CardView";
import SettingsPanel from "./components/SettingsPanel";
import SectionEditorModal from "./components/SectionEditorModal";

export interface Entry {
  id: number;
  [key: string]: string | boolean | number;
}

export interface Field {
  name: string;
  type: "text" | "checkbox";
}

export interface Section {
  name: string;
  fields: Field[];
  entries: Entry[];
}

const App: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([
    {
      name: "General",
      fields: [
        { name: "título", type: "text" },
        { name: "digital", type: "checkbox" },
        { name: "físico", type: "checkbox" },
      ],
      entries: [],
    },
  ]);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isTableView, setIsTableView] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(false);

  const [newEntry, setNewEntry] = useState<Entry | null>(null);

  const currentSection = sections[currentSectionIndex];

  // 👉 Añadir nueva entrada temporal
  const handleAddEntry = () => {
    if (newEntry) return; // evita duplicados
    const empty: Entry = { id: Date.now() };
    currentSection.fields.forEach((f) => {
      empty[f.name] = f.type === "checkbox" ? false : "";
    });
    setNewEntry(empty);
  };

  // 👉 Confirmar entrada nueva
  const confirmNewEntry = () => {
    if (!newEntry) return;
    const updatedSections = [...sections];
    updatedSections[currentSectionIndex].entries.push(newEntry);
    setSections(updatedSections);
    setNewEntry(null);
  };

  // 👉 Actualizar campos de entrada existente o nueva
  const updateEntry = (id: number, field: string, value: any) => {
    if (newEntry && id === newEntry.id) {
      setNewEntry({ ...newEntry, [field]: value });
      return;
    }

    const updatedSections = [...sections];
    const entries = updatedSections[currentSectionIndex].entries.map((e) =>
      e.id === id ? { ...e, [field]: value } : e
    );
    updatedSections[currentSectionIndex].entries = entries;
    setSections(updatedSections);
  };

  // 👉 Eliminar entrada (o cancelar nueva)
  const deleteEntry = (id: number) => {
    if (newEntry && id === newEntry.id) {
      setNewEntry(null);
      return;
    }
    const updatedSections = [...sections];
    updatedSections[currentSectionIndex].entries = updatedSections[
      currentSectionIndex
    ].entries.filter((e) => e.id !== id);
    setSections(updatedSections);
  };

  // 👉 Ajustes y apartados
  const handleEditSections = () => setShowSectionEditor(true);
  const handleToggleSettings = () => setShowSettings((prev) => !prev);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar
        sections={sections}
        currentSectionIndex={currentSectionIndex}
        setCurrentSectionIndex={setCurrentSectionIndex}
        onEditSections={handleEditSections}
      />

      <main className="flex-1 p-4 overflow-auto">
        {/* Header superior con botones */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{currentSection.name}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsTableView((prev) => !prev)}
              className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
            >
              {isTableView ? "📇 Tarjetas" : "📋 Tabla"}
            </button>
            <button
              onClick={handleAddEntry}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              ➕ Añadir entrada
            </button>
            <button
              onClick={handleToggleSettings}
              className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
            >
              ⚙️ Ajustes
            </button>
          </div>
        </div>

        {/* Vistas dinámicas */}
        {isTableView ? (
          <TableView
            entries={currentSection.entries}
            fields={currentSection.fields}
            updateEntry={updateEntry}
            deleteEntry={deleteEntry}
            newEntry={newEntry}
            confirmNewEntry={confirmNewEntry}
            setNewEntry={setNewEntry}
          />
        ) : (
          <CardView
            entries={currentSection.entries}
            fields={currentSection.fields}
            updateEntry={updateEntry}
            deleteEntry={deleteEntry}
            newEntry={newEntry}
            confirmNewEntry={confirmNewEntry}
            setNewEntry={setNewEntry}
          />
        )}
      </main>

      {showSettings && (
        <SettingsPanel onClose={handleToggleSettings} section={currentSection} />
      )}

      {showSectionEditor && (
        <SectionEditorModal
          sections={sections}
          setSections={setSections}
          onClose={() => setShowSectionEditor(false)}
        />
      )}
    </div>
  );
};

export default App;
