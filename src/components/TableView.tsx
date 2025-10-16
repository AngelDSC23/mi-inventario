import React, { useState, useRef, useEffect } from "react";
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
  const checkboxFields = fields.filter((f) => f.type === "checkbox");
  const [checkboxFilter, setCheckboxFilter] = useState<{ [key: string]: "all" | "true" | "false" }>({});

  useEffect(() => {
    const initialFilters: { [key: string]: "all" | "true" | "false" } = {};
    checkboxFields.forEach((f) => { initialFilters[f.name] = "all"; });
    setCheckboxFilter(initialFilters);
  }, [fields]);

  const filteredEntries = entries.filter((e) => {
    return checkboxFields.every((f) => {
      const val = checkboxFilter[f.name];
      if (val === "all") return true;
      if (val === "true") return !!e[f.name];
      return !e[f.name];
    });
  });

  return (
    <div className="overflow-auto">
      <table className="table-auto w-full border-collapse border border-gray-600">
        <thead>
          <tr>
            <th className="border border-gray-600 p-2">ID</th>
            {fields.map((f) => (
              <th key={f.name} className="border border-gray-600 p-2 capitalize">{f.name}</th>
            ))}
            <th className="border border-gray-600 p-2">Acciones</th>
          </tr>
          <tr>
            <th />
            {fields.map((f) => {
              if (f.type === "checkbox") {
                return (
                  <th key={f.name} className="border border-gray-600 p-1">
                    <select
                      value={checkboxFilter[f.name] || "all"}
                      onChange={(e) => setCheckboxFilter({ ...checkboxFilter, [f.name]: e.target.value as "all" | "true" | "false" })}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded p-1"
                    >
                      <option value="all">Todos</option>
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  </th>
                );
              } else {
                return (
                  <th key={f.name} className="border border-gray-600 p-1">
                    <input
                      placeholder={`Filtrar ${f.name}`}
                      value={""}
                      onChange={() => {}}
                      className="w-full p-1 rounded bg-gray-700 border border-gray-600"
                    />
                  </th>
                );
              }
            })}
            <th />
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((entry) => {
            const isEditing = editingId === entry.id;
            return (
              <tr key={entry.id} className="hover:bg-gray-800 transition-colors">
                <td className="border border-gray-600 p-1">{entry.id}</td>
                {fields.map((f) => (
                  <td key={f.name} className="border border-gray-600 p-1">
                    {f.type === "checkbox" ? (
                      <input
                        type="checkbox"
                        checked={!!entry[f.name]}
                        disabled={!isEditing}
                        onChange={(ev) => updateEntry(entry.id, f.name, ev.target.checked)}
                        className="w-5 h-5 accent-blue-500"
                      />
                    ) : (
                      <input
                        ref={(el) => (inputRefs.current[`${entry.id}-${f.name}`] = el)}
                        disabled={!isEditing}
                        value={entry[f.name] || ""}
                        onChange={(ev) => updateEntry(entry.id, f.name, ev.target.value)}
                        className="w-full p-1 rounded bg-gray-700 border border-gray-600"
                      />
                    )}
                  </td>
                ))}
                <td className="border border-gray-600 p-1 flex gap-2 justify-center">
                  <button onClick={() => setEditingId(isEditing ? null : entry.id)} className="px-2 py-1 bg-yellow-500 rounded hover:bg-yellow-600">🖉</button>
                  <button onClick={() => deleteEntry(entry.id)} className="px-2 py-1 bg-red-600 rounded hover:bg-red-700">🗑</button>
                </td>
              </tr>
            );
          })}
          <tr>
            <td colSpan={fields.length + 2} className="p-2 text-center">
              <button onClick={addEntry} className="px-3 py-1 bg-green-600 rounded hover:bg-green-700">Añadir entrada</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TableView;
