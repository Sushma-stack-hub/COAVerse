"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, Box, Icosahedron } from "@react-three/drei"
import * as THREE from "three"

interface GlitchEntityProps {
    position: [number, number, number]
    visible: boolean
    intensity: number // 1-3
}

export function GlitchEntity({ position, visible, intensity }: GlitchEntityProps) {
    const groupRef = useRef<THREE.Group>(null)
    const [animFrame, setAnimFrame] = useState(0)
    const [fragments, setFragments] = useState<Array<{ offset: [number, number, number]; rotation: number }>>([])

    useEffect(() => {
        // Generate random fragments
        const newFragments = [...Array(8)].map(() => ({
            offset: [
                (Math.random() - 0.5) * 0.8,
                (Math.random() - 0.5) * 0.8,
                (Math.random() - 0.5) * 0.8
            ] as [number, number, number],
            rotation: Math.random() * Math.PI * 2
        }))
        setFragments(newFragments)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimFrame(f => (f + 1) % 60)
        }, 30)
        return () => clearInterval(interval)
    }, [])

    useFrame(() => {
        if (!groupRef.current || !visible) return

        // Erratic movement based on intensity
        const shake = intensity * 0.05
        groupRef.current.position.x = position[0] + (Math.random() - 0.5) * shake
        groupRef.current.position.y = position[1] + (Math.random() - 0.5) * shake + Math.sin(animFrame * 0.2) * 0.1
        groupRef.current.position.z = position[2] + (Math.random() - 0.5) * shake

        // Rotation
        groupRef.current.rotation.y += 0.02 * intensity
        groupRef.current.rotation.x = Math.sin(animFrame * 0.1) * 0.2
    })

    if (!visible) return null

    const glitchColor = '#EF4444'
    const coreSize = 0.2 + intensity * 0.1

    return (
        <group ref={groupRef} position={position}>
            {/* Core - distorted icosahedron */}
            <Icosahedron args={[coreSize]}>
                <meshStandardMaterial
                    color={glitchColor}
                    emissive={glitchColor}
                    emissiveIntensity={intensity}
                    wireframe={animFrame % 10 < 5}
                />
            </Icosahedron>

            {/* Outer shell - flickering */}
            <Icosahedron args={[coreSize * 1.3]}>
                <meshStandardMaterial
                    color={glitchColor}
                    emissive={glitchColor}
                    emissiveIntensity={0.5}
                    transparent
                    opacity={animFrame % 6 < 3 ? 0.4 : 0.1}
                    wireframe
                />
            </Icosahedron>

            {/* Floating fragments */}
            {fragments.map((frag, i) => (
                <Box
                    key={i}
                    args={[0.05, 0.05, 0.05]}
                    position={[
                        frag.offset[0] + Math.sin(animFrame * 0.1 + i) * 0.1,
                        frag.offset[1] + Math.cos(animFrame * 0.1 + i) * 0.1,
                        frag.offset[2]
                    ]}
                    rotation={[frag.rotation + animFrame * 0.05, animFrame * 0.03, 0]}
                >
                    <meshStandardMaterial
                        color={glitchColor}
                        emissive={glitchColor}
                        emissiveIntensity={0.8}
                    />
                </Box>
            ))}

            {/* Error particles */}
            {[...Array(intensity * 3)].map((_, i) => (
                <Sphere
                    key={`particle-${i}`}
                    args={[0.03]}
                    position={[
                        Math.sin(animFrame * 0.2 + i * 1.5) * 0.6,
                        Math.cos(animFrame * 0.15 + i * 1.2) * 0.6,
                        Math.sin(animFrame * 0.1 + i) * 0.3
                    ]}
                >
                    <meshStandardMaterial
                        color="#FF0000"
                        emissive="#FF0000"
                        emissiveIntensity={1}
                    />
                </Sphere>
            ))}

            {/* Distortion rings */}
            {[...Array(2)].map((_, i) => (
                <mesh key={`ring-${i}`} rotation={[Math.PI / 2, 0, animFrame * 0.05 * (i + 1)]}>
                    <torusGeometry args={[0.4 + i * 0.2, 0.02, 8, 32]} />
                    <meshStandardMaterial
                        color={glitchColor}
                        emissive={glitchColor}
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.6 - i * 0.2}
                    />
                </mesh>
            ))}
        </group>
    )
}

// 2D Glitch overlay effect
export function GlitchOverlay({ visible, intensity = 1 }: { visible: boolean; intensity?: number }) {
    const [frame, setFrame] = useState(0)

    useEffect(() => {
        if (!visible) return
        const interval = setInterval(() => {
            setFrame(f => (f + 1) % 20)
        }, 50)
        return () => clearInterval(interval)
    }, [visible])

    if (!visible) return null

    return (
        <>
            {/* Scanline effect */}
            <div
                className="fixed inset-0 z-40 pointer-events-none"
                style={{
                    background: `repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        rgba(255, 0, 0, ${0.05 * intensity}) 2px,
                        rgba(255, 0, 0, ${0.05 * intensity}) 4px
                    )`,
                    animation: 'glitch-scanline 0.1s infinite'
                }}
            />

            {/* RGB split effect */}
            <div
                className="fixed inset-0 z-40 pointer-events-none"
                style={{
                    boxShadow: `
                        inset ${frame % 2 === 0 ? 2 : -2}px 0 0 rgba(255, 0, 0, ${0.3 * intensity}),
                        inset ${frame % 2 === 0 ? -2 : 2}px 0 0 rgba(0, 255, 255, ${0.3 * intensity})
                    `
                }}
            />

            {/* Glitch blocks */}
            {[...Array(Math.floor(intensity * 2))].map((_, i) => (
                <div
                    key={i}
                    className="fixed z-40 pointer-events-none bg-red-500/20"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: `${20 + Math.random() * 100}px`,
                        height: `${2 + Math.random() * 10}px`,
                        transform: `translateX(${frame % 2 === 0 ? 5 : -5}px)`,
                        display: frame % 4 < 2 ? 'block' : 'none'
                    }}
                />
            ))}

            {/* Glitch character indicator */}
            <div className="fixed top-20 right-8 z-50 animate-bounce">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center border-2 border-red-400 shadow-lg shadow-red-500/50">
                    <span className="text-3xl">🐛</span>
                </div>
                <p className="text-red-400 text-xs font-bold text-center mt-2">GLITCH!</p>
            </div>
        </>
    )
}
