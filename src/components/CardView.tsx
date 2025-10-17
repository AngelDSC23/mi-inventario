import React, { useState } from "react";
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
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCoverChange = (entry: Entry, fileOrUrl: File | string) => {
    if (typeof fileOrUrl === "string") {
      updateEntry(entry.id, "cover", fileOrUrl);
    } else {
      const url = URL.createObjectURL(fileOrUrl);
      updateEntry(entry.id, "cover", url);
    }
  };

  const renderCompactInfo = (entry: Entry) => {
    const titleField = fields.find((f) => f.name.toLowerCase() === "titulo");
    const authorField = fields.find((f) => f.name.toLowerCase() === "autor" || f.name.toLowerCase() === "artista");

    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <span className="font-bold text-lg truncate">#{entry.id}</span>
        {titleField && (
          <span className="text-base truncate">{entry[titleField.name]}</span>
        )}
        {authorField && (
          <span className="text-sm text-gray-400 truncate">
            {entry[authorField.name]}
          </span>
        )}
      </div>
    );
  };

  const renderCard = (entry: Entry, isNew: boolean = false) => {
    const isExpanded = expandedIds.includes(entry.id);

    return (
      <div
        key={entry.id}
        className="bg-gray-800 rounded-xl p-4 shadow-md border border-gray-700 flex flex-col gap-3 transition-transform hover:scale-[1.01]"
      >
        {/* Portada */}
        <div className="relative w-full aspect-[3/4] bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
          {entry.cover ? (
            <img
              src={entry.cover}
              alt={`Portada ${entry.id}`}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-gray-400 italic text-sm">Sin portada</span>
          )}
        </div>

        {/* Editor de portada (solo en modo tarjetas) */}
        <div className="flex gap-2 text-sm text-gray-300">
          <input
            type="text"
            placeholder="Pega URL de imagen..."
            value={entry.cover || ""}
            onChange={(e) => handleCoverChange(entry, e.target.value)}
            className="flex-1 bg-gray-700 p-1 rounded border border-gray-600"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleCoverChange(entry, e.target.files[0]);
              }
            }}
            className="text-xs text-gray-400"
          />
        </div>

        {/* Info compacta */}
        <div className="flex justify-between items-start gap-2">
          {renderCompactInfo(entry)}
          <div className="flex flex-col gap-1 items-end">
            {!isNew && (
              <>
                <button
                  onClick={() => toggleExpand(entry.id)}
                  className="text-blue-400 hover:text-blue-500 text-sm"
                >
                  {isExpanded ? "Ocultar" : "Detalles"}
                </button>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-red-400 hover:text-red-500 text-sm"
                >
                  🗑 Eliminar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sección expandida: muestra todos los campos */}
        {isExpanded && (
          <div className="mt-3 border-t border-gray-700 pt-3">
            {fields.map((f) => {
              // no mostrar de nuevo título o autor si ya están en el encabezado
              if (
                ["titulo", "autor", "artista"].includes(f.name.toLowerCase())
              )
                return null;

              return (
                <div key={f.name} className="mb-2">
                  <label className="block text-sm text-gray-400 mb-1 capitalize">
                    {f.name}
                  </label>
                  {f.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={!!entry[f.name]}
                      onChange={(e) =>
                        updateEntry(entry.id, f.name, e.target.checked)
                      }
                      className="w-5 h-5 accent-blue-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={entry[f.name] || ""}
                      onChange={(e) =>
                        updateEntry(entry.id, f.name, e.target.value)
                      }
                      className="w-full p-1 rounded bg-gray-700 border border-gray-600"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Controles para nueva entrada */}
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
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {newEntry && renderCard(newEntry, true)}
      {entries.map((e) => renderCard(e))}
    </div>
  );
};

export default CardView;
