import { useMemo, useState } from "react";
import { ParentChildContext } from "./ParentChildContextObject";
import { CHILDREN_DATA } from "@data/mockParentData";

export function ParentChildProvider({ children }) {
  const [selectedChildId, setSelectedChildId] = useState(
    CHILDREN_DATA[0]?.id ?? null,
  );

  const selectedChild = useMemo(
    () => CHILDREN_DATA.find((child) => child.id === selectedChildId) ?? null,
    [selectedChildId],
  );

  const value = {
    availableChildren: CHILDREN_DATA,
    selectedChild,
    selectedChildId,
    setSelectedChildId,
  };

  return (
    <ParentChildContext.Provider value={value}>
      {children}
    </ParentChildContext.Provider>
  );
}
