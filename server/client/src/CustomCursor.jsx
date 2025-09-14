import React, { useState, useEffect } from "react";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(true);
  const [clickButton, setClickButton] = useState(false);
  const [bigHeroButton, setBigHeroButton] = useState(false);
  const [porcupButton, setPorcupButton] = useState(false);

  useEffect(() => {
    // Updates cursor position
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    // Shows/Hides cursor based on mouse enter/leave
    const handleMouseEnter = () => setVisible(true);
    const handleMouseLeave = () => setVisible(false);

    // Detects hover effects on specific elements
    const handleMouseOver = (e) => {
      if (e.target.closest(".cur3")) {
        setClickButton(false);
        setBigHeroButton(true);
      } else if (e.target.closest(".cur2")) {
        setClickButton(false);
        setBigHeroButton(false);
        setPorcupButton(true);
      }
    };

    const handleMouseOut = (e) => {
      if (e.target.closest(".cur3")) {
        setBigHeroButton(false);
      } else if (e.target.closest(".cur2")) {
        setPorcupButton(false);
      }
    };

    // Click detection with offset for better accuracy
    const handleMouseDown = (e) => {
      const offsetX = Math.abs((position.x-10) - e.clientX);
      const offsetY = Math.abs((position.y-10) - e.clientY);

      if (offsetX < 15 && offsetY < 15) {
        setClickButton(true);
      }
    };

    const handleMouseUp = () => {
      setClickButton(false);
    };

    // Event listeners
    document.addEventListener("mousemove", updatePosition);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [position]);

  // Hide cursor when not visible
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: "30px",
        height: "30px",
        backgroundImage: `url(${clickButton ? "/cur7.gif" : bigHeroButton ? "/cur5.gif" : porcupButton ? "/cur2.gif" : "/cur.gif"})`,
        backgroundSize: "cover",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};

export default CustomCursor;
