import { createContext } from "react";

export const contextDefaultValues = {
  overrides: {},
};

export const MutableWebContext = createContext(contextDefaultValues);
