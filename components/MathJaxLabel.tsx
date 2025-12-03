import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    MathJax: any;
  }
}

interface MathJaxLabelProps {
  latex: string;
  className?: string;
  color?: string;
}

export const MathJaxLabel: React.FC<MathJaxLabelProps> = React.memo(
  ({ latex, className, color }) => {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      let isMounted = true;

      const typeset = async () => {
        if (!window.MathJax) return;

        // Check ref before starting
        if (!ref.current) return;

        // Clear previous content safely
        ref.current.innerHTML = "";

        const mathEl = document.createElement("span");
        // Set text content to LaTeX string wrapped in delimiters
        mathEl.innerText = `$${latex}$`;

        // Append to DOM
        if (ref.current) {
          ref.current.appendChild(mathEl);
        }

        try {
          await window.MathJax.typesetPromise([mathEl]);

          // After await, check if still mounted and ref exists before accessing DOM
          if (isMounted && ref.current && color) {
            const svg = ref.current.querySelector("svg");
            if (svg) {
              svg.style.fill = color;
              // Ensure SVG uses current color for fills
              svg.style.color = color;
              // Override internal path fills to match the requested color
              const paths = svg.querySelectorAll("path, rect, polygon");
              paths.forEach((p: SVGElement) => {
                p.style.fill = color;
              });
            }
          }
        } catch (err) {
          // Suppress errors that occur if unmounted during render
          if (isMounted) {
            console.warn("MathJax Typeset Warning:", err);
          }
        }
      };

      typeset();

      return () => {
        isMounted = false;
      };
    }, [latex, color]);

    return (
      <span
        ref={ref}
        className={`inline-block align-middle ${className || ""}`}
        style={{ color }}
      ></span>
    );
  },
);
