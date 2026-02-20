"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import * as THREE from "three"
import { useGame, useGameActions } from "../engine/GameState"

// ===========================================
// CLOCK PULSE WAVE
// ===========================================
function ClockPulseWave({ active }: { active: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [phase, setPhase] = useState(0)

    useFrame((_, delta) => {
        if (active) {
            setPhase(p => (p + delta * 2) % (Math.PI * 2))
        }
    })

    // Create wave geometry
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= 50; i++) {
        const x = (i / 50) * 20 - 10
        const y = Math.sin(x + phase) * 1.5
        points.push(new THREE.Vector3(x, y, 0))
    }
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)

    return (
        <group position={[0, 5, -5]}>
            <line geometry={lineGeometry}>
                <lineBasicMaterial color={active ? "#06B6D4" : "#475569"} linewidth={3} />
            </line>
            <Text position={[-12, 0, 0]} fontSize={0.5} color="#94A3B8">CLK</Text>
        </group>
    )
}

// ===========================================
// CONTROL SIGNAL NODE
// ===========================================
function ControlSignalNode({
    position,
    name,
    active,
    isTarget,
    onClick
}: {
    position: [number, number, number]
    name: string
    active: boolean
    isTarget: boolean
    onClick: () => void
}) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)

    useFrame((_, delta) => {
        if (meshRef.current) {
            if (isTarget) {
                meshRef.current.rotation.y += delta * 2
            }
            if (active) {
                meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1)
            }
        }
    })

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onClick={onClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial
                    color={active ? "#22C55E" : isTarget ? "#06B6D4" : "#475569"}
                    emissive={active ? "#22C55E" : isTarget ? "#06B6D4" : "#000000"}
                    emissiveIntensity={active || isTarget ? 0.5 : 0}
                    transparent
                    opacity={hovered ? 1 : 0.9}
                />
            </mesh>
            <Text position={[0, 2, 0]} fontSize={0.4} color="#FFFFFF" anchorX="center">
                {name}
            </Text>
            {isTarget && (
                <mesh position={[0, 0, 0]}>
                    <ringGeometry args={[1.5, 1.8, 32]} />
                    <meshBasicMaterial color="#06B6D4" transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>
            )}
        </group>
    )
}

// ===========================================
// SIGNAL PATH
// ===========================================
function SignalPath({ from, to, active }: { from: [number, number, number]; to: [number, number, number]; active: boolean }) {
    const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)]
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)

    return (
        <group>
            <line geometry={lineGeometry}>
                <lineBasicMaterial color={active ? "#22C55E" : "#475569"} linewidth={2} />
            </line>
            {active && (
                <mesh position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshBasicMaterial color="#22C55E" />
                </mesh>
            )}
        </group>
    )
}

// ===========================================
// HAZARD OBSTACLE
// ===========================================
function HazardObstacle({ position, type, active }: { position: [number, number, number]; type: 'data' | 'control'; active: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((_, delta) => {
        if (meshRef.current && active) {
            meshRef.current.rotation.z += delta * 3
        }
    })

    if (!active) return null

    return (
        <mesh ref={meshRef} position={position}>
            <tetrahedronGeometry args={[1]} />
            <meshStandardMaterial
                color={type === 'data' ? "#EF4444" : "#F59E0B"}
                emissive={type === 'data' ? "#EF4444" : "#F59E0B"}
                emissiveIntensity={0.5}
            />
        </mesh>
    )
}

// ===========================================
// TIMING SYNC BAR
// ===========================================
function TimingSyncBar({ onSync, syncSuccess }: { onSync: (success: boolean) => void; syncSuccess: boolean | null }) {
    const [position, setPosition] = useState(0)
    const [direction, setDirection] = useState(1)

    useEffect(() => {
        const interval = setInterval(() => {
            setPosition(p => {
                const newPos = p + direction * 2
                if (newPos >= 100 || newPos <= 0) {
                    setDirection(d => -d)
                }
                return Math.max(0, Math.min(100, newPos))
            })
        }, 30)
        return () => clearInterval(interval)
    }, [direction])

    const handleSync = () => {
        // Green zone is 40-60
        const success = position >= 40 && position <= 60
        onSync(success)
    }

    return (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/40 shadow-2xl">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">⏱️ TIMING SYNCHRONIZATION</h3>
            <p className="text-gray-300 text-sm mb-4 text-center">Click when the marker is in the <span className="text-green-400">green zone</span></p>

            {/* Sync bar */}
            <div className="relative w-80 h-8 bg-slate-700 rounded-lg overflow-hidden mb-4">
                {/* Green zone */}
                <div className="absolute top-0 bottom-0 left-[40%] right-[40%] bg-green-500/50" />
                {/* Indicator */}
                <div
                    className="absolute top-0 bottom-0 w-1.5 bg-white rounded shadow-lg transition-none"
                    style={{ left: `${position}%` }}
                />
            </div>

            <button
                onClick={handleSync}
                className="w-full py-3 rounded-xl font-bold text-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all"
            >
                SYNC NOW
            </button>

            {syncSuccess !== null && (
                <p className={`mt-3 text-center font-bold ${syncSuccess ? 'text-green-400' : 'text-red-400'}`}>
                    {syncSuccess ? '✓ Perfect Sync!' : '✗ Timing Miss - Try Again'}
                </p>
            )}
        </div>
    )
}

// ===========================================
// MAIN SCENE
// ===========================================
function Act3Scene({ onComplete }: { onComplete: () => void }) {
    const { state } = useGame()
    const { addXP, updateProgress, setObjective, completeObjective, queueDialogue } = useGameActions()
    const [phase, setPhase] = useState<'intro' | 'signals' | 'timing' | 'hazards' | 'complete'>('intro')
    const [activatedSignals, setActivatedSignals] = useState<string[]>([])
    const [currentTarget, setCurrentTarget] = useState('decode')
    const [clockActive, setClockActive] = useState(false)
    const [showTimingBar, setShowTimingBar] = useState(false)
    const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null)
    const [hazardsCleared, setHazardsCleared] = useState(0)

    const SIGNALS = [
        { id: 'fetch', name: 'FETCH', position: [-6, 0, 0] as [number, number, number] },
        { id: 'decode', name: 'DECODE', position: [-2, 0, 0] as [number, number, number] },
        { id: 'execute', name: 'EXECUTE', position: [2, 0, 0] as [number, number, number] },
        { id: 'memory', name: 'MEMORY', position: [6, 0, 0] as [number, number, number] },
        { id: 'writeback', name: 'WRITE BACK', position: [10, 0, 0] as [number, number, number] },
    ]

    useEffect(() => {
        // Start intro
        queueDialogue([
            { speaker: 'SYS', text: 'Welcome to Act 3: Control & Timing!', emotion: 'excited' },
            { speaker: 'SYS', text: 'The Control Unit coordinates all CPU operations using clock signals.', emotion: 'neutral' },
            { speaker: 'SYS', text: 'Your mission: Activate control signals in sequence and synchronize timing.', emotion: 'neutral' }
        ])
        setObjective({ id: 'act3-signals', title: 'Activate Control Signals', description: 'Click each control signal in order', completed: false })
        setTimeout(() => {
            setPhase('signals')
            setClockActive(true)
        }, 5000)
    }, [])

    const handleSignalClick = (signalId: string) => {
        if (signalId !== currentTarget) return

        setActivatedSignals(prev => [...prev, signalId])
        addXP(20)
        updateProgress((activatedSignals.length + 1) * 20)

        const signalOrder = ['decode', 'execute', 'memory', 'writeback']
        const currentIndex = signalOrder.indexOf(signalId)

        if (currentIndex < signalOrder.length - 1) {
            setCurrentTarget(signalOrder[currentIndex + 1])
        } else {
            // All signals activated
            completeObjective('act3-signals')
            setObjective({ id: 'act3-timing', title: 'Synchronize Timing', description: 'Hit the timing window perfectly', completed: false })
            queueDialogue([{ speaker: 'SYS', text: 'Excellent! Now synchronize the clock timing.', emotion: 'excited' }])
            setTimeout(() => {
                setPhase('timing')
                setShowTimingBar(true)
            }, 2000)
        }
    }

    const handleSync = (success: boolean) => {
        setSyncSuccess(success)
        if (success) {
            addXP(50)
            completeObjective('act3-timing')
            setShowTimingBar(false)
            setObjective({ id: 'act3-hazards', title: 'Clear Hazards', description: 'Navigate past pipeline hazards', completed: false })
            queueDialogue([{ speaker: 'SYS', text: 'Perfect timing! Now clear the pipeline hazards.', emotion: 'excited' }])
            setTimeout(() => {
                setPhase('hazards')
                setSyncSuccess(null)
            }, 2000)
        } else {
            setTimeout(() => setSyncSuccess(null), 1500)
        }
    }

    const handleHazardClear = () => {
        setHazardsCleared(prev => prev + 1)
        addXP(30)
        if (hazardsCleared >= 2) {
            completeObjective('act3-hazards')
            queueDialogue([
                { speaker: 'SYS', text: 'All hazards cleared! Control & Timing restored.', emotion: 'excited' },
                { speaker: 'SYS', text: 'Proceeding to Memory Hierarchy...', emotion: 'neutral' }
            ])
            setPhase('complete')
            updateProgress(100)
            setTimeout(() => onComplete(), 4000)
        }
    }

    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#06B6D4" />
            <pointLight position={[-10, 10, -10]} intensity={0.5} color="#8B5CF6" />

            {/* Background grid */}
            <gridHelper args={[50, 50, '#1E293B', '#1E293B']} position={[0, -3, 0]} />

            {/* Clock pulse wave */}
            <ClockPulseWave active={clockActive} />

            {/* Control signal nodes */}
            {SIGNALS.map((signal, index) => (
                <ControlSignalNode
                    key={signal.id}
                    position={signal.position}
                    name={signal.name}
                    active={activatedSignals.includes(signal.id)}
                    isTarget={signal.id === currentTarget && phase === 'signals'}
                    onClick={() => handleSignalClick(signal.id)}
                />
            ))}

            {/* Signal paths */}
            <SignalPath from={[-6, 0, 0]} to={[-2, 0, 0]} active={activatedSignals.includes('decode')} />
            <SignalPath from={[-2, 0, 0]} to={[2, 0, 0]} active={activatedSignals.includes('execute')} />
            <SignalPath from={[2, 0, 0]} to={[6, 0, 0]} active={activatedSignals.includes('memory')} />
            <SignalPath from={[6, 0, 0]} to={[10, 0, 0]} active={activatedSignals.includes('writeback')} />

            {/* Hazard obstacles */}
            {phase === 'hazards' && (
                <>
                    <HazardObstacle position={[-3, 2, 0]} type="data" active={hazardsCleared < 1} />
                    <HazardObstacle position={[3, 2, 0]} type="control" active={hazardsCleared < 2} />
                    <HazardObstacle position={[0, 3, 0]} type="data" active={hazardsCleared < 3} />
                </>
            )}

            <OrbitControls enableZoom={true} enablePan={true} maxPolarAngle={Math.PI / 2} />
        </>
    )
}

// ===========================================
// ACT 3 EXPORT
// ===========================================
export function Act3_ControlTiming({ onComplete }: { onComplete: () => void }) {
    const [showTimingUI, setShowTimingUI] = useState(false)
    const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null)

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
            <Canvas
                style={{ width: '100%', height: '100%', background: '#0a0a0f' }}
                camera={{ position: [0, 10, 20], fov: 60 }}
                gl={{ antialias: true, alpha: false }}
            >
                <Suspense fallback={null}>
                    <Act3Scene onComplete={onComplete} />
                </Suspense>
            </Canvas>

            {/* Phase indicator */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl px-6 py-3 border border-cyan-500/30">
                    <p className="text-cyan-400 font-bold text-center">ACT 3: CONTROL & TIMING</p>
                    <p className="text-gray-400 text-sm text-center">Synchronize CPU clock signals</p>
                </div>
            </div>

            {/* Hazard clear buttons */}
            <div className="absolute bottom-20 right-8 z-50 space-y-4">
                <button
                    onClick={() => setShowTimingUI(true)}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white"
                >
                    Clear Hazard
                </button>
            </div>
        </div>
    )
}
