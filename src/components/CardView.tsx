import React from "react";
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
  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="border rounded-xl p-3 bg-white shadow-sm hover:shadow-md transition"
        >
          {fields.map((field) => (
            <div key={field.name} className="mb-2">
              <label className="text-xs font-semibold text-gray-500">
                {field.label}
              </label>
              {field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={!!entry[field.name]}
                  onChange={(e) =>
                    updateEntry(entry.id, field.name, e.target.checked)
                  }
                  className="ml-2"
                />
              ) : (
                <input
                  type="text"
                  value={entry[field.name] || ""}
                  onChange={(e) =>
                    updateEntry(entry.id, field.name, e.target.value)
                  }
                  className="w-full border rounded p-1 text-sm"
                />
              )}
            </div>
          ))}

          <button
            onClick={() => deleteEntry(entry.id)}
            className="mt-2 text-red-500 hover:underline text-xs"
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
};

export default CardView;
