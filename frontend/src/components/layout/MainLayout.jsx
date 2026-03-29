import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'

const MainLayout = () => {
  return (
    /* 1. overflow-x-hidden ensures no horizontal scrollbars */
    /* 2. w-screen + max-w-full ensures 100% width coverage */
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-blue-100 selection:text-blue-700 w-full overflow-x-hidden">
      
      {/* Navbar logic: Header ko hata kar direct Navbar use karein, 
          kyunki humne Navbar ke andar pehle hi sticky aur blur handle kiya hai.
      */}
      <Navbar />

      {/* Main Content Area - Added padding-top to account for fixed navbar */}
      <main className="flex-grow w-full flex flex-col">
        {/* 
          Added pt-20 for mobile (64px) and lg:pt-24 for desktop (96px) 
          This ensures all content starts below the fixed navbar
        */}
        <div className="w-full flex-grow transition-all duration-700 ease-in-out pt-20 lg:pt-24">
          <Outlet />
        </div>
      </main>

      {/* Footer: Full width border and background */}
      <footer className="w-full bg-white border-t border-slate-200 mt-auto">
        <Footer />
      </footer>
    </div>
  )
}

export default MainLayout