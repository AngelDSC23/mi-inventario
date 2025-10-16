import React from "react";
import { Entry, Field } from "../types";

interface CardViewProps {
  entries: Entry[];
  fields: Field[];
  updateEntry: (id: number, field: string, value: any) => void;
  deleteEntry: (id: number) => void;
  newEntry: Entry | null;
  setNewEntry: (entry: Entry | null) => void;
  confirmNewEntry: () => void;
}

const CardView: React.FC<CardViewProps> = ({
  entries,
  fields,
  updateEntry,
  deleteEntry,
  newEntry,
  confirmNewEntry,
}) => {
  const renderCard = (entry: Entry, isNew: boolean = false) => (
    <div
      key={entry.id}
      className="bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700"
    >
      <div className="flex justify-between mb-2">
        <span className="font-bold text-lg">#{entry.id}</span>
        {!isNew && (
          <button
            onClick={() => deleteEntry(entry.id)}
            className="text-red-500 hover:text-red-600"
          >
            🗑
          </button>
        )}
      </div>
      {fields.map((f) => (
        <div key={f.name} className="mb-2">
          <label className="block text-sm text-gray-400 mb-1 capitalize">
            {f.name}
          </label>
          {f.type === "checkbox" ? (
            <input
              type="checkbox"
              checked={!!entry[f.name]}
              onChange={(e) => updateEntry(entry.id, f.name, e.target.checked)}
              className="w-5 h-5 accent-blue-500"
            />
          ) : (
            <input
              type="text"
              value={entry[f.name] || ""}
              onChange={(e) => updateEntry(entry.id, f.name, e.target.value)}
              className="w-full p-1 rounded bg-gray-700 border border-gray-600"
            />
          )}
        </div>
      ))}
      {isNew && (
        <div className="flex gap-2 justify-end mt-3">
          <button
            onClick={confirmNewEntry}
            className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 active:scale-95 transition-transform"
          >
            ✅ Confirmar
          </button>
          <button
            onClick={() => deleteEntry(entry.id)}
            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 active:scale-95 transition-transform"
          >
            ❌ Cancelar
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {newEntry && renderCard(newEntry, true)}
      {entries.map((e) => renderCard(e))}
    </div>
  );
};

export default CardView;
