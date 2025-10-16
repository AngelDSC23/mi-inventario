import React from "react";
import { Entry, Field } from "../types";

interface TableViewProps {
  entries: Entry[];
  fields: Field[];
  updateEntry: (id: number, field: string, value: any) => void;
  deleteEntry: (id: number) => void;
}

const TableView: React.FC<TableViewProps> = ({
  entries,
  fields,
  updateEntry,
  deleteEntry,
}) => {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          {fields.map((field) => (
            <th key={field.name} className="border-b p-2 text-left">
              {field.label}
            </th>
          ))}
          <th className="border-b p-2 text-left">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.id} className="hover:bg-gray-50">
            {fields.map((field) => (
              <td key={field.name} className="border-b p-2">
                {field.type === "checkbox" ? (
                  <input
                    type="checkbox"
                    checked={!!entry[field.name]}
                    onChange={(e) =>
                      updateEntry(entry.id, field.name, e.target.checked)
                    }
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
              </td>
            ))}
            <td className="border-b p-2">
              <button
                onClick={() => deleteEntry(entry.id)}
                className="text-red-500 hover:underline text-xs"
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableView;
