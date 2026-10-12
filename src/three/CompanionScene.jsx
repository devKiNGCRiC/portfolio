import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { Clay } from './clay'
import { C, hoverCursor } from './palette'
import Avatar from './Avatar'
import Rickshaw from './Rickshaw'

/*
  The corner guide. Parked: KiNG stands beside the rickshaw in the section's pose.
  When `driveKey` changes: KiNG hops in, drives off-screen right, loops back in
  from the left, parks, and hops out in the new pose.
*/

const DUR = 1.7
const easeIn = (t) => t * t * t
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

function Road() {
  return (
    <group position={[0, -0.05, 0]}>
      <RoundedBox args={[9, 0.1, 1.9]} radius={0.04} receiveShadow>
        <Clay color="#3a3d46" />
      </RoundedBox>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-4 + i, 0.055, 0]}>
          <boxGeometry args={[0.45, 0.01, 0.07]} />
          <meshBasicMaterial color={C.yellow} />
        </mesh>
      ))}
      {/* grass verge + a highway milestone */}
      <RoundedBox args={[9, 0.12, 1.2]} radius={0.04} position={[0, -0.01, -1.5]}>
        <Clay color={C.greenBright} />
      </RoundedBox>
      <group position={[-1.3, 0.05, -1.25]}>
        <RoundedBox args={[0.28, 0.34, 0.12]} radius={0.05} position={[0, 0.17, 0]}>
          <Clay color={C.white} />
        </RoundedBox>
        <RoundedBox args={[0.29, 0.14, 0.13]} radius={0.06} position={[0, 0.33, 0]}>
          <Clay color={C.saffron} />
        </RoundedBox>
      </group>
      {[
        [1.6, -1.55],
        [2.4, -1.35],
        [-2.4, -1.5],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.05, z]} scale={0.8}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.2, 5]} />
            <Clay color="#7a4a2c" />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <coneGeometry args={[0.2, 0.4, 6]} />
            <Clay color={C.greenDark} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Dust({ speed, anchor }) {
  const puffs = useRef([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const moving = Math.abs(speed.current) > 0.1
    puffs.current.forEach((p, i) => {
      if (!p) return
      const phase = (t * 2.2 + i / 3) % 1
      p.visible = moving
      if (!moving || !anchor.current) return
      p.position.set(anchor.current.position.x - 0.95 * 0.6 - phase * 0.8, 0.12 + phase * 0.25, (i - 1) * 0.18)
      p.scale.setScalar(0.08 + phase * 0.16)
      p.material.opacity = 0.7 * (1 - phase)
    })
  })
  return [0, 1, 2].map((i) => (
    <mesh key={i} ref={(el) => (puffs.current[i] = el)} visible={false}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#f3e2c7" transparent opacity={0.6} flatShading />
    </mesh>
  ))
}

function Guide({ pose, driveKey, reducedMotion, onHonk }) {
  const rig = useRef()
  const standing = useRef()
  const seated = useRef()
  const speed = useRef(0)
  const start = useRef(-10)
  const first = useRef(true)

  // a new stop = a new drive (skip the very first mount)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!reducedMotion) start.current = -1 // armed; picked up on the next frame
  }, [driveKey, reducedMotion])

  useFrame((state) => {
    const now = state.clock.elapsedTime
    if (start.current === -1) start.current = now
    const t = (now - start.current) / DUR
    const driving = t >= 0 && t < 1
    let x = 0
    let v = 0
    if (driving) {
      if (t < 0.45) {
        const u = t / 0.45
        x = easeIn(u) * 6
        v = 6 * u
      } else {
        const u = (t - 0.45) / 0.55
        x = -6 + easeOut(u) * 6
        v = 6 * (1 - u)
      }
    }
    speed.current = v
    if (rig.current) rig.current.position.x = x
    if (standing.current) standing.current.visible = !driving
    if (seated.current) seated.current.visible = driving
  })

  return (
    <>
      <group ref={rig}>
        <Rickshaw speedRef={speed} scale={0.6} onClick={onHonk} {...hoverCursor}>
          <group ref={seated} visible={false}>
            <Avatar pose="drive" seated scale={0.62} position={[0.22, 0.62, 0]} rotation={[0, Math.PI / 2, 0]} />
          </group>
        </Rickshaw>
      </group>
      <group ref={standing}>
        <Avatar pose={pose} scale={0.62} position={[0.45, 0, 0.8]} rotation={[0, 0.55, 0]} onClick={onHonk} {...hoverCursor} />
      </group>
      <Dust speed={speed} anchor={rig} />
    </>
  )
}

export default function CompanionScene({ active, pose, driveKey, reducedMotion, onHonk }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [1.9, 1.35, 2.7], fov: 34 }}
      onCreated={({ camera }) => camera.lookAt(0.35, 0.62, 0.3)}
      gl={{ antialias: true, alpha: true }}
    >
      <hemisphereLight args={['#e8f6ff', '#ffd9a8', 1.4]} />
      <directionalLight position={[3, 6, 4]} intensity={2} castShadow shadow-mapSize={[512, 512]} />
      <Road />
      <Guide pose={pose} driveKey={driveKey} reducedMotion={reducedMotion} onHonk={onHonk} />
    </Canvas>
  )
}
