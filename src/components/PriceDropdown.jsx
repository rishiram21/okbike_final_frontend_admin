import React, { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const Dropdown = ({ name, icon, submenu, activeLink, setActiveLink }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div>
      <button
        className={`w-full flex justify-between items-center py-2 px-5 hover:bg-gray-100 hover:text-indigo-500 ${
          isOpen ? "bg-indigo-100 text-indigo-500" : ""
        }`}
        onClick={toggleDropdown}
      >
        <div className="flex items-center space-x-5">
          <span>{icon && icon()}</span>
          <span className="text-sm text-gray-500 hidden md:flex">{name}</span>
        </div>
        <span className="hidden md:flex">
          {isOpen ? <FaChevronDown /> : <FaChevronRight />}
        </span>
      </button>
      {isOpen && (
        <ul className="mt-2 ml-8 space-y-2">
          {submenu.map((submenuItem) => (
            <li key={submenuItem.id}>
              <Link
                to={submenuItem.path}
                className="block text-sm text-gray-500 py-1 px-2 hover:text-indigo-500 hover:bg-gray-100 rounded-md"
                onClick={() => setActiveLink(submenuItem.id)}
              >
                {submenuItem.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
