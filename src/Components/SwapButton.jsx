import React from "react";
import { ArrowLeftRight } from "lucide-react"; // Optional icon from lucide-react

function SwapButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded shadow-sm text-sm font-medium transition"
    >
      <ArrowLeftRight className="w-4 h-4" />
      Swap Units
    </button>
  );
}

export default SwapButton;
