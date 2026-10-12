import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Clay, SoftClay } from './clay'
import { C } from './palette'

/*
  Clay-KiNG: a chibi version of the site owner. Saffron hoodie, navy cap,
  green backpack. Poses blend smoothly:
    idle | wave | type | camera | suitcase | passport | cheer | drive
*/

// target rotations for [rightArm.x, rightArm.z, leftArm.x, leftArm.z]
const POSES = {
  idle: [0, 0.15, 0, -0.15],
  wave: [0, 2.6, 0, -0.15],
  type: [-1.15, 0.25, -1.15, -0.25],
  camera: [-2.05, 0.45, -2.05, -0.45],
  suitcase: [0, 0.12, -0.2, -0.3],
  passport: [0, 0.15, -1.3, 0.2],
  cheer: [0, 2.7, 0, -2.7],
  drive: [-0.95, 0.12, -0.95, -0.12],
}

function MiniLaptop() {
  return (
    <group rotation={[0.1, 0, 0]}>
      <RoundedBox args={[0.46, 0.03, 0.32]} radius={0.012}>
        <Clay color="#d7dbe3" />
      </RoundedBox>
      <group position={[0, 0.01, -0.16]} rotation={[-0.35, 0, 0]}>
        <RoundedBox args={[0.46, 0.3, 0.02]} radius={0.012} position={[0, 0.15, 0]}>
          <Clay color="#d7dbe3" />
        </RoundedBox>
        <mesh position={[0, 0.15, 0.012]}>
          <planeGeometry args={[0.4, 0.24]} />
          <meshBasicMaterial color={C.navyDeep} />
        </mesh>
        {[0.2, 0.12, 0.26, 0.16].map((w, i) => (
          <mesh key={i} position={[-0.16 + w / 2 + (i % 2) * 0.03, 0.24 - i * 0.05, 0.014]}>
            <planeGeometry args={[w, 0.018]} />
            <meshBasicMaterial color={i === 0 ? C.saffron : i === 2 ? C.greenBright : C.cyan} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function MiniCamera() {
  return (
    <group>
      <RoundedBox args={[0.34, 0.22, 0.16]} radius={0.04}>
        <Clay color={C.ink} />
      </RoundedBox>
      <mesh position={[0, -0.01, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.09, 0.08, 14]} />
        <Clay color="#3a3a42" />
      </mesh>
      <mesh position={[0, -0.01, 0.145]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.01, 14]} />
        <meshStandardMaterial color={C.cyan} roughness={0.1} metalness={0.4} />
      </mesh>
      <mesh position={[0.11, 0.13, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.04, 10]} />
        <Clay color={C.red} />
      </mesh>
    </group>
  )
}

function Suitcase() {
  return (
    <group>
      <RoundedBox args={[0.3, 0.36, 0.14]} radius={0.04}>
        <Clay color={C.coral} />
      </RoundedBox>
      <mesh position={[0, 0.2, 0]}>
        <torusGeometry args={[0.05, 0.015, 6, 12, Math.PI]} />
        <Clay color={C.ink} />
      </mesh>
      <mesh position={[0, 0, 0.072]}>
        <planeGeometry args={[0.08, 0.1]} />
        <meshBasicMaterial color={C.yellow} />
      </mesh>
    </group>
  )
}

function Passport() {
  return (
    <group>
      <RoundedBox args={[0.2, 0.27, 0.03]} radius={0.01}>
        <Clay color={C.navy} />
      </RoundedBox>
      <mesh position={[0, 0.02, 0.017]}>
        <circleGeometry args={[0.045, 16]} />
        <meshBasicMaterial color={C.saffron} />
      </mesh>
    </group>
  )
}

function Arm({ side, armRef, children }) {
  return (
    <group ref={armRef} position={[side * 0.27, 1.02, 0]}>
      <mesh position={[0, -0.18, 0]} castShadow>
        <capsuleGeometry args={[0.075, 0.24, 4, 10]} />
        <SoftClay color={C.saffron} />
      </mesh>
      <mesh position={[0, -0.39, 0]} castShadow>
        <sphereGeometry args={[0.075, 14, 12]} />
        <SoftClay color={C.skin} />
      </mesh>
      {children}
    </group>
  )
}

export default function Avatar({ pose = 'idle', seated = false, onClick, ...props }) {
  const rArm = useRef()
  const lArm = useRef()
  const legs = useRef()
  const body = useRef()
  const head = useRef()
  const eyes = useRef()
  const props3d = useRef({})

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const k = 1 - Math.pow(0.001, dt) // frame-rate independent lerp
    const [rx, rz, lx, lz] = POSES[pose] ?? POSES.idle
    const wave = pose === 'wave' ? Math.sin(t * 8) * 0.35 : 0
    const cheer = pose === 'cheer' ? Math.sin(t * 6) * 0.2 : 0
    if (rArm.current) {
      rArm.current.rotation.x = THREE.MathUtils.lerp(rArm.current.rotation.x, rx, k)
      rArm.current.rotation.z = THREE.MathUtils.lerp(rArm.current.rotation.z, rz + wave + cheer, k)
    }
    if (lArm.current) {
      lArm.current.rotation.x = THREE.MathUtils.lerp(lArm.current.rotation.x, lx, k)
      lArm.current.rotation.z = THREE.MathUtils.lerp(lArm.current.rotation.z, lz - cheer, k)
    }
    if (legs.current) legs.current.rotation.x = THREE.MathUtils.lerp(legs.current.rotation.x, seated ? -1.45 : 0, k)
    // breathing + little bounce
    if (body.current) {
      const hop = pose === 'cheer' ? Math.abs(Math.sin(t * 6)) * 0.06 : 0
      body.current.position.y = Math.sin(t * 2.2) * 0.012 + hop
    }
    if (head.current) head.current.rotation.z = Math.sin(t * 1.3) * 0.06
    // blink every ~3.5s
    if (eyes.current) eyes.current.scale.y = (t % 3.5) < 0.12 ? 0.1 : 1
    // show only the prop this pose needs
    const p = props3d.current
    if (p.laptop) p.laptop.visible = pose === 'type'
    if (p.camera) p.camera.visible = pose === 'camera'
    if (p.suitcase) p.suitcase.visible = pose === 'suitcase'
    if (p.passport) p.passport.visible = pose === 'passport'
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
      <group ref={body}>
        {/* legs pivot at the hips so the avatar can sit */}
        <group ref={legs} position={[0, 0.55, 0]}>
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.12, 0, 0]}>
              <mesh position={[0, -0.22, 0]} castShadow>
                <capsuleGeometry args={[0.09, 0.26, 4, 10]} />
                <SoftClay color={C.denim} />
              </mesh>
              <RoundedBox args={[0.16, 0.1, 0.26]} radius={0.04} position={[0, -0.5, 0.04]} castShadow>
                <SoftClay color={C.white} />
              </RoundedBox>
            </group>
          ))}
        </group>

        {/* hoodie */}
        <mesh position={[0, 0.83, 0]} castShadow>
          <capsuleGeometry args={[0.24, 0.26, 6, 16]} />
          <SoftClay color={C.saffron} />
        </mesh>
        {/* </> patch */}
        <RoundedBox args={[0.16, 0.08, 0.02]} radius={0.01} position={[0.08, 0.9, 0.235]}>
          <meshBasicMaterial color={C.navyDeep} />
        </RoundedBox>
        <mesh position={[0.08, 0.9, 0.247]}>
          <planeGeometry args={[0.1, 0.02]} />
          <meshBasicMaterial color={C.cyan} />
        </mesh>
        {/* backpack */}
        <RoundedBox args={[0.38, 0.44, 0.2]} radius={0.06} position={[0, 0.86, -0.27]} castShadow>
          <Clay color={C.green} />
        </RoundedBox>
        <RoundedBox args={[0.24, 0.14, 0.06]} radius={0.03} position={[0, 0.76, -0.39]}>
          <Clay color={C.greenDark} />
        </RoundedBox>

        <Arm side={1} armRef={rArm}>
          <group ref={(el) => (props3d.current.suitcase = el)} position={[0, -0.6, 0.02]} visible={false}>
            <Suitcase />
          </group>
        </Arm>
        <Arm side={-1} armRef={lArm}>
          <group
            ref={(el) => (props3d.current.passport = el)}
            position={[0, -0.47, 0.06]}
            rotation={[1.3, 0, 0]}
            visible={false}
          >
            <Passport />
          </group>
        </Arm>

        {/* held in front of the body, not by one arm */}
        <group ref={(el) => (props3d.current.laptop = el)} position={[0, 0.78, 0.46]} visible={false}>
          <MiniLaptop />
        </group>
        <group ref={(el) => (props3d.current.camera = el)} position={[0, 1.3, 0.42]} visible={false}>
          <MiniCamera />
        </group>

        {/* head */}
        <group ref={head} position={[0, 1.34, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.3, 24, 20]} />
            <SoftClay color={C.skin} />
          </mesh>
          {/* hair peeking out under the cap */}
          <mesh position={[0, 0.02, -0.03]} scale={[1.03, 1, 1.03]}>
            <sphereGeometry args={[0.3, 24, 16, 0, Math.PI * 2, 0, 1.25]} />
            <SoftClay color={C.hair} />
          </mesh>
          {/* cap */}
          <mesh position={[0, 0.05, 0]} scale={[1.06, 1, 1.06]}>
            <sphereGeometry args={[0.3, 24, 16, 0, Math.PI * 2, 0, 1.05]} />
            <SoftClay color={C.navy} />
          </mesh>
          <mesh position={[0, 0.13, 0.24]} rotation={[0.25, 0, 0]} scale={[1.2, 1, 1]}>
            <cylinderGeometry args={[0.16, 0.17, 0.035, 20, 1, false, -Math.PI / 2, Math.PI]} />
            <SoftClay color={C.cyan} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <sphereGeometry args={[0.035, 10, 8]} />
            <SoftClay color={C.saffron} />
          </mesh>
          {/* face */}
          <group ref={eyes} position={[0, 0, 0.27]}>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.1, 0.0, 0]}>
                <sphereGeometry args={[0.036, 12, 10]} />
                <meshStandardMaterial color={C.ink} roughness={0.3} />
              </mesh>
            ))}
          </group>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.17, -0.07, 0.23]} scale={[1, 0.6, 0.3]}>
              <sphereGeometry args={[0.045, 10, 8]} />
              <meshBasicMaterial color={C.coral} />
            </mesh>
          ))}
          <mesh position={[0, -0.09, 0.285]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.055, 0.013, 8, 16, Math.PI]} />
            <meshStandardMaterial color={C.ink} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
