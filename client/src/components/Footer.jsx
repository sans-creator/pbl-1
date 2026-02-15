import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white w-full mt-20">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center">
        {/* Left Section: Credits */}
        <div className="text-center md:text-left mb-6 md:mb-0">
          <p className="text-sm font-semibold">Made by <span className="text-orange-500"><a href='https://github.com/sans-creator'>Sanskar Jaiswal</a> & Utkarsh Mehra</span></p>
          <p className="text-lg text-gray-400">Under guidance of <span className="text-orange-500">Mr. Jay Shankar Sharma</span></p>
        </div>

        {/* Right Section: Optional Links */}
        {/* <div className="flex space-x-6">
          <a href="/" className="text-gray-400 hover:text-white transition">Home</a>
          <a href="/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</a>
          <a href="/admin/login" className="text-gray-400 hover:text-white transition">Admin</a>
        </div> */}
      </div>

      <div className="bg-gray-800 text-gray-500 text-center py-4 text-sm">
        &copy; {new Date().getFullYear()} Our University. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
