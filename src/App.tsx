import React, { useState, useEffect } from "react";
import { Entry, Section, Field } from "./types";
import Sidebar from "./components/Sidebar";
import SectionEditorModal from "./components/SectionEditorModal";
import SettingsPanel from "./components/SettingsPanel";
import TableView from "./components/TableView";
import CardView from "./components/CardView";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";

import { db } from "./firebase-config";

// --- Valores por defecto 
const defaultSections: Section[] = [
  {
    name: "Libros",
    fields: [
      { name: "titulo", type: "text" as const },
      { name: "autor", type: "text" as const },
      { name: "año", type: "text" as const },
      { name: "edición", type: "text" as const },
    ],
    entries: [],
  },
  {
    name: "CDs",
    fields: [
      { name: "titulo", type: "text" as const },
      { name: "artista", type: "text" as const },
      { name: "año", type: "text" as const },
    ],
    entries: [],
  },
  {
    name: "Guiones",
    fields: [
      { name: "titulo", type: "text" as const },
      { name: "autor", type: "text" as const },
      { name: "año", type: "text" as const },
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
  const [filter, setFilter] = useState<{ [key: string]: string }>({});
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "digital" | "físico">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSection = sections[currentSectionIndex];

  // --- Cargar datos desde Firestore al inicio ---
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

  // --- Función para guardar una sección específica
  const saveSection = async (section: Section) => {
    const safeId = section.name?.replace(/[.#$/[\]]/g, "_") || crypto.randomUUID();
    const sectionRef = doc(db, "sections", safeId);
    await setDoc(sectionRef, section, { merge: true });
  };

  // --- Entradas ---
  const addEntry = async () => {
    const nextId = currentSection.entries.length > 0
      ? currentSection.entries[currentSection.entries.length - 1].id + 1
      : 1;

    const newEntry: Entry = { id: nextId, digital: false, físico: false };
    currentSection.fields.forEach((f) => {
      newEntry[f.name] = f.type === "checkbox" ? false : "";
    });

    const updatedSections = [...sections];
    updatedSections[currentSectionIndex].entries.push(newEntry);
    setSections(updatedSections);
    setEditingId(nextId);

    await saveSection(updatedSections[currentSectionIndex]);
  };

  const updateEntry = async (id: number, field: string, value: any) => {
    const updatedSections = [...sections];
    const idx = updatedSections[currentSectionIndex].entries.findIndex((e) => e.id === id);
    if (idx > -1) {
      updatedSections[currentSectionIndex].entries[idx][field] = value;
      setSections(updatedSections);

      await saveSection(updatedSections[currentSectionIndex]);
    }
  };

  const deleteEntry = async (id: number) => {
    const updatedSections = [...sections];
    updatedSections[currentSectionIndex].entries = updatedSections[currentSectionIndex].entries.filter((e) => e.id !== id);
    setSections(updatedSections);
    if (editingId === id) setEditingId(null);

    await saveSection(updatedSections[currentSectionIndex]);
  };

  // --- Columnas 
  const addField = (field: Field) => {
    if (!field.name.trim()) return;
    const updatedSections = [...sections];
    const section = updatedSections[currentSectionIndex];
    if (!section.fields.some((f) => f.name === field.name)) {
      section.fields.push(field);
      setSections(updatedSections);
      saveSection(updatedSections[currentSectionIndex]);
    }
  };

  const updateField = (index: number, updates: Partial<Field>) => {
    const updatedSections = [...sections];
    const section = updatedSections[currentSectionIndex];
    section.fields[index] = { ...section.fields[index], ...updates };
    setSections(updatedSections);
    saveSection(updatedSections[currentSectionIndex]);
  };

  const deleteField = () => {
    if (selectedFieldIndex === null) return;
    const updatedSections = [...sections];
    const section = updatedSections[currentSectionIndex];
    const field = section.fields[selectedFieldIndex];
    section.fields.splice(selectedFieldIndex, 1);
    section.entries.forEach((entry) => delete entry[field.name]);
    setSelectedFieldIndex(null);
    setSections(updatedSections);
    saveSection(updatedSections[currentSectionIndex]);
  };

  const moveField = (direction: "left" | "right") => {
    if (selectedFieldIndex === null) return;
    const updatedSections = [...sections];
    const section = updatedSections[currentSectionIndex];
    const index = selectedFieldIndex;
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= section.fields.length) return;
    [section.fields[index], section.fields[newIndex]] = [section.fields[newIndex], section.fields[index]];
    setSelectedFieldIndex(newIndex);
    setSections(updatedSections);
    saveSection(updatedSections[currentSectionIndex]);
  };

  // --- Apartados ---
  const addSection = (name: string) => {
    if (!name.trim()) return;
    const updated = [
      ...sections,
      {
        name,
        fields: [{ name: "titulo", type: "text" as const }],
        entries: [],
      },
    ];
    setSections(updated);
    saveSection(updated[updated.length - 1]);
  };

  const deleteSection = (index: number) => {
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
    if (currentSectionIndex >= updated.length) setCurrentSectionIndex(updated.length - 1);
  };

  // --- Filtrado por texto y tipo ---
  const filteredEntries = currentSection.entries.filter((entry) => {
    const matchesText = Object.entries(filter).every(([key, value]) =>
      !value || String(entry[key] || "").toLowerCase().includes(value.toLowerCase())
    );

    const matchesType =
      typeFilter === "all"
        ? true
        : typeFilter === "digital"
        ? entry.digital
        : entry.físico;

    return matchesText && matchesType;
  });

  // --- Render principal ---
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Sidebar: ocupa todo el ancho en móvil y columna fija en escritorio */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <Sidebar
          sections={sections}
          currentSectionIndex={currentSectionIndex}
          setCurrentSectionIndex={setCurrentSectionIndex}
          onEditSections={() => setShowSectionEditor(true)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Overlay al abrir Sidebar en móvil */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-4 sm:p-6 overflow-auto app-container">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          {/* Botón hamburger visible solo en móvil */}
          <button
            className="md:hidden p-2 bg-gray-800 rounded hover:bg-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <h1 className="text-xl sm:text-2xl font-bold">{currentSection.name}</h1>

          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | "digital" | "físico")}
              className="p-2 bg-gray-800 border border-gray-600 rounded text-sm sm:text-base"
            >
              <option value="all">Todos</option>
              <option value="digital">Digital</option>
              <option value="físico">Físico</option>
            </select>

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
            addField={addField}
            deleteField={deleteField}
            moveField={moveField}
            updateField={updateField}
          />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {currentSection.fields.map((f) => (
                <input
                  key={f.name}
                  placeholder={`Filtrar por ${f.name}`}
                  value={filter[f.name] || ""}
                  onChange={(e) => setFilter({ ...filter, [f.name]: e.target.value })}
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
                editingId={editingId}
                setEditingId={setEditingId}
              />
            ) : (
              <CardView
                entries={filteredEntries}
                fields={currentSection.fields}
                updateEntry={updateEntry}
                deleteEntry={deleteEntry}
              />
            )}
          </>
        )}

        {showSectionEditor && (
          <SectionEditorModal
            sections={sections}
            addSection={addSection}
            deleteSection={deleteSection}
            onClose={() => setShowSectionEditor(false)}
          />
        )}
      </main>
    </div>
  );

}
