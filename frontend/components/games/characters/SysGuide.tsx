"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, Ring, Text } from "@react-three/drei"
import * as THREE from "three"

interface SysGuideProps {
    position: [number, number, number]
    visible: boolean
    speaking: boolean
    emotion?: 'neutral' | 'warning' | 'excited' | 'concerned'
}

export function SysGuide({ position, visible, speaking, emotion = 'neutral' }: SysGuideProps) {
    const groupRef = useRef<THREE.Group>(null)
    const [animFrame, setAnimFrame] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimFrame(f => (f + 1) % 120)
        }, 50)
        return () => clearInterval(interval)
    }, [])

    useFrame(() => {
        if (!groupRef.current || !visible) return

        // Floating animation
        groupRef.current.position.y = position[1] + Math.sin(animFrame * 0.05) * 0.15
        groupRef.current.rotation.y += 0.005
    })

    const emotionColors = {
        neutral: '#06B6D4',
        warning: '#F59E0B',
        excited: '#22C55E',
        concerned: '#EF4444'
    }

    const color = emotionColors[emotion]

    if (!visible) return null

    return (
        <group ref={groupRef} position={position}>
            {/* Core orb */}
            <Sphere args={[0.3]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.9}
                />
            </Sphere>

            {/* Inner glow */}
            <Sphere args={[0.2]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#FFFFFF"
                    emissive="#FFFFFF"
                    emissiveIntensity={1}
                    transparent
                    opacity={0.6}
                />
            </Sphere>

            {/* Orbital rings */}
            <Ring args={[0.4, 0.45, 32]} rotation={[Math.PI / 2, 0, animFrame * 0.02]}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.7} side={THREE.DoubleSide} />
            </Ring>
            <Ring args={[0.5, 0.53, 32]} rotation={[Math.PI / 3, animFrame * 0.015, 0]}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.5} side={THREE.DoubleSide} />
            </Ring>
            <Ring args={[0.6, 0.62, 32]} rotation={[Math.PI / 4, 0, -animFrame * 0.01]}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.3} side={THREE.DoubleSide} />
            </Ring>

            {/* Speaking indicator */}
            {speaking && (
                <>
                    <Sphere args={[0.35 + Math.sin(animFrame * 0.3) * 0.05]} position={[0, 0, 0]}>
                        <meshStandardMaterial
                            color={color}
                            transparent
                            opacity={0.3}
                        />
                    </Sphere>
                    {/* Sound wave rings */}
                    {[...Array(3)].map((_, i) => (
                        <Ring
                            key={i}
                            args={[0.5 + i * 0.2 + (animFrame % 30) * 0.02, 0.52 + i * 0.2 + (animFrame % 30) * 0.02, 32]}
                            position={[0, 0, 0.4]}
                            rotation={[0, 0, 0]}
                        >
                            <meshStandardMaterial
                                color={color}
                                transparent
                                opacity={0.5 - i * 0.15 - (animFrame % 30) * 0.015}
                                side={THREE.DoubleSide}
                            />
                        </Ring>
                    ))}
                </>
            )}

            {/* Label */}
            <Text
                position={[0, 0.7, 0]}
                fontSize={0.12}
                color={color}
                anchorX="center"
                anchorY="middle"
            >
                SYS
            </Text>
        </group>
    )
}

// 2D UI version for dialogue box
export function SysGuideAvatar({ emotion = 'neutral', speaking = false }: { emotion?: 'neutral' | 'warning' | 'excited' | 'concerned'; speaking?: boolean }) {
    const [pulse, setPulse] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(p => (p + 1) % 60)
        }, 50)
        return () => clearInterval(interval)
    }, [])

    const emotionColors = {
        neutral: 'from-cyan-400 to-blue-500',
        warning: 'from-yellow-400 to-orange-500',
        excited: 'from-green-400 to-emerald-500',
        concerned: 'from-red-400 to-rose-500'
    }

    const pulseScale = speaking ? 1 + Math.sin(pulse * 0.3) * 0.05 : 1

    return (
        <div
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ transform: `scale(${pulseScale})` }}
        >
            {/* Glow effect */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${emotionColors[emotion]} blur-md opacity-50`} />

            {/* Main orb */}
            <div className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${emotionColors[emotion]} flex items-center justify-center border-2 border-white/30`}>
                <span className="text-2xl">🤖</span>
            </div>

            {/* Speaking waves */}
            {speaking && (
                <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/50 animate-ping" />
            )}
        </div>
    )
}
