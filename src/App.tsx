import React, { useState, useEffect } from "react";
import { Entry, Section, Field } from "./types";
import Sidebar from "./components/Sidebar";
import SectionEditorModal from "./components/SectionEditorModal";
import SettingsPanel from "./components/SettingsPanel";
import TableView from "./components/TableView";
import CardView from "./components/CardView";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase-config";

const defaultSections: Section[] = [
  {
    name: "Libros",
    fields: [
      { name: "titulo", type: "text" as const },
      { name: "autor", type: "text" as const },
      { name: "año", type: "text" as const },
      { name: "edición", type: "text" as const },
      { name: "leído", type: "checkbox" as const },
    ],
    entries: [],
  },
  {
    name: "CDs",
    fields: [
      { name: "titulo", type: "text" as const },
      { name: "artista", type: "text" as const },
      { name: "año", type: "text" as const },
      { name: "digital", type: "checkbox" as const },
    ],
    entries: [],
  },
];

export default function App() {
  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [filterText, setFilterText] = useState<{ [key: string]: string }>({});
  const [checkboxFilter, setCheckboxFilter] = useState<string>("todos");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);

  const [newEntry, setNewEntry] = useState<Entry | null>(null);

  const currentSection = sections[currentSectionIndex];

  useEffect(() => {
    async function fetchSections() {
      const querySnapshot = await getDocs(collection(db, "sections"));
      if (!querySnapshot.empty) {
        const loadedSections = querySnapshot.docs.map((doc) => doc.data());
        setSections(loadedSections as Section[]);
      }
    }
    fetchSections();
  }, []);

  // limpiar entrada nueva al cambiar vista o sección
  useEffect(() => {
    setNewEntry(null);
    setEditingId(null);
  }, [currentSectionIndex, viewMode]);

  const saveSection = async (section: Section) => {
    const safeId = section.name?.replace(/[.#$/[\]]/g, "_") || crypto.randomUUID();
    const sectionRef = doc(db, "sections", safeId);
    await setDoc(sectionRef, section, { merge: true });
  };

  // -------------------
  // Funciones de entrada
  // -------------------
  const addEntry = () => {
    if (newEntry) return; // ya hay una fila nueva editable
    const nextId =
      currentSection.entries.length > 0
        ? currentSection.entries[currentSection.entries.length - 1].id + 1
        : 1;

    const entry: Entry = { id: nextId, digital: false, físico: false };
    currentSection.fields.forEach((f) => {
      if (!(f.name in entry)) entry[f.name] = f.type === "checkbox" ? false : "";
    });

    setNewEntry(entry);
    setEditingId(nextId);
  };

  const confirmNewEntry = async () => {
    if (!newEntry) return;

    setSections((prev) => {
      const updated = [...prev];
      const sectionCopy = { ...updated[currentSectionIndex] };
      sectionCopy.entries = [...sectionCopy.entries, newEntry];
      updated[currentSectionIndex] = sectionCopy;
      saveSection(sectionCopy);
      return updated;
    });

    setNewEntry(null);
    setEditingId(null);
  };

  const updateEntry = async (id: number, field: string, value: any) => {
    if (newEntry && newEntry.id === id) {
      setNewEntry({ ...newEntry, [field]: value });
      return;
    }

    setSections((prev) =>
      prev.map((section, sIdx) => {
        if (sIdx === currentSectionIndex) {
          const updatedEntries = section.entries.map((entry) =>
            entry.id === id ? { ...entry, [field]: value } : entry
          );
          const updatedSection = { ...section, entries: updatedEntries };
          saveSection(updatedSection);
          return updatedSection;
        }
        return section;
      })
    );
  };

  const deleteEntry = async (id: number) => {
    if (newEntry && newEntry.id === id) {
      setNewEntry(null);
      return;
    }

    const updatedSections = [...sections];
    updatedSections[currentSectionIndex].entries = updatedSections[
      currentSectionIndex
    ].entries.filter((e) => e.id !== id);
    setSections(updatedSections);
    if (editingId === id) setEditingId(null);
    await saveSection(updatedSections[currentSectionIndex]);
  };

  // -------------------
  // Filtrado
  // -------------------
  const filteredEntries = currentSection.entries.filter((entry) => {
    if (checkboxFilter !== "todos" && !entry[checkboxFilter]) return false;
    return currentSection.fields.every((f) => {
      if (f.type === "text") {
        const val = filterText[f.name];
        return !val || String(entry[f.name] || "").toLowerCase().includes(val.toLowerCase());
      }
      return true;
    });
  });

  const checkboxFields = currentSection.fields.filter((f) => f.type === "checkbox");

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <aside className="w-full md:w-64 flex-shrink-0">
        <Sidebar
          sections={sections}
          currentSectionIndex={currentSectionIndex}
          setCurrentSectionIndex={setCurrentSectionIndex}
          onEditSections={() => setShowSectionEditor(true)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </aside>

      <main className="flex-1 p-4 sm:p-6 overflow-auto app-container">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <button
            className="md:hidden p-2 bg-gray-800 rounded hover:bg-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">{currentSection.name}</h1>
          <div className="flex flex-wrap gap-2 items-center">
            {checkboxFields.length > 0 && (
              <select
                value={checkboxFilter}
                onChange={(e) => setCheckboxFilter(e.target.value)}
                className="p-2 bg-gray-800 border border-gray-600 rounded text-sm sm:text-base"
              >
                <option value="todos">Todos</option>
                {checkboxFields.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name.charAt(0).toUpperCase() + f.name.slice(1)}
                  </option>
                ))}
              </select>
            )}

            {/* Botón centralizado de añadir entrada */}
            <button
              onClick={addEntry}
              disabled={!!newEntry}
              className="p-2 bg-green-600 rounded hover:bg-green-700 text-sm sm:text-base disabled:opacity-50"
            >
              ➕ Añadir entrada
            </button>

            <button
              className="p-2 bg-indigo-600 rounded hover:bg-indigo-700 text-sm sm:text-base"
              onClick={() => setViewMode((prev) => (prev === "table" ? "card" : "table"))}
            >
              {viewMode === "table" ? "Ver tarjetas" : "Ver tabla"}
            </button>
            <button
              className="p-2 bg-blue-600 rounded hover:bg-blue-700 text-sm sm:text-base"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? "Cerrar ajustes" : "Ajustes"}
            </button>
          </div>
        </div>

        {showSettings ? (
          <SettingsPanel
            currentSection={currentSection}
            selectedFieldIndex={selectedFieldIndex}
            setSelectedFieldIndex={setSelectedFieldIndex}
            addField={() => {}}
            deleteField={() => {}}
            moveField={() => {}}
            updateField={() => {}}
          />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {currentSection.fields
                .filter((f) => f.type === "text")
                .map((f) => (
                  <input
                    key={f.name}
                    placeholder={`Filtrar por ${f.name}`}
                    value={filterText[f.name] || ""}
                    onChange={(e) => setFilterText({ ...filterText, [f.name]: e.target.value })}
                    className="p-1 sm:p-2 rounded bg-gray-700 border border-gray-600 text-sm sm:text-base"
                  />
                ))}
            </div>

            {viewMode === "table" ? (
              <TableView
                entries={filteredEntries}
                fields={currentSection.fields}
                updateEntry={updateEntry}
                deleteEntry={deleteEntry}
                addEntry={addEntry}
                confirmNewEntry={confirmNewEntry}
                editingId={editingId}
                setEditingId={setEditingId}
                isNewEntryPresent={!!newEntry}
                newEntry={newEntry}
              />
            ) : (
              <CardView
                entries={filteredEntries}
                fields={currentSection.fields}
                updateEntry={updateEntry}
                deleteEntry={deleteEntry}
                newEntry={newEntry}
                setNewEntry={setNewEntry}
                confirmNewEntry={confirmNewEntry}
              />
            )}
          </>
        )}

        {showSectionEditor && (
          <SectionEditorModal
            sections={sections}
            addSection={() => {}}
            deleteSection={() => {}}
            renameSection={() => {}}
            moveSection={() => {}}
            onClose={() => setShowSectionEditor(false)}
          />
        )}
      </main>
    </div>
  );
}
