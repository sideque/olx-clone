import React, { useState, useContext } from "react";
import "./Navbar.css";
import { ThemeContext } from "../../context/ThemeContext";
import addBtn from "../../assets/addButton.png";
import logo from "../../assets/symbol.png";
import search from "../../assets/search1.svg";
import arrow from "../../assets/arrow-down.svg";
import searchWt from "../../assets/search.svg";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, logout } from "../Firebase/Firebase";
import { Link } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";

const Navbar = (props) => {
  const [user] = useAuthState(auth);
  const { toggleModal, toggleModalSell } = props;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <div>
      <nav
        className={`fixed z-50 w-full p-2 shadow-md border-b-4 ${darkMode ? "bg-slate-900 text-white" : "bg-slate-100"}`}>
        <Link to="/" className="flex-shrink-0">
          <img src={logo} alt="OLX Home" className="w-12" />
        </Link>

        <div className="relative location-search ml-5">
          <img src={search} alt="" className="absolute top-4 left-2 w-5" />
          <input
            placeholder="Search city, area, or locality..."
            className="w-[50px] sm:w-[150px] md:w-[250px] lg:w-[270px] p-3 pl-8 pr-8 border-black border-solid border-2 rounded-md placeholder:text-ellipsis focus:outline-none focus:border-teal-300"
            type="text"
          />
          <img
            src={arrow}
            alt=""
            className="absolute top-4 right-3 w-5 cursor-pointer"
          />
        </div>

        <div className="ml-5 mr-2 relative w-full main-search">
          <input
            placeholder="Find Cars, Mobile Phones, and More..."
            className="w-full p-3 border-black border-solid border-2 rounded-md placeholder:text-ellipsis focus:outline-none focus:border-teal-300"
            type="text"
          />
          <div
            style={{ backgroundColor: "#002f34" }}
            className="flex justify-center items-center absolute top-0 right-0 h-full rounded-e-md w-12"
          >
            <img
              className="w-5 filter invert"
              src={searchWt}
              alt="Search Icon"
            />
          </div>
        </div>

        <div className="mx-1 sm:ml-5 sm:mr-5 relative lang">
          <p className="font-bold mr-3">English</p>
          <img src={arrow} className="w-5 cursor-pointer" alt="" />
        </div>

        <button
          onClick={toggleDarkMode}
          className="ml-3 text-xl cursor-pointer"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        {!user ? (
          <p
            onClick={user ? toggleModalSell : toggleModal}
            className="font-bold underline ml-5 cursor-pointer"
            style={{ color: "#002f34" }}
          >
            Login
          </p>
        ) : (
          <div className="flex items-center gap-4 ml-5">
            <Link
              to="/my-ads"
              className="font-bold"
              style={{ color: "#002f34" }}
            >
              My Ads
            </Link>
            <div className="relative cursor-pointer">
              <p
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ color: "#002f34" }}
                className="font-bold"
              >
                {user.displayName?.split(" ")[0]}
              </p>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <p onClick={handleLogout}>Logout</p>
                </div>
              )}
            </div>
          </div>
        )}

        <img
          src={addBtn}
          onClick={user ? toggleModalSell : toggleModal}
          className="w-24 mx-1 sm:ml-5 sm:mr-5 shadow-xl rounded-full cursor-pointer"
          alt=""
        />
      </nav>

      <div className="w-full relative z-0 flex shadow-md p-2 pt-20 pl-10 pr-10 sm:pl-44 md:pr-44 sub-lists">
        <ul className="list-none flex items-center justify-between w-full">
          <div className="flex flex-shrink-0">
            <p className="font-semibold uppercase all-cats"> All categories</p>
            <img className="w-4 ml-2" src={arrow} alt="" />
          </div>

          <li>Cars</li>
          <li>Motorcycles</li>
          <li>Mobile Phones</li>
          <li>For sale : Houses & Apartments</li>
          <li>Scooter</li>
          <li>Commercial & Other Vehicles</li>
          <li>For rent : Houses & Apartments</li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
