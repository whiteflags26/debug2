export interface FeatureContent {
  id: number;
  imgPath: string;
  heading: string;
  content: {
    title: string;
    description: string[];
  };
}

export interface TextParallaxContentProps {
  imgPath: string;
  heading: string;
  children: React.ReactNode;
}

export interface StickyImageProps {
  imgPath: string;
}

export interface OverlayCopyProps {
  heading: string;
}

export interface ExampleContentProps {
  content: {
    title: string;
    description: string[];
  };
}