"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import * as THREE from "three"
import { useGame, useGameActions } from "../engine/GameState"

// ===========================================
// INTEGRATED CPU COMPONENT
// ===========================================
function IntegratedComponent({
    position,
    name,
    color,
    active,
    pulsing,
    scale = 1
}: {
    position: [number, number, number]
    name: string
    color: string
    active: boolean
    pulsing: boolean
    scale?: number
}) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [currentScale, setCurrentScale] = useState(scale)

    useFrame((_, delta) => {
        if (meshRef.current) {
            if (pulsing) {
                setCurrentScale(scale + Math.sin(Date.now() * 0.008) * 0.1)
            }
            meshRef.current.scale.setScalar(currentScale)
        }
    })

    return (
        <group position={position}>
            <mesh ref={meshRef}>
                <boxGeometry args={[2, 1.5, 2]} />
                <meshStandardMaterial
                    color={color}
                    emissive={active ? color : "#000000"}
                    emissiveIntensity={active ? 0.6 : 0}
                />
            </mesh>
            <Text position={[0, 1.5, 0]} fontSize={0.4} color="#FFFFFF" anchorX="center">
                {name}
            </Text>
            {active && (
                <pointLight position={[0, 0, 0]} intensity={0.5} color={color} distance={5} />
            )}
        </group>
    )
}

// ===========================================
// DATA FLOW PATH
// ===========================================
function DataFlowPath({
    points,
    active,
    progress
}: {
    points: [number, number, number][]
    active: boolean
    progress: number
}) {
    // Calculate particle position along path
    const getPositionAlongPath = (t: number) => {
        if (points.length < 2) return points[0] || [0, 0, 0]
        const segmentCount = points.length - 1
        const segment = Math.min(Math.floor(t * segmentCount), segmentCount - 1)
        const segmentT = (t * segmentCount) - segment
        const start = points[segment]
        const end = points[segment + 1]
        return [
            start[0] + (end[0] - start[0]) * segmentT,
            start[1] + (end[1] - start[1]) * segmentT + Math.sin(segmentT * Math.PI) * 0.5,
            start[2] + (end[2] - start[2]) * segmentT
        ] as [number, number, number]
    }

    const particlePosition = getPositionAlongPath(progress)

    return (
        <group>
            {/* Render line segments as cylinders */}
            {points.slice(0, -1).map((point, i) => {
                const nextPoint = points[i + 1]
                const midX = (point[0] + nextPoint[0]) / 2
                const midY = (point[1] + nextPoint[1]) / 2
                const midZ = (point[2] + nextPoint[2]) / 2
                const length = Math.sqrt(
                    Math.pow(nextPoint[0] - point[0], 2) +
                    Math.pow(nextPoint[1] - point[1], 2) +
                    Math.pow(nextPoint[2] - point[2], 2)
                )
                const angleY = Math.atan2(nextPoint[0] - point[0], nextPoint[2] - point[2])
                const angleX = Math.atan2(
                    nextPoint[1] - point[1],
                    Math.sqrt(Math.pow(nextPoint[0] - point[0], 2) + Math.pow(nextPoint[2] - point[2], 2))
                )
                return (
                    <mesh key={i} position={[midX, midY, midZ]} rotation={[angleX, angleY, 0]}>
                        <cylinderGeometry args={[0.05, 0.05, length, 8]} />
                        <meshBasicMaterial color={active ? "#22C55E" : "#475569"} />
                    </mesh>
                )
            })}
            {active && progress > 0 && progress < 1 && (
                <mesh position={particlePosition}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={1} />
                </mesh>
            )}
        </group>
    )
}

// ===========================================
// INTERRUPT SIGNAL
// ===========================================
function InterruptSignal({ position, active, onClick }: { position: [number, number, number]; active: boolean; onClick: () => void }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame(() => {
        if (meshRef.current && active) {
            meshRef.current.rotation.y += 0.05
            meshRef.current.rotation.z = Math.sin(Date.now() * 0.01) * 0.2
        }
    })

    if (!active) return null

    return (
        <mesh ref={meshRef} position={position} onClick={onClick}>
            <octahedronGeometry args={[0.8]} />
            <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.8} />
        </mesh>
    )
}

// ===========================================
// VICTORY PARTICLES
// ===========================================
function VictoryParticles({ active }: { active: boolean }) {
    const groupRef = useRef<THREE.Group>(null)
    const [particles] = useState(() => {
        return Array.from({ length: 30 }, (_, i) => ({
            x: (Math.random() - 0.5) * 15,
            y: Math.random() * 8,
            z: (Math.random() - 0.5) * 15,
            speed: 1 + Math.random() * 2
        }))
    })

    useFrame((_, delta) => {
        if (groupRef.current && active) {
            groupRef.current.children.forEach((child, i) => {
                child.position.y += delta * particles[i].speed
                if (child.position.y > 12) {
                    child.position.y = 0
                }
            })
        }
    })

    if (!active) return null

    return (
        <group ref={groupRef}>
            {particles.map((p, i) => (
                <mesh key={i} position={[p.x, p.y, p.z]}>
                    <sphereGeometry args={[0.15, 8, 8]} />
                    <meshBasicMaterial color="#FBBF24" />
                </mesh>
            ))}
        </group>
    )
}

// ===========================================
// SYSTEM STATUS PANEL
// ===========================================
function SystemStatusPanel({
    components,
    currentStep
}: {
    components: { name: string; active: boolean }[]
    currentStep: string
}) {
    return (
        <div className="absolute top-28 right-8 z-50 bg-slate-900/95 backdrop-blur-sm rounded-2xl p-4 border border-green-500/40 min-w-[200px]">
            <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                SYSTEM STATUS
            </h3>
            <div className="space-y-2">
                {components.map((comp, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm ${comp.active ? 'text-green-400' : 'text-gray-500'}`}>
                        {comp.active ? '✓' : '○'} {comp.name}
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700">
                <p className="text-cyan-400 text-xs font-medium">{currentStep}</p>
            </div>
        </div>
    )
}

// ===========================================
// MAIN SCENE
// ===========================================
function Act5Scene({ onComplete }: { onComplete: () => void }) {
    const { state } = useGame()
    const { addXP, updateProgress, setObjective, completeObjective, queueDialogue } = useGameActions()
    const [phase, setPhase] = useState<'intro' | 'watch' | 'interrupt' | 'complete'>('intro')
    const [activeComponents, setActiveComponents] = useState<string[]>([])
    const [dataFlowProgress, setDataFlowProgress] = useState(0)
    const [showInterrupt, setShowInterrupt] = useState(false)
    const [interruptHandled, setInterruptHandled] = useState(false)
    const [showVictory, setShowVictory] = useState(false)
    const [flowStep, setFlowStep] = useState(0)

    const COMPONENTS = [
        { id: 'cu', name: 'Control Unit', position: [0, 0, -4] as [number, number, number], color: '#06B6D4' },
        { id: 'registers', name: 'Registers', position: [-4, 0, 0] as [number, number, number], color: '#3B82F6' },
        { id: 'alu', name: 'ALU', position: [4, 0, 0] as [number, number, number], color: '#8B5CF6' },
        { id: 'memory', name: 'Memory', position: [0, 0, 4] as [number, number, number], color: '#22C55E' },
        { id: 'io', name: 'I/O', position: [6, 0, 4] as [number, number, number], color: '#F59E0B' },
    ]

    const FLOW_STEPS = ['cu', 'registers', 'alu', 'memory', 'io']

    useEffect(() => {
        queueDialogue([
            { speaker: 'SYS', text: 'Welcome to the final act: System Integration!', emotion: 'excited' },
            { speaker: 'SYS', text: 'Watch as all CPU components work together.', emotion: 'neutral' },
            { speaker: 'SYS', text: 'The instruction flows through the entire system.', emotion: 'neutral' }
        ])
        setObjective({ id: 'act5-watch', title: 'Observe Full Cycle', description: 'Watch the instruction flow', completed: false })
        setTimeout(() => {
            setPhase('watch')
            startDataFlow()
        }, 5000)
    }, [])

    const startDataFlow = () => {
        let step = 0
        const interval = setInterval(() => {
            if (step < FLOW_STEPS.length) {
                setActiveComponents(prev => [...prev, FLOW_STEPS[step]])
                setFlowStep(step + 1)
                updateProgress((step + 1) * 15)
                addXP(10)
                step++
            } else {
                clearInterval(interval)
                completeObjective('act5-watch')
                setObjective({ id: 'act5-interrupt', title: 'Handle Interrupt', description: 'Click the interrupt signal', completed: false })
                queueDialogue([{ speaker: 'SYS', text: 'Interrupt detected! Click to handle it.', emotion: 'warning' }])
                setPhase('interrupt')
                setShowInterrupt(true)
            }
        }, 1500)
    }

    const handleInterrupt = () => {
        setShowInterrupt(false)
        setInterruptHandled(true)
        addXP(100)
        completeObjective('act5-interrupt')
        updateProgress(100)

        queueDialogue([
            { speaker: 'SYS', text: 'INTERRUPT HANDLED! System stabilized!', emotion: 'excited' },
            { speaker: 'SYS', text: 'Congratulations! You have mastered CPY architecture!', emotion: 'excited' },
            { speaker: 'SYS', text: 'The system is now fully operational!', emotion: 'neutral' }
        ])

        setPhase('complete')
        setShowVictory(true)
        setTimeout(() => onComplete(), 5000)
    }

    useFrame((_, delta) => {
        if (phase === 'watch') {
            setDataFlowProgress(prev => {
                const next = prev + delta * 0.3
                return next > 1 ? 0 : next
            })
        }
    })

    const flowPath: [number, number, number][] = [
        [0, 1, -4],    // CU
        [-4, 1, 0],    // Registers
        [4, 1, 0],     // ALU
        [0, 1, 4],     // Memory
        [6, 1, 4],     // I/O
    ]

    return (
        <>
            <ambientLight intensity={0.4} />
            <pointLight position={[0, 15, 0]} intensity={1.5} color="#22C55E" />
            <pointLight position={[-10, 5, 10]} intensity={0.5} color="#06B6D4" />
            <pointLight position={[10, 5, -10]} intensity={0.5} color="#8B5CF6" />

            {/* Background */}
            <gridHelper args={[30, 30, '#1E3A5F', '#1E3A5F']} position={[0, -0.5, 0]} />

            {/* Components */}
            {COMPONENTS.map(comp => (
                <IntegratedComponent
                    key={comp.id}
                    position={comp.position}
                    name={comp.name}
                    color={comp.color}
                    active={activeComponents.includes(comp.id)}
                    pulsing={activeComponents.includes(comp.id) && phase === 'watch'}
                />
            ))}

            {/* Data flow visualization */}
            <DataFlowPath
                points={flowPath}
                active={phase === 'watch'}
                progress={dataFlowProgress}
            />

            {/* Interrupt signal */}
            <InterruptSignal
                position={[-6, 3, -4]}
                active={showInterrupt}
                onClick={handleInterrupt}
            />

            {/* Victory particles */}
            <VictoryParticles active={showVictory} />

            <OrbitControls enableZoom={true} enablePan={true} minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.2} />
        </>
    )
}

// ===========================================
// ACT 5 EXPORT
// ===========================================
export function Act5_SystemIntegration({ onComplete }: { onComplete: () => void }) {
    const [flowStep, setFlowStep] = useState(0)

    const statusComponents = [
        { name: 'Control Unit', active: flowStep >= 1 },
        { name: 'Registers', active: flowStep >= 2 },
        { name: 'ALU', active: flowStep >= 3 },
        { name: 'Memory', active: flowStep >= 4 },
        { name: 'I/O Unit', active: flowStep >= 5 },
    ]

    const currentStep = flowStep === 0 ? 'Initializing...' :
        flowStep < 5 ? `Processing step ${flowStep}/5` :
            flowStep === 5 ? 'Waiting for interrupt...' :
                'System restored!'

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
            <Canvas
                style={{ width: '100%', height: '100%', background: '#050510' }}
                camera={{ position: [12, 12, 12], fov: 60 }}
                gl={{ antialias: true, alpha: false }}
            >
                <Suspense fallback={null}>
                    <Act5Scene onComplete={onComplete} />
                </Suspense>
            </Canvas>

            {/* Phase indicator */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl px-6 py-3 border border-green-500/30">
                    <p className="text-green-400 font-bold text-center">ACT 5: SYSTEM INTEGRATION</p>
                    <p className="text-gray-400 text-sm text-center">Full CPU Execution Cycle</p>
                </div>
            </div>

            {/* Status panel */}
            <SystemStatusPanel components={statusComponents} currentStep={currentStep} />

            {/* Final message */}
            {flowStep > 5 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 text-center">
                    <div className="bg-green-500/20 backdrop-blur-sm rounded-2xl px-12 py-6 border border-green-500/50">
                        <p className="text-4xl font-black text-green-400 mb-2">🎉 SYSTEM RESTORED!</p>
                        <p className="text-gray-300">CPU Architecture mastered!</p>
                    </div>
                </div>
            )}
        </div>
    )
}
