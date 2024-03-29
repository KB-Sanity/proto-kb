export interface Point2D {
  x: number;
  y: number;
}

export interface KeyCapSize {
  width: number;
  height: number;
}

export interface AppSettings {
  /** Size of 1u in px */
  unitSize: number;
  /** Keycap corner radius in relative to unitSize */
  keyCapCornerRadius: number;
}
