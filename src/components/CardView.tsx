import React from "react";
import { Entry, Field } from "../types";

interface CardViewProps {
  entries: Entry[];
  fields: Field[];
  updateEntry: (id: number, field: string, value: any) => void;
  deleteEntry: (id: number) => void;
  newEntry?: Entry | null;
  setNewEntry?: (entry: Entry | null) => void;
  confirmNewEntry?: () => void;
}

const CardView: React.FC<CardViewProps> = ({
  entries,
  fields,
  updateEntry,
  deleteEntry,
  newEntry,
  setNewEntry,
  confirmNewEntry,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* ----------------- Fila de entrada rápida ----------------- */}
      {newEntry && setNewEntry && confirmNewEntry && (
        <div className="bg-gray-700 p-4 rounded-lg shadow flex flex-col gap-2">
          {fields.map((f) => {
            const value = newEntry[f.name] || "";
            return f.type === "checkbox" ? (
              <label key={f.name} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => setNewEntry({ ...newEntry, [f.name]: e.target.checked })}
                  className="w-5 h-5 accent-blue-500 cursor-pointer"
                />
                {f.name}
              </label>
            ) : (
              <input
                key={f.name}
                placeholder={f.name}
                value={value}
                onChange={(e) => setNewEntry({ ...newEntry, [f.name]: e.target.value })}
                className="p-1 rounded bg-gray-700 border border-gray-600 text-sm"
              />
            );
          })}
          <button
            onClick={confirmNewEntry}
            className="p-2 mt-1 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Añadir entrada
          </button>
        </div>
      )}

      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg">ID: {entry.id}</h2>
            <button
              onClick={() => deleteEntry(entry.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
            >
              🗑
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {fields.map((f) => {
              const value = entry[f.name];
              if (f.type === "checkbox") {
                return (
                  <div key={f.name} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!value}
                      onChange={(ev) => updateEntry(entry.id, f.name, ev.target.checked)}
                      className="w-5 h-5 accent-blue-500 cursor-pointer"
                    />
                    <label className="capitalize">{f.name}</label>
                  </div>
                );
              } else {
                return (
                  <div key={f.name} className="flex flex-col">
                    <label className="capitalize text-sm text-gray-400">{f.name}</label>
                    <input
                      type="text"
                      value={value || ""}
                      onChange={(ev) => updateEntry(entry.id, f.name, ev.target.value)}
                      className="p-1 rounded bg-gray-700 border border-gray-600 text-sm"
                    />
                  </div>
                );
              }
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardView;
