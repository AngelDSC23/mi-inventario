import React, { useState, useEffect } from "react";
import { Entry, Field } from "../types";

interface CardViewProps {
  entries: Entry[];
  fields: Field[];
  updateEntry: (id: number, field: string, value: any) => void;
  deleteEntry: (id: number) => void;
}

const CardView: React.FC<CardViewProps> = ({
  entries,
  fields,
  updateEntry,
  deleteEntry,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);

  // --- Filtros para campos tipo checkbox ---
  const checkboxFields = fields.filter((f) => f.type === "checkbox");
  const [checkboxFilter, setCheckboxFilter] = useState<{ [key: string]: "all" | "true" | "false" }>({});

  // Inicializar filtros en mount
  useEffect(() => {
    const initialFilters: { [key: string]: "all" | "true" | "false" } = {};
    checkboxFields.forEach((f) => { initialFilters[f.name] = "all"; });
    setCheckboxFilter(initialFilters);
  }, [fields]);

  const filteredEntries = entries.filter((e) => {
    return checkboxFields.every((f) => {
      const filterVal = checkboxFilter[f.name];
      if (filterVal === "all") return true;
      if (filterVal === "true") return !!e[f.name];
      return !e[f.name];
    });
  });

  return (
    <>
      {/* 🔍 Filtros para checkboxes */}
      {checkboxFields.length > 0 && (
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <label className="font-semibold">Filtrar:</label>
          {checkboxFields.map((f) => (
            <select
              key={f.name}
              value={checkboxFilter[f.name] || "all"}
              onChange={(e) =>
                setCheckboxFilter({ ...checkboxFilter, [f.name]: e.target.value as "all" | "true" | "false" })
              }
              className="bg-gray-800 border border-gray-600 text-white rounded p-1"
            >
              <option value="all">Todos ({f.name})</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          ))}
        </div>
      )}

      {/* 🃏 Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2 md:p-0">
        {filteredEntries.map((e) => {
          const isEditing = editingId === e.id;
          return (
            <div
              key={e.id}
              className="border rounded-xl p-3 sm:p-4 bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="font-bold mb-2">ID: {e.id}</div>

              {fields.map((f) => (
                <div key={f.name} className="mb-1 flex justify-center items-center gap-2">
                  <label className="capitalize">{f.name}: </label>
                  {f.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={!!e[f.name]}
                      disabled={!isEditing}
                      onChange={(ev) => updateEntry(e.id, f.name, ev.target.checked)}
                      className="w-5 h-5 accent-blue-500 cursor-pointer"
                    />
                  ) : (
                    <input
                      disabled={!isEditing}
                      value={e[f.name] || ""}
                      onChange={(ev) => updateEntry(e.id, f.name, ev.target.value)}
                      className="w-full p-1 rounded bg-gray-700 border border-gray-600"
                    />
                  )}
                </div>
              ))}

              <div className="mt-2 flex gap-2 justify-center">
                {["digital", "físico"].map((special) => (
                  e.hasOwnProperty(special) && (
                    <div key={special} className="flex justify-center items-center gap-1">
                      <input
                        type="checkbox"
                        checked={!!e[special]}
                        disabled={!isEditing}
                        onChange={(ev) => updateEntry(e.id, special, ev.target.checked)}
                        className="w-5 h-5 accent-blue-500 cursor-pointer"
                      />
                      <label>{special.charAt(0).toUpperCase() + special.slice(1)}</label>
                    </div>
                  )
                ))}
              </div>

              <div className="flex gap-3 mt-3 justify-center">
                <button
                  onClick={() => setEditingId(isEditing ? null : e.id)}
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] px-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 active:scale-95 transition-transform"
                >
                  🖉
                </button>
                <button
                  onClick={() => deleteEntry(e.id)}
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-transform"
                >
                  🗑
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default CardView;
