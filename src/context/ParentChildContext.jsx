import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ParentChildContext } from "./parentChildContextObject";
import { apiClient } from "@api/client.js";
import { withMockFallback } from "@api/mockFallback.js"; // MOCK_FALLBACK
import { CHILDREN_DATA } from "@data/mockParentData";

async function fetchChildren() {
  const { data } = await withMockFallback(
    () => apiClient.getChildren(),
    CHILDREN_DATA,
    { label: "ParentChildContext" },
  );
  return Array.isArray(data)
    ? data
    : Array.isArray(data?.children)
      ? data.children
      : CHILDREN_DATA;
}

export function ParentChildProvider({ children }) {
  const { data, isLoading } = useQuery({
    queryKey: ["children"],
    queryFn: fetchChildren,
  });

  const availableChildren = useMemo(() => data ?? [], [data]);
  const childrenLoading = isLoading;

  const [manualSelectedChildId, setSelectedChildId] = useState(null);
  const selectedChildId =
    manualSelectedChildId ?? availableChildren[0]?.id ?? null;

  const selectedChild = useMemo(
    () =>
      availableChildren.find((child) => child.id === selectedChildId) ?? null,
    [availableChildren, selectedChildId],
  );

  const value = {
    availableChildren,
    childrenLoading,
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
