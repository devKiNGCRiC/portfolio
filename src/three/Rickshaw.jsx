import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { Clay } from './clay'
import { C } from './palette'

/*
  A clay auto-rickshaw: green body, yellow canopy, three wheels.
  Front faces +x. `speedRef.current` (units/sec) spins the wheels.
*/
function Wheel({ position, wheelRef }) {
  return (
    <group position={position}>
      <group ref={wheelRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.13, 18]} />
          <Clay color={C.ink} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.15, 10]} />
          <Clay color="#b9bfca" />
        </mesh>
        {/* a spoke, so you can see it turn */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[0.3, 0.03, 0.01]} />
          <Clay color={C.saffron} />
        </mesh>
      </group>
    </group>
  )
}

export default function Rickshaw({ speedRef, onClick, children, ...props }) {
  const w0 = useRef()
  const w1 = useRef()
  const w2 = useRef()
  const body = useRef()

  useFrame((state, dt) => {
    const v = speedRef?.current ?? 0
    for (const w of [w0, w1, w2]) if (w.current) w.current.rotation.z -= (v / 0.2) * dt
    // engine judder: a tiny idle wobble, bigger while moving
    if (body.current) {
      const t = state.clock.elapsedTime
      body.current.position.y = Math.abs(Math.sin(t * (v ? 22 : 9))) * (v ? 0.025 : 0.008)
    }
  })

  return (
    <group
      {...props}
      onClick={
        onClick &&
        ((e) => {
          e.stopPropagation()
          onClick()
        })
      }
    >
      <Wheel position={[0.78, 0.2, 0]} wheelRef={w0} />
      <Wheel position={[-0.52, 0.2, 0.5]} wheelRef={w1} />
      <Wheel position={[-0.52, 0.2, -0.5]} wheelRef={w2} />

      <group ref={body}>
        {/* chassis */}
        <RoundedBox args={[1.75, 0.16, 0.98]} radius={0.05} position={[0, 0.38, 0]} castShadow>
          <Clay color={C.ink} />
        </RoundedBox>
        {/* rear cabin */}
        <RoundedBox args={[0.95, 0.56, 1.06]} radius={0.1} position={[-0.38, 0.72, 0]} castShadow>
          <Clay color={C.green} />
        </RoundedBox>
        <RoundedBox args={[0.97, 0.06, 1.08]} radius={0.02} position={[-0.38, 0.62, 0]}>
          <Clay color={C.white} />
        </RoundedBox>
        {/* passenger seat */}
        <RoundedBox args={[0.5, 0.12, 0.92]} radius={0.05} position={[-0.52, 1.04, 0]}>
          <Clay color={C.saffron} />
        </RoundedBox>
        {/* front cowl */}
        <RoundedBox args={[0.46, 0.66, 0.56]} radius={0.12} position={[0.74, 0.7, 0]} castShadow>
          <Clay color={C.green} />
        </RoundedBox>
        <mesh position={[0.98, 0.84, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.06, 16]} />
          <meshStandardMaterial color="#fff6c4" emissive="#ffe27a" emissiveIntensity={0.8} />
        </mesh>
        {/* number plate */}
        <RoundedBox args={[0.02, 0.1, 0.24]} radius={0.01} position={[0.98, 0.58, 0]}>
          <Clay color={C.yellow} />
        </RoundedBox>
        {/* handlebar */}
        <mesh position={[0.46, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
          <Clay color={C.ink} />
        </mesh>
        {/* windscreen */}
        <mesh position={[0.62, 1.3, 0]} rotation={[0, Math.PI / 2, 0.12]}>
          <planeGeometry args={[0.95, 0.55]} />
          <meshStandardMaterial color={C.sky} transparent opacity={0.45} roughness={0.1} side={2} />
        </mesh>
        {/* canopy posts */}
        {[
          [0.6, 0.52],
          [0.6, -0.52],
          [-0.8, 0.52],
          [-0.8, -0.52],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 1.2, z]}>
            <cylinderGeometry args={[0.025, 0.025, 0.9, 6]} />
            <Clay color={C.ink} />
          </mesh>
        ))}
        {/* canopy */}
        <RoundedBox args={[1.65, 0.16, 1.18]} radius={0.07} position={[-0.08, 1.66, 0]} castShadow>
          <Clay color={C.yellow} />
        </RoundedBox>
        <RoundedBox args={[1.5, 0.1, 1.2]} radius={0.04} position={[-0.08, 1.56, 0]}>
          <Clay color={C.ink} />
        </RoundedBox>
        <RoundedBox args={[0.1, 0.7, 1.12]} radius={0.04} position={[-0.86, 1.22, 0]} castShadow>
          <Clay color={C.yellow} />
        </RoundedBox>
        {children}
      </group>
    </group>
  )
}
