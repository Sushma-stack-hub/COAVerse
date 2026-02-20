"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Box, Cylinder, Sphere, Text, Line } from "@react-three/drei"
import * as THREE from "three"

// Base CPU World environment
export function CPUWorld({ children, broken = false }: { children?: React.ReactNode; broken?: boolean }) {
    const gridRef = useRef<THREE.Group>(null)
    const [pulse, setPulse] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(p => (p + 1) % 100)
        }, 50)
        return () => clearInterval(interval)
    }, [])

    return (
        <group>
            {/* Floor grid */}
            <gridHelper args={[50, 50, broken ? 0x991111 : 0x06B6D4, broken ? 0x440000 : 0x0E7490]} position={[0, 0, 0]} />

            {/* Ambient glow floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial
                    color={broken ? "#1a0505" : "#0a1525"}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Data stream particles */}
            {!broken && [...Array(20)].map((_, i) => (
                <DataParticle
                    key={i}
                    startPos={[
                        (Math.random() - 0.5) * 40,
                        0.5,
                        (Math.random() - 0.5) * 40
                    ]}
                    speed={0.5 + Math.random() * 1}
                    pulse={pulse}
                />
            ))}

            {/* Broken sparks */}
            {broken && [...Array(10)].map((_, i) => (
                <Spark
                    key={i}
                    position={[
                        (Math.random() - 0.5) * 30,
                        Math.random() * 3,
                        (Math.random() - 0.5) * 30
                    ]}
                    pulse={pulse}
                />
            ))}

            {/* Sky dome */}
            <mesh>
                <sphereGeometry args={[40, 32, 32]} />
                <meshBasicMaterial
                    color={broken ? "#0a0505" : "#0a152a"}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Distant towers/structures */}
            {[...Array(8)].map((_, i) => (
                <DistantTower
                    key={i}
                    position={[
                        Math.sin(i * Math.PI / 4) * 25,
                        0,
                        Math.cos(i * Math.PI / 4) * 25
                    ]}
                    height={3 + Math.random() * 4}
                    broken={broken}
                />
            ))}

            {children}
        </group>
    )
}

// Data particle that flows across the floor
function DataParticle({ startPos, speed, pulse }: { startPos: [number, number, number]; speed: number; pulse: number }) {
    const ref = useRef<THREE.Mesh>(null)
    const [offset] = useState(Math.random() * 100)

    useFrame((_, delta) => {
        if (!ref.current) return
        ref.current.position.z += speed * delta
        if (ref.current.position.z > 25) {
            ref.current.position.z = -25
            ref.current.position.x = (Math.random() - 0.5) * 40
        }
    })

    return (
        <Sphere ref={ref} args={[0.08]} position={startPos}>
            <meshStandardMaterial
                color="#06B6D4"
                emissive="#06B6D4"
                emissiveIntensity={0.5 + Math.sin((pulse + offset) * 0.1) * 0.3}
            />
        </Sphere>
    )
}

// Spark effect for broken state
function Spark({ position, pulse }: { position: [number, number, number]; pulse: number }) {
    const visible = (pulse + position[0] * 10) % 20 < 3

    if (!visible) return null

    return (
        <Sphere args={[0.05]} position={position}>
            <meshStandardMaterial
                color="#FF6B6B"
                emissive="#FF0000"
                emissiveIntensity={2}
            />
        </Sphere>
    )
}

// Distant tower structure
function DistantTower({ position, height, broken }: { position: [number, number, number]; height: number; broken: boolean }) {
    return (
        <group position={position}>
            <Box args={[1.5, height, 1.5]} position={[0, height / 2, 0]}>
                <meshStandardMaterial
                    color={broken ? "#3a1515" : "#1e3a5f"}
                    emissive={broken ? "#330000" : "#06B6D4"}
                    emissiveIntensity={broken ? 0.1 : 0.2}
                />
            </Box>
            {/* Top light */}
            <Sphere args={[0.2]} position={[0, height + 0.3, 0]}>
                <meshStandardMaterial
                    color={broken ? "#ff3333" : "#06B6D4"}
                    emissive={broken ? "#ff0000" : "#06B6D4"}
                    emissiveIntensity={broken ? 0.5 : 1}
                />
            </Sphere>
        </group>
    )
}

// Control Unit Tower
export function ControlUnitTower({ position, activated, onInteract }: {
    position: [number, number, number]
    activated: boolean
    onInteract: () => void
}) {
    const [hover, setHover] = useState(false)
    const [pulse, setPulse] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(p => (p + 1) % 60)
        }, 50)
        return () => clearInterval(interval)
    }, [])

    const glowIntensity = activated ? 0.8 : (hover ? 0.3 : 0.1)
    const color = activated ? "#22C55E" : "#06B6D4"

    return (
        <group
            position={position}
            onClick={onInteract}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            {/* Main tower */}
            <Box args={[2, 4, 2]} position={[0, 2, 0]}>
                <meshStandardMaterial
                    color={activated ? "#1a3a1a" : "#1a2a3a"}
                    emissive={color}
                    emissiveIntensity={glowIntensity}
                />
            </Box>

            {/* Top platform */}
            <Box args={[2.5, 0.3, 2.5]} position={[0, 4.15, 0]}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                />
            </Box>

            {/* Central core */}
            <Cylinder args={[0.3, 0.3, 3]} position={[0, 2, 0]}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={activated ? 1 : 0.3 + Math.sin(pulse * 0.1) * 0.2}
                />
            </Cylinder>

            {/* Status rings */}
            {[0.5, 1.5, 2.5, 3.5].map((y, i) => (
                <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, pulse * 0.02 * (i % 2 === 0 ? 1 : -1)]}>
                    <torusGeometry args={[0.8 + i * 0.1, 0.05, 8, 32]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={activated ? 0.8 : 0.2}
                        transparent
                        opacity={activated ? 0.9 : 0.5}
                    />
                </mesh>
            ))}

            {/* Label */}
            <Text
                position={[0, 5, 0]}
                fontSize={0.3}
                color={color}
                anchorX="center"
                anchorY="middle"
            >
                CONTROL UNIT
            </Text>

            {/* Interaction hint */}
            {hover && !activated && (
                <Text
                    position={[0, 5.5, 0]}
                    fontSize={0.2}
                    color="#FFFFFF"
                    anchorX="center"
                >
                    Click to activate
                </Text>
            )}

            {/* Signal lines when activated */}
            {activated && (
                <>
                    <Line
                        points={[[0, 2, 1.2], [0, 2, 5]]}
                        color="#22C55E"
                        lineWidth={2}
                    />
                    <Line
                        points={[[1.2, 2, 0], [5, 2, 0]]}
                        color="#22C55E"
                        lineWidth={2}
                    />
                    <Line
                        points={[[-1.2, 2, 0], [-5, 2, 0]]}
                        color="#22C55E"
                        lineWidth={2}
                    />
                </>
            )}
        </group>
    )
}

// Register component
export function RegisterComponent({ position, id, activated, onInteract }: {
    position: [number, number, number]
    id: string
    activated: boolean
    onInteract: () => void
}) {
    const [hover, setHover] = useState(false)

    return (
        <group
            position={position}
            onClick={onInteract}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            <Box args={[1.5, 1, 1.5]} position={[0, 0.5, 0]}>
                <meshStandardMaterial
                    color={activated ? "#22C55E" : hover ? "#3B82F6" : "#374151"}
                    emissive={activated ? "#22C55E" : hover ? "#3B82F6" : "#000000"}
                    emissiveIntensity={activated ? 0.5 : hover ? 0.3 : 0}
                />
            </Box>
            <Text
                position={[0, 1.3, 0]}
                fontSize={0.2}
                color={activated ? "#22C55E" : "#9CA3AF"}
                anchorX="center"
            >
                {id}
            </Text>
        </group>
    )
}

// Memory block
export function MemoryBlock({ position, id, activated }: {
    position: [number, number, number]
    id: string
    activated: boolean
}) {
    return (
        <group position={position}>
            <Box args={[0.8, 2, 0.8]} position={[0, 1, 0]}>
                <meshStandardMaterial
                    color={activated ? "#8B5CF6" : "#1F2937"}
                    emissive={activated ? "#8B5CF6" : "#000000"}
                    emissiveIntensity={activated ? 0.4 : 0}
                />
            </Box>
            <Text
                position={[0, 2.3, 0]}
                fontSize={0.15}
                color="#9CA3AF"
                anchorX="center"
            >
                {id}
            </Text>
        </group>
    )
}

// ALU machine
export function ALUMachine({ position, operating }: {
    position: [number, number, number]
    operating: boolean
}) {
    const [rotation, setRotation] = useState(0)

    useEffect(() => {
        if (!operating) return
        const interval = setInterval(() => {
            setRotation(r => r + 0.1)
        }, 50)
        return () => clearInterval(interval)
    }, [operating])

    return (
        <group position={position}>
            {/* Main body */}
            <Box args={[3, 2, 3]} position={[0, 1, 0]}>
                <meshStandardMaterial
                    color="#F59E0B"
                    emissive={operating ? "#F59E0B" : "#000000"}
                    emissiveIntensity={operating ? 0.5 : 0}
                />
            </Box>

            {/* Rotating gears */}
            <mesh position={[0, 2.2, 0]} rotation={[0, rotation, 0]}>
                <torusGeometry args={[0.5, 0.1, 8, 32]} />
                <meshStandardMaterial color="#EAB308" emissive="#EAB308" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, 2.2, 0]} rotation={[0, -rotation, Math.PI / 4]}>
                <torusGeometry args={[0.7, 0.1, 8, 32]} />
                <meshStandardMaterial color="#CA8A04" emissive="#CA8A04" emissiveIntensity={0.3} />
            </mesh>

            <Text
                position={[0, 3, 0]}
                fontSize={0.4}
                color="#F59E0B"
                anchorX="center"
            >
                ALU
            </Text>
        </group>
    )
}

// Logic Gate (for puzzles)
export function LogicGate({ position, type, activated, locked, onInteract }: {
    position: [number, number, number]
    type: 'AND' | 'OR' | 'NOT' | 'NAND'
    activated: boolean
    locked: boolean
    onInteract: () => void
}) {
    const [hover, setHover] = useState(false)

    const gateColors = {
        AND: '#3B82F6',
        OR: '#8B5CF6',
        NOT: '#EF4444',
        NAND: '#F59E0B'
    }

    const color = gateColors[type]

    return (
        <group
            position={position}
            onClick={locked ? undefined : onInteract}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            <Box args={[1, 0.6, 0.3]} position={[0, 0.3, 0]}>
                <meshStandardMaterial
                    color={activated ? "#22C55E" : color}
                    emissive={activated ? "#22C55E" : hover && !locked ? color : "#000000"}
                    emissiveIntensity={activated ? 0.6 : hover ? 0.3 : 0}
                    transparent
                    opacity={locked ? 0.5 : 1}
                />
            </Box>
            <Text
                position={[0, 0.3, 0.2]}
                fontSize={0.15}
                color="#FFFFFF"
                anchorX="center"
            >
                {type}
            </Text>
            {locked && (
                <Text
                    position={[0, 0.7, 0]}
                    fontSize={0.1}
                    color="#EF4444"
                    anchorX="center"
                >
                    🔒
                </Text>
            )}
        </group>
    )
}
