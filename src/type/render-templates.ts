export type RenderCardType = {
    title: string;
    contentValue:string;
    variance?:string;
    icon:any;
    renderedFrom?: string
};

export type RenderAppCardType = {
    name: string;
    icon: any;
};

export type coordinatesAndSize = {
    col: number;
    row: number;
    x: number;
    y: number;
}

export type BarChartComponentProps = {
    data: any[];
    dataKey: string[];
    title: string;
    description?: string;
    xAxisKey: string;
    footerTitle?: string;
    footerDescription?: string;
    orientation?: "vertical" | "horizontal";
    showLabel: boolean;
    isStack?: boolean;
    renderedFrom?:string;
  }
  
  export type PieChartComponentProps = {
    data: any[];
    title: string;
    description?: string;
    dataKey: string;
    nameKey: string;
    footer?: string;
    isDonut?: boolean
    isLabel?: boolean
    isLegend?: boolean
    activeItem?: number
  }
  
  export type LineChartComponentProps = {
    data: any[];
    dataKey: string[];
    type: "linear" | "monotone" | "step" | "natural";
    title: string;
    description: string;
    footerDescription: string;
    dot: boolean;
    label: boolean;
  }