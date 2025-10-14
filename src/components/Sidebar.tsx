import React from "react";
import { Section } from "../types";

interface SidebarProps {
  sections: Section[];
  currentSectionIndex: number;
  setCurrentSectionIndex: (index: number) => void;
  onEditSections: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sections,
  currentSectionIndex,
  setCurrentSectionIndex,
  onEditSections,
}) => {
  return (
    <aside className="w-56 bg-gray-800 p-4 flex flex-col h-screen">
      <h2 className="text-lg font-bold text-gray-200 mb-2">Apartados</h2>

      {/* Contenedor desplazable */}
      <div className="flex-1 overflow-y-auto pr-1 sidebar-scroll">
        {sections.map((sec, idx) => (
          <button
            key={sec.name}
            onClick={() => setCurrentSectionIndex(idx)}
            className={`w-full text-left p-2 mb-1 rounded transition-colors ${
              idx === currentSectionIndex
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-700 text-gray-300"
            }`}
          >
            {sec.name}
          </button>
        ))}
      </div>

      {/* Botón fijo abajo */}
      <div className="mt-4 sticky bottom-0 bg-gray-800 pt-2 pb-1">
        <button
          onClick={onEditSections}
          className="w-full flex items-center justify-center gap-2 p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
        >
          🖉 Editar apartados
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;