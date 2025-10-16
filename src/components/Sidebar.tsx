import React, { useState } from "react";
import { Section } from "../types";

interface SidebarProps {
  sections: Section[];
  currentSectionIndex: number;
  setCurrentSectionIndex: (index: number) => void;
  onEditSections: () => void;

  // 🔹 Nuevas props para control móvil
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sections,
  currentSectionIndex,
  setCurrentSectionIndex,
  onEditSections,
  isOpen,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleMoveUp = () => {
    if (selectedIndex === null || selectedIndex === 0) return;
    const temp = [...sections];
    [temp[selectedIndex - 1], temp[selectedIndex]] = [
      temp[selectedIndex],
      temp[selectedIndex - 1],
    ];
    setSelectedIndex(selectedIndex - 1);
    onEditSections?.(); // disparar actualización
  };

  const handleMoveDown = () => {
    if (selectedIndex === null || selectedIndex === sections.length - 1) return;
    const temp = [...sections];
    [temp[selectedIndex + 1], temp[selectedIndex]] = [
      temp[selectedIndex],
      temp[selectedIndex + 1],
    ];
    setSelectedIndex(selectedIndex + 1);
    onEditSections?.();
  };

  return (
    <div
      className={`fixed md:static inset-y-0 left-0 z-40 w-56 bg-gray-800 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <aside className="p-4 flex flex-col h-screen">
        <button
          className="md:hidden self-end mb-2 text-gray-300 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-gray-200 mb-2">Apartados</h2>

        <div className="flex-1 overflow-y-auto pr-1 sidebar-scroll space-y-1">
          {sections.map((sec, idx) => (
            <button
              key={sec.name}
              onClick={() => {
                setCurrentSectionIndex(idx);
                setSelectedIndex(idx);
              }}
              className={`w-full text-left p-2 rounded transition-colors ${
                idx === currentSectionIndex
                  ? "bg-blue-600 text-white"
                  : selectedIndex === idx
                  ? "bg-gray-600 text-white"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              {sec.name}
            </button>
          ))}
        </div>

        {/* Botones de acciones para la sección seleccionada */}
        {selectedIndex !== null && (
          <div className="mt-2 flex flex-col gap-2">
            <button
              onClick={handleMoveUp}
              className="w-full p-1 bg-gray-600 hover:bg-gray-500 text-white rounded"
            >
              ↑ Mover arriba
            </button>
            <button
              onClick={handleMoveDown}
              className="w-full p-1 bg-gray-600 hover:bg-gray-500 text-white rounded"
            >
              ↓ Mover abajo
            </button>
          </div>
        )}

        <div className="mt-4 sticky bottom-0 bg-gray-800 pt-2 pb-1 flex flex-col gap-2">
          <button
            onClick={onEditSections}
            className="w-full flex items-center justify-center gap-2 p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
          >
            🖉 Editar apartados
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
