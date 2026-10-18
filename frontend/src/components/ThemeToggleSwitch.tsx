import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggleSwitch: React.FC = () => {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsLight(true);
      document.documentElement.classList.add("light");
    } else {
      setIsLight(false);
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    if (isLight) {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
      setIsLight(false);
    } else {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
      setIsLight(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised transition-colors cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      title={isLight ? "Switch to dark theme" : "Switch to light theme"}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
    >
      {isLight ? (
        <Sun className="w-5 h-5 text-accent" />
      ) : (
        <Moon className="w-5 h-5 text-text" />
      )}
    </button>
  );
};
