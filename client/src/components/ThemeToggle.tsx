import React from 'react';
import styled from 'styled-components';
import { useTheme } from "@/lib/theme-context";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  // Handle the mounted state to avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <StyledWrapper>
        <label className="switch">
          <div className="slider" />
        </label>
      </StyledWrapper>
    );
  }

  const isDark = theme === "dark";

  return (
    <StyledWrapper>
      <label className="switch">
        <input 
          type="checkbox" 
          checked={isDark}
          onChange={() => toggleTheme()}
        />
        <span className="slider" />
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* The switch - the box around the slider */
  .switch {
    font-size: 17px;
    position: relative;
    display: inline-block;
    width: 3.5em;
    height: 2em;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    border: 2px solid #bf953f;
    border-radius: 50px;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    background-color: transparent;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 1.4em;
    width: 1.4em;
    left: 0.2em;
    bottom: 0.2em;
    background-color: #bf953f;
    border-radius: inherit;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
  }

  .switch input:checked + .slider {
    box-shadow: 0 0 15px rgba(191, 149, 63, 0.5);
    border: 2px solid #fde68a;
  }

  .switch input:checked + .slider:before {
    transform: translateX(1.5em);
    background-color: #fde68a;
  }
`;

export default ThemeToggle;
