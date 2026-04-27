import { useState } from "react";

export default function ReplyInput({ onSend }) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (value.trim()) {
      onSend?.(value);
      setValue("");
    }
  };

  return (
    <div className="flex w-full items-center gap-2 mt-2">
      <input
        type="text"
        className="flex-1 border rounded px-2 py-1 text-[14px]"
        placeholder="Escribe tu respuesta..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button
        className="px-3 py-1 bg-blue-500 text-white rounded"
        onClick={handleSend}
        type="button"
      >
        Enviar
      </button>
    </div>
  );
}
