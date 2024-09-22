import { useRef } from "react";

interface IHeroChartHeader {
  height: number;
  width: number;
}
export const HeroChartHeader = (props: IHeroChartHeader) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { height, width } = props;

  return (
    <div>
      <svg
        id="hero-chart-header"
        height={height}
        viewBox={[0, 0, width, height].join(",")}
        style={{
          height: "auto",
          fontSize: 10,
        }}
        width={width}
        className=""
        ref={svgRef}
      />
    </div>
  );
};
