import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import CardView from "./components/CardView";
import TableView from "./components/TableView";
import SettingsPanel from "./components/SettingsPanel";
import SectionEditorModal from "./components/SectionEditorModal";
import { Entry, Field } from "./types";
import "./index.css";

const App: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [showSettings, setShowSettings] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(false);

  // Cargar datos de ejemplo o desde almacenamiento si lo tuvieras
  useEffect(() => {
    const storedEntries = localStorage.getItem("entries");
    if (storedEntries) setEntries(JSON.parse(storedEntries));

    const storedFields = localStorage.getItem("fields");
    if (storedFields) setFields(JSON.parse(storedFields));
  }, []);

  useEffect(() => {
    localStorage.setItem("entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("fields", JSON.stringify(fields));
  }, [fields]);

  // --- Filtrado general ---
  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const filteredEntries = entries.filter((entry) => {
    return fields.every((field) => {
      const filterValue = filters[field.name];
      if (!filterValue) return true;
      const entryValue = entry[field.name];

      if (field.type === "text") {
        return entryValue
          ?.toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }

      if (field.type === "checkbox") {
        return entryValue === true ? filterValue === true : !filterValue;
      }

      return true;
    });
  });

  // --- Actualizar entrada individual ---
  const updateEntry = (id: number, field: string, value: any) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const deleteEntry = (id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // --- Agrupación de tipos de campo ---
  const textFields = fields.filter((f) => f.type === "text");
  const checkboxFields = fields.filter((f) => f.type === "checkbox");

  // --- Limpieza de filtros checkbox (Todos) ---
  const clearCheckboxFilters = () => {
    const cleared = { ...filters };
    checkboxFields.forEach((f) => (cleared[f.name] = false));
    setFilters(cleared);
  };

  return (
    <div className="flex h-screen">
      <Sidebar onAddEntry={() => setShowSectionEditor(true)} />

      <main className="flex-1 p-4 overflow-auto">
        {/* 🔍 Bloque de filtros unificado */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* Filtros de texto */}
          {textFields.map((field) => (
            <input
              key={field.name}
              type="text"
              placeholder={field.label}
              value={filters[field.name] || ""}
              onChange={(e) => handleFilterChange(field.name, e.target.value)}
              className="border rounded p-1 text-sm"
            />
          ))}

          {/* Menú desplegable de filtros checkbox */}
          <div className="relative">
            <button
              onClick={(e) => {
                const menu = e.currentTarget.nextElementSibling as HTMLElement;
                menu.classList.toggle("hidden");
              }}
              className="border px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
            >
              Filtros
            </button>

            <div className="hidden absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
              <div
                className="cursor-pointer hover:bg-gray-100 p-2 text-sm"
                onClick={clearCheckboxFilters}
              >
                Todos
              </div>
              {checkboxFields.map((field) => (
                <label
                  key={field.name}
                  className="flex items-center gap-2 p-2 text-sm hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={filters[field.name] || false}
                    onChange={(e) =>
                      handleFilterChange(field.name, e.target.checked)
                    }
                  />
                  {field.label}
                </label>
              ))}
            </div>
          </div>

          {/* Botones de ajustes y vista */}
          <button
            onClick={() => setShowSettings(true)}
            className="ml-auto border px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
          >
            ⚙️
          </button>
          <button
            onClick={() =>
              setViewMode((prev) => (prev === "cards" ? "table" : "cards"))
            }
            className="border px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
          >
            {viewMode === "cards" ? "🗂️ Tabla" : "📇 Tarjetas"}
          </button>
        </div>

        {/* Contenido principal */}
        {viewMode === "cards" ? (
          <CardView
            entries={filteredEntries}
            fields={fields}
            updateEntry={updateEntry}
            deleteEntry={deleteEntry}
          />
        ) : (
          <TableView
            entries={filteredEntries}
            fields={fields}
            updateEntry={updateEntry}
            deleteEntry={deleteEntry}
          />
        )}
      </main>

      {/* Paneles laterales */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showSectionEditor && (
        <SectionEditorModal
          fields={fields}
          setFields={setFields}
          onClose={() => setShowSectionEditor(false)}
        />
      )}
    </div>
  );
};

export default App;
