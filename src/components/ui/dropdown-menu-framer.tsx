"use client";

import { ChevronDown } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type DropdownOption = {
  label: string;
  onClick: () => void;
  Icon?: React.ReactNode;
  active?: boolean;
  count?: React.ReactNode;
};

export type DropdownMenuProps = {
  options: DropdownOption[];
  children: React.ReactNode;
};

const DropdownMenu = ({ options, children }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="px-4 py-2 flex items-center justify-between gap-2 bg-background hover:bg-foreground/5 shadow-sm border border-foreground/20 rounded-xl backdrop-blur-sm transition-all"
      >
        {children ?? "Menu"}
        <motion.span
          className="ml-2 shrink-0"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut", type: "spring" }}
        >
          <ChevronDown className="h-4 w-4 text-foreground/50" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: -5, scale: 0.95, filter: "blur(10px)", opacity: 0 }}
            animate={{ y: 0, scale: 1, filter: "blur(0px)", opacity: 1 }}
            exit={{ y: -5, scale: 0.95, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: "circInOut", type: "spring" }}
            className="absolute z-50 w-64 mt-2 p-1 bg-background border border-foreground/10 rounded-xl shadow-lg backdrop-blur-sm flex flex-col gap-1 overflow-hidden"
          >
            {options && options.length > 0 ? (
              options.map((option, index) => (
                <motion.button
                  initial={{
                    opacity: 0,
                    x: 10,
                    scale: 0.95,
                    filter: "blur(10px)",
                  }}
                  animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{
                    opacity: 0,
                    x: 10,
                    scale: 0.95,
                    filter: "blur(10px)",
                  }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(index * 0.05, 0.3), // cap delay so it doesn't take forever
                    ease: "easeInOut",
                    type: "spring",
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  key={option.label}
                  onClick={() => {
                    option.onClick();
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2.5 cursor-pointer text-sm rounded-lg w-full text-left flex items-center justify-between gap-x-2 transition-colors ${
                    option.active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/80 hover:bg-foreground/5"
                  }`}
                >
                  <div className="flex items-center gap-x-2">
                    {option.Icon}
                    {option.label}
                  </div>
                  {option.count !== undefined && (
                    <span
                      className={`text-xs ${
                        option.active
                          ? "text-primary/70 font-bold"
                          : "text-foreground/40 font-medium"
                      }`}
                    >
                      {option.count}
                    </span>
                  )}
                </motion.button>
              ))
            ) : (
              <div className="px-4 py-2 text-foreground/50 text-xs">No options</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { DropdownMenu };
