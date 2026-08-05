"use client";

import { ChevronDown } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

/**
 * Dropdown com animação de abrir/fechar via transições CSS puras.
 * Sem framer-motion — o projeto usa motor único GSAP + Lenis (ADR-021).
 * O painel fica sempre montado e alterna opacidade/transform/filter, o que
 * dá o efeito de entrada e saída sem precisar de AnimatePresence.
 */

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
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
};

const DropdownMenu = ({ options, children, className, triggerClassName, menuClassName }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen((v) => !v);
  };

  // Fecha ao clicar fora
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
    <div className={`relative ${className || ''}`} ref={containerRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`px-4 py-2 flex items-center justify-between gap-2 bg-background hover:bg-foreground/5 shadow-sm border border-foreground/20 rounded-xl backdrop-blur-sm transition-all ${triggerClassName || ''}`}
      >
        {children ?? "Menu"}
        <span
          className="ml-2 shrink-0 transition-transform duration-300 ease-in-out"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <ChevronDown className="h-4 w-4 text-foreground/50" />
        </span>
      </button>

      <div
        role="menu"
        aria-hidden={!isOpen}
        className={`absolute z-50 mt-2 p-1 bg-background border border-foreground/10 rounded-xl shadow-lg backdrop-blur-sm flex flex-col gap-1 overflow-hidden ${menuClassName || 'w-64'}`}
        style={{
          transition:
            "opacity 0.3s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.96)",
          filter: isOpen ? "blur(0px)" : "blur(10px)",
          transformOrigin: "top center",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {options && options.length > 0 ? (
          options.map((option, index) => (
            <button
              type="button"
              key={option.label}
              role="menuitem"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
              style={{
                transition: "opacity 0.3s ease, transform 0.3s ease",
                transitionDelay: isOpen ? `${Math.min(index * 0.04, 0.24)}s` : "0s",
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? "translateX(0)" : "translateX(8px)",
              }}
              className={`px-3 py-2.5 cursor-pointer text-sm rounded-lg w-full text-left flex items-center justify-between gap-x-2 transition-colors active:scale-[0.98] ${
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
            </button>
          ))
        ) : (
          <div className="px-4 py-2 text-foreground/50 text-xs">No options</div>
        )}
      </div>
    </div>
  );
};

export { DropdownMenu };
