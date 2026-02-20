"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Cylinder, Box, Sphere } from "@react-three/drei"
import * as THREE from "three"

interface EngineerProps {
    position: [number, number, number]
    targetPosition?: [number, number, number]
    state: 'idle' | 'walking' | 'interacting' | 'success' | 'error'
    onReachTarget?: () => void
}

export function Engineer({ position, targetPosition, state, onReachTarget }: EngineerProps) {
    const groupRef = useRef<THREE.Group>(null)
    const [currentPos, setCurrentPos] = useState<[number, number, number]>(position)
    const [animFrame, setAnimFrame] = useState(0)
    const walkCycle = useRef(0)

    // Animation frame counter
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimFrame(f => (f + 1) % 60)
        }, 50)
        return () => clearInterval(interval)
    }, [])

    // Movement logic
    useFrame((_, delta) => {
        if (!groupRef.current) return

        if (targetPosition && state === 'walking') {
            const [tx, ty, tz] = targetPosition
            const [cx, cy, cz] = currentPos
            const speed = 2 * delta

            const dx = tx - cx
            const dy = ty - cy
            const dz = tz - cz
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

            if (dist > 0.1) {
                const newX = cx + (dx / dist) * speed
                const newY = cy + (dy / dist) * speed
                const newZ = cz + (dz / dist) * speed
                setCurrentPos([newX, newY, newZ])
                groupRef.current.position.set(newX, newY, newZ)

                // Rotate to face direction
                const angle = Math.atan2(dx, dz)
                groupRef.current.rotation.y = angle

                walkCycle.current += delta * 10
            } else {
                setCurrentPos(targetPosition)
                groupRef.current.position.set(tx, ty, tz)
                onReachTarget?.()
            }
        }

        // Idle breathing animation
        if (state === 'idle' && groupRef.current) {
            groupRef.current.position.y = currentPos[1] + Math.sin(animFrame * 0.1) * 0.02
        }

        // Success bounce
        if (state === 'success' && groupRef.current) {
            groupRef.current.position.y = currentPos[1] + Math.abs(Math.sin(animFrame * 0.3)) * 0.2
        }

        // Error shake
        if (state === 'error' && groupRef.current) {
            groupRef.current.position.x = currentPos[0] + Math.sin(animFrame * 2) * 0.05
        }
    })

    const legSwing = state === 'walking' ? Math.sin(walkCycle.current * 2) * 0.4 : 0
    const armSwing = state === 'walking' ? Math.sin(walkCycle.current * 2 + Math.PI) * 0.3 : 0

    return (
        <group ref={groupRef} position={position}>
            {/* Body - Lab Coat */}
            <Box args={[0.4, 0.6, 0.25]} position={[0, 0.5, 0]}>
                <meshStandardMaterial color="#E5E7EB" />
            </Box>

            {/* Head */}
            <Sphere args={[0.18]} position={[0, 1.0, 0]}>
                <meshStandardMaterial color="#FBBF24" />
            </Sphere>

            {/* Hair */}
            <Sphere args={[0.15]} position={[0, 1.1, 0]}>
                <meshStandardMaterial color="#374151" />
            </Sphere>

            {/* Headset */}
            <Cylinder args={[0.02, 0.02, 0.3]} position={[0, 1.15, 0]} rotation={[0, 0, Math.PI / 2]}>
                <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.5} />
            </Cylinder>
            <Sphere args={[0.04]} position={[-0.18, 1.0, 0]}>
                <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.5} />
            </Sphere>
            <Sphere args={[0.04]} position={[0.18, 1.0, 0]}>
                <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.5} />
            </Sphere>

            {/* Eyes */}
            <Sphere args={[0.03]} position={[-0.06, 1.0, 0.15]}>
                <meshStandardMaterial color="#1F2937" />
            </Sphere>
            <Sphere args={[0.03]} position={[0.06, 1.0, 0.15]}>
                <meshStandardMaterial color="#1F2937" />
            </Sphere>

            {/* ID Badge */}
            <Box args={[0.08, 0.12, 0.02]} position={[0.12, 0.65, 0.13]}>
                <meshStandardMaterial color="#3B82F6" />
            </Box>

            {/* Arms */}
            <group rotation={[armSwing, 0, 0]}>
                <Cylinder args={[0.05, 0.05, 0.4]} position={[-0.28, 0.45, 0]} rotation={[0, 0, 0.2]}>
                    <meshStandardMaterial color="#E5E7EB" />
                </Cylinder>
            </group>
            <group rotation={[-armSwing, 0, 0]}>
                <Cylinder args={[0.05, 0.05, 0.4]} position={[0.28, 0.45, 0]} rotation={[0, 0, -0.2]}>
                    <meshStandardMaterial color="#E5E7EB" />
                </Cylinder>
            </group>

            {/* Legs */}
            <group rotation={[legSwing, 0, 0]}>
                <Cylinder args={[0.06, 0.06, 0.4]} position={[-0.1, 0.05, 0]}>
                    <meshStandardMaterial color="#374151" />
                </Cylinder>
            </group>
            <group rotation={[-legSwing, 0, 0]}>
                <Cylinder args={[0.06, 0.06, 0.4]} position={[0.1, 0.05, 0]}>
                    <meshStandardMaterial color="#374151" />
                </Cylinder>
            </group>

            {/* Status indicator */}
            {state === 'success' && (
                <Sphere args={[0.1]} position={[0, 1.4, 0]}>
                    <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={1} />
                </Sphere>
            )}
            {state === 'error' && (
                <Sphere args={[0.1]} position={[0, 1.4, 0]}>
                    <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1} />
                </Sphere>
            )}
            {state === 'interacting' && (
                <Sphere args={[0.08]} position={[0, 1.4, 0]}>
                    <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={1} />
                </Sphere>
            )}
        </group>
    )
}
