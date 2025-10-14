import React from "react";
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
  return (
    // 🔹 Contenedor externo: controla visibilidad y animación
    <div
      className={`fixed md:static inset-y-0 left-0 z-40 w-56 bg-gray-800 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <aside className="p-4 flex flex-col h-screen">
        {/* 🔹 Botón cerrar (solo móvil) */}
        <button
          className="md:hidden self-end mb-2 text-gray-300 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>

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
    </div>
  );
};

export default Sidebar;
