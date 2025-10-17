import React, { useState, useEffect } from "react";
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
  setNewEntry,
  confirmNewEntry,
}) => {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [editingIds, setEditingIds] = useState<number[]>([]);
  const [showUrlInputIds, setShowUrlInputIds] = useState<number[]>(newEntry ? [newEntry.id] : []);
  const [activePasteId, setActivePasteId] = useState<number | null>(newEntry ? newEntry.id : null);

  // Mostrar input de URL automáticamente al crear nueva entrada
  useEffect(() => {
    if (newEntry) {
      setShowUrlInputIds([newEntry.id]);
      setActivePasteId(newEntry.id);
    }
  }, [newEntry]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const isExpanded = prev.includes(id);
      if (isExpanded) {
        setEditingIds((editPrev) => editPrev.filter((eid) => eid !== id));
        return prev.filter((x) => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const toggleEdit = (id: number) => {
    setEditingIds((prev) => {
      const isEditing = prev.includes(id);
      if (isEditing) {
        return prev.filter((eid) => eid !== id);
      } else {
        setExpandedIds((expandedPrev) =>
          expandedPrev.includes(id) ? expandedPrev : [...expandedPrev, id]
        );
        return [...prev, id];
      }
    });
  };

  const toggleUrlInput = (id: number) => {
    setShowUrlInputIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCoverChange = (entry: Entry, fileOrUrl: File | string | null) => {
    if (!fileOrUrl) return;

    const saveCover = (coverData: string) => {
      if (entry.id === newEntry?.id) {
        setNewEntry({ ...newEntry, cover: coverData });
      } else {
        updateEntry(entry.id, "cover", coverData);
      }
    };

    if (typeof fileOrUrl === "string") {
      saveCover(fileOrUrl);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          saveCover(ev.target.result as string);
        }
      };
      reader.readAsDataURL(fileOrUrl);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (activePasteId === null) return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const entry = entries.find((ent) => ent.id === activePasteId) || newEntry;
          if (entry) handleCoverChange(entry, file);
        }
      }
    }
  };

  const renderCard = (entry: Entry, isNew: boolean = false) => {
    const isExpanded = expandedIds.includes(entry.id);
    const isEditing = editingIds.includes(entry.id);
    const showUrlInput = showUrlInputIds.includes(entry.id);

    const mainFields = fields.slice(0, 2);

    return (
      <div
        key={entry.id}
        className="bg-gray-800 rounded-xl p-4 shadow-md border border-gray-700 flex flex-col gap-3 transition-transform hover:scale-[1.01]"
        onClick={() => setActivePasteId(entry.id)}
        onPaste={handlePaste}
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

        {/* Editor de portada */}
        {(isNew || isEditing) && (
          <div className="flex gap-2 items-center text-sm text-gray-300">
            <input
              type="text"
              placeholder="Pega URL de imagen..."
              value={entry.cover || ""}
              onChange={(e) => handleCoverChange(entry, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") toggleUrlInput(entry.id); }}
              onBlur={() => toggleUrlInput(entry.id)}
              className="flex-1 bg-gray-700 p-1 rounded border border-gray-600"
            />
            <label className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded cursor-pointer transition">
              📷
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleCoverChange(entry, e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Cabecera con campos principales */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <span className="font-bold text-lg truncate">#{entry.id}</span>
          {mainFields.map((f) => (
            <input
              key={f.name}
              type="text"
              disabled={!isEditing && !isNew}
              value={entry[f.name] || ""}
              onChange={(e) => {
                if (isNew) setNewEntry({ ...newEntry!, [f.name]: e.target.value });
                else updateEntry(entry.id, f.name, e.target.value);
              }}
              className={`w-full p-1 rounded bg-gray-700 border border-gray-600 ${
                !isEditing && !isNew ? "opacity-70 cursor-default" : ""
              }`}
            />
          ))}
        </div>

        {/* Botones principales */}
        {!isNew && (
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => toggleExpand(entry.id)}
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 active:scale-95 transition-transform"
              title="Detalles"
            >
              🔍
            </button>
            <button
              onClick={() => toggleEdit(entry.id)}
              className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 active:scale-95 transition-transform"
              title="Editar"
            >
              ✏️
            </button>
            <button
              onClick={() => deleteEntry(entry.id)}
              className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 active:scale-95 transition-transform"
              title="Eliminar"
            >
              🗑
            </button>
          </div>
        )}

        {/* Sección expandida */}
        {isExpanded && (
          <div className="mt-3 border-t border-gray-700 pt-3">
            {fields.map((f) => {
              if (mainFields.includes(f)) return null;
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
                      disabled={!isEditing && !isNew}
                    />
                  ) : (
                    <input
                      type="text"
                      value={entry[f.name] || ""}
                      onChange={(e) =>
                        updateEntry(entry.id, f.name, e.target.value)
                      }
                      disabled={!isEditing && !isNew}
                      className={`w-full p-1 rounded bg-gray-700 border border-gray-600 ${
                        !isEditing && !isNew ? "opacity-70 cursor-default" : ""
                      }`}
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
