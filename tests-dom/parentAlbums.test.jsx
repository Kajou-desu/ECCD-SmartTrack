import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useParentAlbumsState } from "@features/eventPhotos/hooks/useParentAlbumsState";

const mockGetAlbums = vi.fn();
const mockUseParentChild = vi.fn();

vi.mock("@api/client.js", () => ({
  apiClient: { getAlbums: mockGetAlbums },
}));

vi.mock("@hooks/useParentChild", () => ({
  useParentChild: () => mockUseParentChild(),
}));

describe("parent photo gallery albums", () => {
  beforeEach(() => {
    mockGetAlbums.mockReset();
    mockUseParentChild.mockReset();
  });

  it("keeps shared school albums visible even when no childIds are attached to the album", async () => {
    mockUseParentChild.mockReturnValue({ selectedChildId: 42 });
    mockGetAlbums.mockResolvedValue([
      { id: 1, title: "Welcome Day", category: "School", description: "", createdAt: "2026-09-01T00:00:00Z", photos: [] },
      { id: 2, title: "Field Trip", category: "Trip", description: "", createdAt: "2026-09-05T00:00:00Z", photos: [] },
    ]);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useParentAlbumsState(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.albums).toHaveLength(2);
    expect(result.current.albums.map((album) => album.id)).toEqual([1, 2]);
  });
});
