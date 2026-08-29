import { useEffect, useMemo, useState } from "react";
import { ParentChildContext } from "./parentChildContextObject";
import { apiClient } from "@api/client.js";
import { withMockFallback } from "@api/mockFallback.js"; // MOCK_FALLBACK
import { CHILDREN_DATA } from "@data/mockParentData";

export function ParentChildProvider({ children }) {
  const [availableChildren, setAvailableChildren] = useState([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadChildren = async () => {
      setChildrenLoading(true);

      const { data } = await withMockFallback(
        () => apiClient.getChildren(),
        CHILDREN_DATA,
        { label: "ParentChildContext" },
      );

      if (!isMounted) return;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.children)
          ? data.children
          : CHILDREN_DATA;
      setAvailableChildren(list);
      setSelectedChildId((current) => current ?? list[0]?.id ?? null);
      setChildrenLoading(false);
    };

    loadChildren();

    return () => {
      isMounted = false;
    };
  }, []);

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
