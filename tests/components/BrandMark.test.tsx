import { render } from "@testing-library/react";
import { BrandMark } from "@/components/brand/BrandMark";

describe("BrandMark", () => {
  it("renders an SVG with aria-hidden", () => {
    const { container } = render(<BrandMark />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts a custom size", () => {
    const { container } = render(<BrandMark size={64} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "64");
    expect(svg).toHaveAttribute("height", "64");
  });

  it("defaults to size 32", () => {
    const { container } = render(<BrandMark />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
  });

  it("uses bmj-white for the nib hole (never raw white)", () => {
    const { container } = render(<BrandMark color="var(--bmj-red)" />);
    const circle = container.querySelector("circle");
    expect(circle).toHaveAttribute("fill", "#F2EDE4");
  });
});
