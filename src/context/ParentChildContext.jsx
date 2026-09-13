import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ParentChildContext } from "./parentChildContextObject";
import { apiClient } from "@api/client.js";

async function fetchChildren() {
  const data = await apiClient.getChildren();
  return Array.isArray(data) ? data : Array.isArray(data?.children) ? data.children : [];
}

export function ParentChildProvider({ children }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["children"],
    queryFn: fetchChildren,
  });

  const availableChildren = useMemo(() => data ?? [], [data]);
  const childrenLoading = isLoading;
  const childrenError = isError;

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
    childrenError,
    retryChildren: refetch,
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
