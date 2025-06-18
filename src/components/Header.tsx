import React from 'react'
import { MenuIcon, MoonIcon, SunIcon } from 'lucide-react'

// Define props for the Header component
interface HeaderProps {
  toggleSidebar: () => void // Function to toggle sidebar visibility
  toggleFocusMode: () => void // Function to toggle focus mode
  focusMode: boolean // Current focus mode state
}

export const Header: React.FC<HeaderProps> = ({
  toggleSidebar,
  toggleFocusMode,
  focusMode,
}) => {
  return (
    <header className="bg-vellum border-b border-vellum-dark shadow-parchment">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          {/* Button to toggle sidebar visibility */}
          <button
            onClick={toggleSidebar}
            className="mr-4 p-2 rounded-md hover:bg-vellum-dark transition-colors"
            aria-label="Toggle sidebar"
          >
            <MenuIcon size={20} className="text-ink" />
          </button>
          {/* Application logo and title */}
          <div className="flex items-center">
            <div className="relative h-10 w-10 mr-3">
              <div className="absolute inset-0 bg-navy rounded-full border-2 border-illuminated-gold flex items-center justify-center">
                <span className="text-white font-serif text-lg font-medium">
                  SV
                </span>
              </div>
            </div>
            <div>
              <h1 className="font-serif text-xl text-ink">Semina Verbi</h1>
              <p className="text-xs text-ink-light">Workspace Agent</p>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {/* Button to toggle focus mode */}
          <button
            onClick={toggleFocusMode}
            className="p-2 rounded-md hover:bg-vellum-dark transition-colors"
            aria-label="Toggle focus mode"
          >
            {/* Display MoonIcon for entering focus mode, SunIcon for exiting */}
            {focusMode ? (
              <SunIcon size={20} className="text-ink" />
            ) : (
              <MoonIcon size={20} className="text-ink" />
            )}
            <span className="sr-only">
              {focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
