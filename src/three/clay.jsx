/* Shared clay materials. Colours live in ./palette.js */


export function Clay({ color, ...props }) {
  return <meshStandardMaterial color={color} roughness={0.8} metalness={0} flatShading {...props} />
}

/** Soft (non-faceted) clay, for round things like heads and hands. */
export function SoftClay({ color, ...props }) {
  return <meshStandardMaterial color={color} roughness={0.7} metalness={0} {...props} />
}
