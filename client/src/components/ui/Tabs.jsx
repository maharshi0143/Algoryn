import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";

function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  tabClassName,
  panelClassName,
  ...props
}) {
  const isControlled = activeTab !== undefined;
  const [internalTab, setInternalTab] = useState(0);
  const currentTab = isControlled ? activeTab : internalTab;

  const handleTabClick = (index) => {
    if (!isControlled) setInternalTab(index);
    onChange?.(index);
  };

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "3px solid #000",
        }}
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={cn(
              "relative font-heading font-bold cursor-pointer bg-transparent transition-colors duration-200",
              tabClassName
            )}
            style={{
              padding: "12px 20px",
              fontSize: "14px",
              border: "none",
              borderBottom: "none",
              color:
                currentTab === index
                  ? "var(--color-dark)"
                  : "#888",
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              background: "transparent",
            }}
          >
            {tab.label}
            {currentTab === index && (
              <motion.div
                layoutId="tab-underline"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: "var(--color-dark)",
                }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className={cn("pt-4", panelClassName)}
        >
          {tabs[currentTab]?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Tabs;
