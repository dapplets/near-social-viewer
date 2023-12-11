import { useContext } from "react";

import { MutableWebContext } from "./MutableWebContext";

export function useMutableWeb() {
  return useContext(MutableWebContext);
}
