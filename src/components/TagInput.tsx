import React, { useState } from "react";

interface TagInputProps {
  onAdd: (text: string) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ onAdd, placeholder = "Nuevo elemento" }) => {
  const [input, setInput] = useState("");
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 p-1 rounded bg-gray-700 border border-gray-600"
      />
      <button
        onClick={() => {
          if (input.trim()) {
            onAdd(input.trim());
            setInput("");
          }
        }}
        className="bg-green-600 hover:bg-green-700 text-white px-3 rounded"
      >
        Añadir
      </button>
    </div>
  );
};

export default TagInput;
