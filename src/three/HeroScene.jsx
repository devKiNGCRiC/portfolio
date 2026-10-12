import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Clay } from './clay'
import { C, hoverCursor } from './palette'
import Avatar from './Avatar'
import Rickshaw from './Rickshaw'
import { mapPins, mapDots } from '../data/map'

/*
  Hero: a stylised clay map of India (simplified outline, not to scale),
  with pins that jump to sections, a flight arc from Arunachal to Chennai,
  the Uttarakhand trek, and clay-KiNG waving beside the auto-rickshaw.
*/

// simplified outline, [lon, lat], clockwise from Kutch
const OUTLINE = [
  [68.2, 23.6], [68.8, 24.3], [70.1, 24.4], [71.1, 24.4], [70.4, 25.7], [70.0, 27.2], [71.9, 27.9],
  [73.4, 29.9], [74.5, 30.9], [74.6, 32.1], [74.2, 32.9], [73.6, 33.9], [73.3, 35.1], [74.0, 36.4],
  [74.9, 37.0], [76.2, 36.3], [77.8, 35.5], [80.3, 35.2], [79.8, 33.8], [79.2, 32.6], [78.8, 31.6],
  [80.1, 30.8], [81.0, 30.2], [80.1, 28.8], [81.6, 27.9], [83.3, 27.3], [84.6, 27.3], [85.9, 26.6],
  [87.2, 26.4], [88.1, 26.4], [88.1, 27.9], [88.8, 28.1], [88.9, 27.3], [89.1, 26.8], [90.3, 26.8],
  [91.5, 26.8], [92.1, 26.9], [91.6, 27.8], [93.8, 28.7], [95.3, 29.2], [96.3, 29.4], [97.3, 28.3],
  [97.0, 27.7], [96.0, 27.3], [95.3, 26.6], [94.9, 25.9], [94.6, 25.0], [94.2, 23.9], [93.4, 22.3],
  [92.6, 22.1], [92.3, 24.2], [92.4, 24.9], [92.0, 25.2], [90.0, 25.2], [89.8, 25.9], [88.6, 26.3],
  [88.3, 25.6], [88.1, 25.1], [88.7, 24.3], [88.8, 23.3], [89.0, 22.2], [88.9, 21.6], [87.0, 21.5],
  [86.8, 20.6], [85.8, 19.8], [84.8, 19.1], [84.1, 18.3], [83.3, 17.6], [82.3, 16.6], [81.3, 16.3],
  [80.3, 15.6], [80.1, 15.2], [80.3, 13.5], [80.2, 12.5], [79.8, 11.6], [79.85, 10.3], [79.0, 9.3],
  [78.2, 8.8], [77.5, 8.1], [76.6, 8.9], [76.2, 10.0], [75.8, 11.3], [74.8, 12.9], [74.5, 14.5],
  [73.4, 16.5], [73.0, 18.0], [72.8, 19.0], [72.9, 20.2], [72.6, 21.3], [72.5, 22.2], [72.1, 21.7],
  [71.1, 20.7], [69.6, 21.6], [69.0, 22.4], [70.1, 22.5], [70.5, 23.0], [69.7, 22.8], [68.8, 22.9],
]

const K = 0.2
const LON0 = 82.5
const LAT0 = 22.5
const DEPTH = 0.3
const TOP = DEPTH + 0.06 // extrude depth + bevel
/** lon/lat → world position on top of the map */
const geo = (lon, lat, y = TOP) => [(lon - LON0) * K, y, -(lat - LAT0) * K]

function IndiaLand() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape(OUTLINE.map(([lon, lat]) => new THREE.Vector2((lon - LON0) * K, (lat - LAT0) * K)))
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.05,
      bevelSegments: 2,
    })
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <Clay attach="material-0" color={C.greenBright} />
      <Clay attach="material-1" color={C.sand} />
    </mesh>
  )
}

const PEAKS = [
  [75.4, 34.6, 0.34],
  [77.6, 33.6, 0.42],
  [79.3, 31.4, 0.38],
  [80.4, 30.4, 0.3],
  [88.4, 27.6, 0.3],
  [92.8, 27.9, 0.28],
  [94.8, 28.6, 0.34],
  [96.3, 28.8, 0.26],
]

function Peaks() {
  return PEAKS.map(([lon, lat, h], i) => (
    <group key={i} position={geo(lon, lat)}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <coneGeometry args={[h * 0.55, h, 5]} />
        <Clay color={C.slate} />
      </mesh>
      <mesh position={[0, h * 0.82, 0]} scale={1.05}>
        <coneGeometry args={[h * 0.55 * 0.36, h * 0.36, 5]} />
        <Clay color={C.white} />
      </mesh>
    </group>
  ))
}

const TREES = [
  [74.5, 14.8], [75.4, 12.2], [76.4, 10.6], [93.6, 26.0], [94.2, 27.2], [91.2, 25.6], [84.0, 21.6], [81.2, 19.6],
]

function Trees() {
  return TREES.map(([lon, lat], i) => (
    <group key={i} position={geo(lon, lat)} scale={0.5}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.2, 5]} />
        <Clay color="#7a4a2c" />
      </mesh>
      <mesh position={[0, 0.33, 0]} castShadow>
        <coneGeometry args={[0.2, 0.36, 6]} />
        <Clay color={C.greenDark} />
      </mesh>
    </group>
  ))
}

const tmp = new THREE.Vector3()

function Pin({ pin, onNavigate, reducedMotion, getLabel }) {
  const ref = useRef()
  const anchor = useRef()
  const [hover, setHover] = useState(false)
  const base = geo(pin.lon, pin.lat)
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.y = base[1] + (reducedMotion ? 0 : Math.abs(Math.sin(t * 2 + pin.lon)) * 0.08)
    ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, hover ? 1.35 : 1, 0.2))
    // project the label anchor onto the DOM label that sits over the canvas
    const el = getLabel?.(pin.id)
    if (el && anchor.current) {
      anchor.current.getWorldPosition(tmp).project(state.camera)
      const x = (tmp.x * 0.5 + 0.5) * state.size.width
      const y = (-tmp.y * 0.5 + 0.5) * state.size.height
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`
      el.dataset.placed = 'true'
      el.classList.toggle('is-hover', hover)
    }
  })
  const go = () => onNavigate?.(pin.id)
  return (
    <group position={[base[0], 0, base[2]]}>
      <group
        ref={ref}
        onClick={(e) => {
          e.stopPropagation()
          go()
        }}
        onPointerOver={(e) => {
          hoverCursor.onPointerOver(e)
          setHover(true)
        }}
        onPointerOut={() => {
          hoverCursor.onPointerOut()
          setHover(false)
        }}
      >
        <mesh position={[0, 0.42, 0]} castShadow>
          <sphereGeometry args={[0.13, 18, 14]} />
          <meshStandardMaterial color={pin.color} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.24, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.09, 0.26, 12]} />
          <meshStandardMaterial color={pin.color} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.42, 0.11]}>
          <sphereGeometry args={[0.045, 10, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
      <object3D ref={anchor} position={pin.labelAt ?? [0, 0.75, 0]} />
    </group>
  )
}

// Arunachal → Chennai, the big move, as a flight arc with a paper plane
function FlightArc({ reducedMotion }) {
  const plane = useRef()
  const curve = useMemo(() => {
    const a = new THREE.Vector3(...geo(93.6, 27.4, TOP + 0.15))
    const b = new THREE.Vector3(...geo(80.3, 13.3, TOP + 0.15))
    const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0.6, 2.2, 0))
    return new THREE.QuadraticBezierCurve3(a, mid, b)
  }, [])
  const points = useMemo(() => curve.getPoints(60), [curve])
  useFrame((state) => {
    if (!plane.current || reducedMotion) return
    const t = (state.clock.elapsedTime * 0.12) % 1
    const p = curve.getPoint(t)
    const tan = curve.getTangent(t)
    plane.current.position.copy(p)
    plane.current.lookAt(p.clone().add(tan))
  })
  return (
    <group>
      <Line points={points} color={C.saffron} lineWidth={2.5} dashed dashSize={0.12} gapSize={0.09} />
      <group ref={plane} position={points[0]}>
        {/* cone tip points +z after lookAt */}
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={[0.14, 0.24, 0.035]}>
          <coneGeometry args={[1, 1.6, 3]} />
          <Clay color={C.white} />
        </mesh>
      </group>
    </group>
  )
}

function Trek() {
  // Delhi → Rishikesh → Badrinath → Valley of Flowers
  const pts = [
    [77.2, 28.6],
    [78.3, 30.1],
    [79.5, 30.74],
    [79.6, 30.72],
  ].map(([lon, lat]) => geo(lon, lat, TOP + 0.03))
  return <Line points={pts} color={C.red} lineWidth={3} dashed dashSize={0.06} gapSize={0.05} />
}

function Dots() {
  return mapDots.map((d) => (
    <mesh key={d.name} position={geo(d.lon, d.lat, TOP + 0.03)}>
      <cylinderGeometry args={[0.06, 0.06, 0.04, 14]} />
      <meshStandardMaterial color={C.white} />
    </mesh>
  ))
}

function Sea() {
  return (
    <group position={[0, -0.12, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.3, 48]} />
        <meshStandardMaterial color={C.water} roughness={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[4.05, 4.3, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
      </mesh>
      {/* clay rim under the sea disc */}
      <mesh position={[0, -0.32, 0]}>
        <cylinderGeometry args={[4.3, 4.0, 0.36, 48]} />
        <Clay color={C.clay} />
      </mesh>
    </group>
  )
}

function World({ reducedMotion, onNavigate, onAvatar, getLabel }) {
  const group = useRef()
  const speed = useRef(0)
  useFrame((state) => {
    if (group.current && !reducedMotion) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.08
  })
  return (
    <group ref={group}>
      <Sea />
      <IndiaLand />
      <Peaks />
      <Trees />
      <Dots />
      <Trek />
      <FlightArc reducedMotion={reducedMotion} />
      {mapPins.map((p) => (
        <Pin key={p.id} pin={p} onNavigate={onNavigate} reducedMotion={reducedMotion} getLabel={getLabel} />
      ))}
      <group position={geo(76.6, 20.4)}>
        <Avatar pose="wave" scale={0.62} rotation={[0, 0.25, 0]} onClick={onAvatar} {...hoverCursor} />
        <Rickshaw speedRef={speed} scale={0.5} position={[1.0, 0, -0.45]} rotation={[0, -0.6, 0]} />
      </group>
    </group>
  )
}

export default function HeroScene({ active, reducedMotion, coarse, onNavigate, onAvatar, getLabel }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0.4, 6.5, 7.3], fov: 36 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <hemisphereLight args={['#e8f6ff', '#ffd9a8', 1.4]} />
      <directionalLight position={[4, 9, 6]} intensity={2.1} color="#fff2dd" castShadow shadow-mapSize={[1024, 1024]}>
        <orthographicCamera attach="shadow-camera" args={[-7, 7, 7, -7, 0.5, 30]} />
      </directionalLight>

      <World reducedMotion={reducedMotion} onNavigate={onNavigate} onAvatar={onAvatar} getLabel={getLabel} />
      <ContactShadows position={[0, -0.7, 0]} opacity={0.25} scale={11} blur={2.6} far={3} frames={1} />

      <OrbitControls
        target={[0.2, 0, 0.1]}
        enableZoom={false}
        enablePan={false}
        enableRotate={!coarse}
        minPolarAngle={0.5}
        maxPolarAngle={1.1}
        minAzimuthAngle={-0.6}
        maxAzimuthAngle={0.6}
        rotateSpeed={0.5}
      />
    </Canvas>
  )
}
