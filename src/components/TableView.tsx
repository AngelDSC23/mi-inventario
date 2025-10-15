import React, { useState, useRef, useEffect } from "react";
import { Entry, Field } from "../types";

interface TableViewProps {
  entries: Entry[];
  fields: Field[];
  updateEntry: (id: number, field: string, value: any) => void;
  deleteEntry: (id: number) => void;
  addEntry: () => void;
  filterType?: "todos" | "fisico" | "digital";
  editingId: number | null;
  setEditingId: (id: number | null) => void;
}

const TableView: React.FC<TableViewProps> = ({
  entries,
  fields,
  updateEntry,
  deleteEntry,
  addEntry,
  filterType = "todos",
  editingId,
  setEditingId,
}) => {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const filteredEntries = entries.filter((e) => {
    if (filterType === "fisico") return e.físico;
    if (filterType === "digital") return e.digital;
    return true;
  });

  const handleKeyNavigation = (
    e: React.KeyboardEvent<HTMLInputElement>,
    entryIndex: number,
    fieldIndex: number,
    entryId: number
  ) => {
    const rows = filteredEntries.length;
    const cols = fields.length;
    let nextRow = entryIndex;
    let nextCol = fieldIndex;

    if (e.key === "Enter" || e.key === "ArrowRight") nextCol++;
    if (e.key === "ArrowLeft") nextCol--;
    if (e.key === "ArrowDown") nextRow++;
    if (e.key === "ArrowUp") nextRow--;

    if (nextCol >= cols) { nextCol = 0; nextRow++; }
    if (nextCol < 0) { nextCol = cols - 1; nextRow--; }
    if (nextRow < 0) nextRow = 0;
    if (nextRow >= rows) nextRow = rows - 1;

    const nextKey = `${nextRow}-${nextCol}`;
    const nextInput = inputRefs.current[nextKey];
    if (nextInput) nextInput.focus();
    else setEditingId(null);
  };

  useEffect(() => {
    if (editingId !== null) {
      const editingIndex = filteredEntries.findIndex((e) => e.id === editingId);
      if (editingIndex >= 0) {
        const firstFieldKey = `${editingIndex}-0`;
        const firstInput = inputRefs.current[firstFieldKey];
        if (firstInput && document.activeElement !== firstInput) {
          firstInput.focus();
          const val = firstInput.value;
          firstInput.setSelectionRange(val.length, val.length);
        }
      }
    }
  }, [editingId]);

  return (
    <>
      <div className="table-container overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full border border-gray-700 mb-4">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 border">ID</th>
              {fields.map((f) => (
                <th key={f.name} className="p-2 border capitalize">{f.name}</th>
              ))}
              <th className="p-2 border">Digital</th>
              <th className="p-2 border">Físico</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((e, entryIndex) => {
              const isEditing = editingId === e.id;
              return (
                <tr key={e.id} className="hover:bg-gray-800">
                  <td className="p-2 border">{e.id}</td>
                  {fields.map((f, fieldIndex) => {
                    const refKey = `${entryIndex}-${fieldIndex}`;
                    const value = e[f.name];

                    return (
                      <td key={f.name} className="p-2 border">
                        <div className="flex justify-center items-center h-full">
                          {f.type === "checkbox" ? (
                            <select
                              disabled={!isEditing}
                              value={value ? "true" : "false"}
                              onChange={(ev) =>
                                updateEntry(e.id, f.name, ev.target.value === "true")
                              }
                              className="w-full p-1 rounded bg-gray-700 border border-gray-600 cursor-pointer"
                            >
                              <option value="true">Sí</option>
                              <option value="false">No</option>
                            </select>
                          ) : (
                            <input
                              ref={(el) => { inputRefs.current[refKey] = el; }}
                              disabled={!isEditing}
                              value={value || ""}
                              onChange={(ev) =>
                                updateEntry(e.id, f.name, ev.target.value)
                              }
                              onKeyDown={(ev) =>
                                handleKeyNavigation(ev, entryIndex, fieldIndex, e.id)
                              }
                              className="w-full p-1 rounded bg-gray-700 border border-gray-600"
                            />
                          )}
                        </div>
                      </td>
                    );
                  })}

                  <td className="p-2 border">
                    <div className="flex justify-center items-center h-full">
                      <input
                        type="checkbox"
                        checked={e.digital}
                        disabled={!isEditing}
                        onChange={(ev) =>
                          updateEntry(e.id, "digital", ev.target.checked)
                        }
                        className="w-5 h-5 accent-blue-500 cursor-pointer"
                      />
                    </div>
                  </td>

                  <td className="p-2 border">
                    <div className="flex justify-center items-center h-full">
                      <input
                        type="checkbox"
                        checked={e.físico}
                        disabled={!isEditing}
                        onChange={(ev) =>
                          updateEntry(e.id, "físico", ev.target.checked)
                        }
                        className="w-5 h-5 accent-blue-500 cursor-pointer"
                      />
                    </div>
                  </td>

                  <td className="p-2 border flex gap-2 justify-center">
                    <button
                      onClick={() => setEditingId(isEditing ? null : e.id)}
                      className="flex items-center justify-center min-w-[36px] min-h-[36px] bg-yellow-500 text-white rounded-md hover:bg-yellow-600 active:scale-95 transition-transform"
                    >
                      🖉
                    </button>
                    <button
                      onClick={() => deleteEntry(e.id)}
                      className="flex items-center justify-center min-w-[36px] min-h-[36px] bg-red-600 text-white rounded-md hover:bg-red-700 active:scale-95 transition-transform"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={addEntry}
        className="p-2 mt-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md active:scale-95 transition-transform"
      >
        Añadir entrada
      </button>
    </>
  );
};

export default TableView;
