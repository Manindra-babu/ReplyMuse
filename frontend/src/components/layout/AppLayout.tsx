import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3E8] text-[#2B2B2B] relative overflow-hidden selection:bg-[#DCEBE3] selection:text-[#1F7A5C]">
      {/* Wavy decoration inside a relative overflow: hidden wrapper with pointer-events: none and low z-index */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden z-0"
        aria-hidden="true"
      >
        <div className="absolute bottom-0 right-0 opacity-20 hidden lg:block">
          <svg
            width="480"
            height="240"
            viewBox="0 0 480 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 200C120 140 260 230 380 170C430 145 460 110 480 70"
              stroke="#1F7A5C"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M30 230C160 170 290 250 410 195C445 175 470 140 480 100"
              stroke="#EE6A4B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
