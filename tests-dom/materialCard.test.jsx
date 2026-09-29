import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import LearningMaterialCard from "@features/materials/components/MaterialCard";

afterEach(cleanup);

describe("LearningMaterialCard", () => {
  it("shows the uploaded image as a thumbnail when the material has an image file", () => {
    const material = {
      id: 1,
      title: "Shapes worksheet",
      category: "Math",
      description: "Learn about shapes.",
      createdAt: "2026-01-01T00:00:00.000Z",
      fileUrl: "https://example.com/uploads/shapes-worksheet.jpg",
    };

    render(
      <LearningMaterialCard
        material={material}
        onView={() => {}}
        onUpload={() => {}}
        onViewWorks={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    const thumb = screen.getByAltText("Thumbnail for Shapes worksheet");
    expect(thumb.getAttribute("src")).toBe(material.fileUrl);
  });
});
