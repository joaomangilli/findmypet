import React from "react";

// next/dynamic mock: immediately returns the component (no lazy loading in tests)
const dynamic = (fn: () => Promise<{ default: React.ComponentType }>) => {
  let Component: React.ComponentType | null = null;

  const DynamicWrapper = (props: Record<string, unknown>) => {
    if (!Component) return null;
    return <Component {...props} />;
  };

  fn().then((mod) => { Component = mod.default; });
  return DynamicWrapper;
};

export default dynamic;
