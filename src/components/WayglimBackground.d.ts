import type { CSSProperties, FC } from 'react';

export interface WayglimBackgroundProps {
  className?: string;
  style?: CSSProperties;
  layout?: 'fill' | 'block';
  paused?: boolean;
  label?: string;
}

declare const WayglimBackground: FC<WayglimBackgroundProps>;
export default WayglimBackground;
