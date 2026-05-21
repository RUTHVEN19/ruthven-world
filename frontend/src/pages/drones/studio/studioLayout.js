/**
 * studioLayout.js — Constants for the 3D Recording Studio
 * Pure data, no React/Three imports.
 */

export const ROOM = {
  width: 12,
  depth: 10,
  height: 4,
  wallThickness: 0.25,
};

export const CAMERA = {
  position: [0, 1.6, 3.8],
  target: [0, 1.5, -1],
  fov: 55,
};

export const MIXING_DESK = {
  position: [0, 0, 2.2],
  width: 4.2,
  depth: 1.4,
  height: 0.85,
};

export const MONITORS = {
  left: [-1.3, MIXING_DESK.height + 0.25, MIXING_DESK.position[2] - 0.3],
  right: [1.3, MIXING_DESK.height + 0.25, MIXING_DESK.position[2] - 0.3],
  width: 0.28,
  height: 0.38,
  depth: 0.28,
};

export const MIC_STAND = {
  position: [0, 0, -2.5],
};

export const DRUM_KIT = {
  position: [-3.2, 0, -2.5],
};

export const VOCAL_BOOTH = {
  position: [4.5, 0, -1.5],
  width: 2.8,
  depth: 2.8,
  height: 3.5,
};

export const EQUIPMENT_RACK = {
  position: [-5.2, 0, 0.5],
  width: 0.55,
  height: 2.8,
  depth: 0.45,
};
