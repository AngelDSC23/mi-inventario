import React, { useRef } from "react";
import { Entry, Field } from "../types";

interface TableViewProps {
  entries: Entry[];
  fields: Field[];
  updateEntry: (id: number, field: string, value: any) => void;
  deleteEntry: (id: number) => void;
  addEntry: () => void;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
}

const TableView: React.FC<TableViewProps> = ({
  entries,
  fields,
  updateEntry,
  deleteEntry,
  addEntry,
  editingId,
  setEditingId,
}) => {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleKeyNavigation = (
    e: React.KeyboardEvent<HTMLInputElement>,
    entryIndex: number,
    fieldIndex: number
  ) => {
    const rows = entries.length;
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

    const nextKey = `${entries[nextRow]?.id}-${fields[nextCol]?.name}`;
    const nextInput = inputRefs.current[nextKey];
    if (nextInput) nextInput.focus();
  };

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
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, entryIndex) => {
              const isEditing = editingId === e.id;
              return (
                <tr key={e.id} className="hover:bg-gray-800">
                  <td className="p-2 border">{e.id}</td>
                  {fields.map((f, fieldIndex) => {
                    const refKey = `${e.id}-${f.name}`;
                    const value = e[f.name];
                    return (
                      <td key={f.name} className="p-2 border">
                        <div className="flex justify-center items-center h-full">
                          {f.type === "checkbox" ? (
                            <input
                              type="checkbox"
                              checked={!!value}
                              disabled={!isEditing}
                              onChange={(ev) => updateEntry(e.id, f.name, ev.target.checked)}
                              className="w-5 h-5 accent-blue-500 cursor-pointer"
                            />
                          ) : (
                            <input
                              ref={(el) => { inputRefs.current[refKey] = el; }}
                              disabled={!isEditing}
                              value={value || ""}
                              onChange={(ev) => updateEntry(e.id, f.name, ev.target.value)}
                              onKeyDown={(ev) => handleKeyNavigation(ev, entryIndex, fieldIndex)}
                              className="w-full p-1 rounded bg-gray-700 border border-gray-600"
                            />
                          )}
                        </div>
                      </td>
                    );
                  })}
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
