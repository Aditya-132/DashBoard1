import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FaMagnifyingGlass } from "react-icons/fa6";
import './AddNewAdmin'

const SearchBar = ({ value, onChange, handleSearch, onClearSearch }) => {
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch(); // Trigger search on Enter key press
    }
  };
  return (
    <div className="w-90 h-28 overflow-hidden flex items-center px-4 bg-slate-100 rounded-full  h-24">
      <input
        type="text"
        placeholder="Search Notes"
        className="w-full text-lg bg-transparent py-[11px] outline-none "
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyPress} // Call the function on key press
        aria-label="Search notes" // Accessibility enhancement
      />
      {value && (
        <AiOutlineClose
          className="text-gray-500 ml-2 cursor-pointer"
          onClick={onClearSearch}
        />
      )}
      <button className="bg-white" onClick={handleSearch} aria-label="Search">
        <FaMagnifyingGlass />
      </button>
    </div>
  );
};

export default SearchBar;
