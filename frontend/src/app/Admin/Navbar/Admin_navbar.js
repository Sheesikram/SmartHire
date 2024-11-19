"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faUserMinus,
  faChartBar,
  faSignOutAlt,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import axios from "axios";
import "../../globals.css";
import bgImage from "../../Photos/bg.png";

const AdminNavbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      await axios.post("http://127.0.0.1:3001/logout/", {}, { withCredentials: true });
      router.push("/Users/SignIn");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="relative">
      {/* Navbar */}
      <nav className="bg-white shadow-md fixed top-0 w-full z-50 border-b border-gray-200">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo and Admin Panel Title */}
          <div className="flex items-center space-x-4">
            <img
              src={bgImage.src}
              alt="Logo"
              className="h-10 w-10 rounded-full"
            />
            <span className="text-xl font-semibold text-gray-800">Admin Panel</span>
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleDrawer}
            className="text-gray-700 hover:text-blue-500 focus:outline-none transition duration-300"
            aria-label="Toggle Menu"
          >
            <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Drawer Navigation */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-md z-40 transition-transform duration-300 ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full w-64 py-4">
          {/* Drawer Header */}
          <div className="flex items-center px-4 mb-6">
            <img
              src={bgImage.src}
              alt="Logo"
              className="h-10 w-10 rounded-full mr-4"
            />
            <span className="text-lg font-semibold text-gray-800">Admin Panel</span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-4 px-4">
            <DrawerLink
              icon={faUserMinus}
              label="Delete People"
              path="/Admin/deleteusers"
              router={router}
            />
            <DrawerLink
              icon={faDollarSign}
              label="Delete Subscriptions"
              path="/Admin/deletesubscription"
              router={router}
            />
            <DrawerLink
              icon={faChartBar}
              label="Analytics"
              path="/Admin/dashboard"
              router={router}
            />
          </div>

          {/* Logout Button */}
          <div className="mt-auto px-4">
            <button
              className="flex items-center space-x-2 text-gray-700 hover:bg-red-600 hover:text-white px-4 py-2 w-full transition duration-300 rounded-lg"
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay (for closing the drawer when clicking outside) */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={toggleDrawer}
        ></div>
      )}
    </div>
  );
};

// DrawerLink Component
const DrawerLink = ({ icon, label, path, router }) => (
  <button
    className="flex items-center space-x-4 text-gray-700 hover:bg-gray-200 hover:text-blue-500 px-4 py-2 transition duration-300 rounded-lg w-full text-left"
    onClick={() => router.push(path)}
  >
    <FontAwesomeIcon icon={icon} className="h-5 w-5" />
    <span className="font-medium">{label}</span>
  </button>
);

export default AdminNavbar;