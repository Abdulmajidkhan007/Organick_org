import { motion, useScroll } from 'motion/react'

export const ScrollIndicator = () => {
    const { scrollYProgress } = useScroll()  
    return (
    <>
      <motion.div
        id="scroll-indicator"
        style={{
          scaleX: scrollYProgress,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          originX: 0,
          zIndex: "100",
          backgroundColor: "#274C5B",
        }}
      />
    </>
  );
};
