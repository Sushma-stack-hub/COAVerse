"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import * as THREE from "three"
import { useGame, useGameActions } from "../engine/GameState"

// ===========================================
// MEMORY LAYER (Concentric Ring)
// ===========================================
function MemoryLayer({
    radius,
    label,
    color,
    active,
    isTarget,
    onClick
}: {
    radius: number
    label: string
    color: string
    active: boolean
    isTarget: boolean
    onClick: () => void
}) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((_, delta) => {
        if (meshRef.current) {
            if (isTarget) {
                meshRef.current.rotation.z += delta * 0.5
            }
        }
    })

    return (
        <group>
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} onClick={onClick}>
                <ringGeometry args={[radius - 1, radius, 64]} />
                <meshStandardMaterial
                    color={color}
                    emissive={isTarget ? color : active ? "#22C55E" : "#000000"}
                    emissiveIntensity={active || isTarget ? 0.5 : 0}
                    transparent
                    opacity={0.8}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <Text
                position={[radius - 0.5, 0.5, 0]}
                fontSize={0.8}
                color={active ? "#22C55E" : "#FFFFFF"}
                anchorX="center"
            >
                {label}
            </Text>
            {active && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                    <ringGeometry args={[radius - 1.05, radius - 0.95, 64]} />
                    <meshBasicMaterial color="#22C55E" />
                </mesh>
            )}
        </group>
    )
}

// ===========================================
// DATA PACKET (Moving Particle)
// ===========================================
function DataPacket({
    startPosition,
    endPosition,
    active,
    speed = 'fast',
    onArrive
}: {
    startPosition: [number, number, number]
    endPosition: [number, number, number]
    active: boolean
    speed?: 'fast' | 'slow'
    onArrive?: () => void
}) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [progress, setProgress] = useState(0)

    useFrame((_, delta) => {
        if (active && meshRef.current) {
            const speedMultiplier = speed === 'fast' ? 1.5 : 0.3
            setProgress(p => {
                const newP = p + delta * speedMultiplier
                if (newP >= 1) {
                    onArrive?.()
                    return 0
                }
                return newP
            })

            const x = startPosition[0] + (endPosition[0] - startPosition[0]) * progress
            const y = startPosition[1] + (endPosition[1] - startPosition[1]) * progress + Math.sin(progress * Math.PI) * 2
            const z = startPosition[2] + (endPosition[2] - startPosition[2]) * progress
            meshRef.current.position.set(x, y, z)
        }
    })

    if (!active) return null

    return (
        <mesh ref={meshRef} position={startPosition}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial
                color={speed === 'fast' ? "#22C55E" : "#EF4444"}
                emissive={speed === 'fast' ? "#22C55E" : "#EF4444"}
                emissiveIntensity={0.8}
            />
        </mesh>
    )
}

// ===========================================
// CACHE HIT/MISS INDICATOR
// ===========================================
function CacheIndicator({ type, visible }: { type: 'hit' | 'miss'; visible: boolean }) {
    if (!visible) return null

    return (
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 
            px-8 py-4 rounded-2xl font-black text-4xl animate-bounce
            ${type === 'hit'
                ? 'bg-green-500/90 text-white shadow-[0_0_60px_rgba(34,197,94,0.8)]'
                : 'bg-red-500/90 text-white shadow-[0_0_60px_rgba(239,68,68,0.8)]'
            }`}
        >
            {type === 'hit' ? '⚡ CACHE HIT!' : '💨 CACHE MISS'}
        </div>
    )
}

// ===========================================
// ADDRESS INPUT
// ===========================================
function AddressInput({ onSubmit }: { onSubmit: (address: string) => void }) {
    const [address, setAddress] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = () => {
        if (address.match(/^0x[0-9A-Fa-f]{4}$/)) {
            setError('')
            onSubmit(address)
        } else {
            setError('Invalid format! Use 0xXXXX (e.g., 0x4A2B)')
        }
    }

    return (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/40 shadow-2xl">
            <h3 className="text-xl font-bold text-purple-400 mb-4 text-center">💾 MEMORY ACCESS</h3>
            <p className="text-gray-300 text-sm mb-4 text-center">Enter memory address to fetch data</p>
            <p className="text-cyan-400 text-xs mb-4 text-center">Hint: Try <code className="bg-slate-800 px-2 py-1 rounded">0x4A2B</code></p>

            <div className="flex gap-3">
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value.toUpperCase())}
                    placeholder="0x0000"
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white font-mono text-lg focus:outline-none focus:border-purple-500"
                />
                <button
                    onClick={handleSubmit}
                    className="px-6 py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all"
                >
                    FETCH
                </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
        </div>
    )
}

// ===========================================
// MAIN SCENE
// ===========================================
function Act4Scene({ onComplete }: { onComplete: () => void }) {
    const { state } = useGame()
    const { addXP, updateProgress, setObjective, completeObjective, queueDialogue } = useGameActions()
    const [phase, setPhase] = useState<'intro' | 'explore' | 'address' | 'transfer' | 'complete'>('intro')
    const [activeLayer, setActiveLayer] = useState<string | null>(null)
    const [showCacheIndicator, setShowCacheIndicator] = useState<'hit' | 'miss' | null>(null)
    const [showAddressInput, setShowAddressInput] = useState(false)
    const [transferActive, setTransferActive] = useState(false)
    const [transferSpeed, setTransferSpeed] = useState<'fast' | 'slow'>('fast')
    const [visitedLayers, setVisitedLayers] = useState<string[]>([])

    const MEMORY_LAYERS = [
        { id: 'l1', label: 'L1 Cache', radius: 3, color: '#22C55E' },
        { id: 'l2', label: 'L2 Cache', radius: 5, color: '#3B82F6' },
        { id: 'l3', label: 'L3 Cache', radius: 7, color: '#8B5CF6' },
        { id: 'ram', label: 'RAM', radius: 10, color: '#F59E0B' },
        { id: 'disk', label: 'Storage', radius: 13, color: '#EF4444' },
    ]

    useEffect(() => {
        queueDialogue([
            { speaker: 'SYS', text: 'Welcome to Act 4: Memory Hierarchy!', emotion: 'excited' },
            { speaker: 'SYS', text: 'Memory is organized in layers. Closer = faster!', emotion: 'neutral' },
            { speaker: 'SYS', text: 'L1 Cache is fastest, Disk storage is slowest.', emotion: 'neutral' },
            { speaker: 'SYS', text: 'Click each layer to learn about it.', emotion: 'neutral' }
        ])
        setObjective({ id: 'act4-explore', title: 'Explore Memory Layers', description: 'Click each memory layer', completed: false })
        setTimeout(() => setPhase('explore'), 6000)
    }, [])

    const handleLayerClick = (layerId: string) => {
        if (phase !== 'explore') return

        setActiveLayer(layerId)

        if (!visitedLayers.includes(layerId)) {
            setVisitedLayers(prev => [...prev, layerId])
            addXP(15)
            updateProgress(visitedLayers.length * 20)

            // Show cache hit/miss animation based on layer
            if (layerId === 'l1' || layerId === 'l2') {
                setShowCacheIndicator('hit')
                setTransferSpeed('fast')
            } else {
                setShowCacheIndicator('miss')
                setTransferSpeed('slow')
            }
            setTimeout(() => setShowCacheIndicator(null), 1500)

            const layerInfo: Record<string, string> = {
                'l1': 'L1 Cache: Fastest! 1-4 CPU cycles. Tiny but lightning quick.',
                'l2': 'L2 Cache: Fast! 10-20 cycles. Larger than L1.',
                'l3': 'L3 Cache: Moderate speed. 30-50 cycles. Shared between cores.',
                'ram': 'RAM: Main memory. 100+ cycles. Much larger but slower.',
                'disk': 'Storage: Slowest! Millions of cycles. Persistent but very slow.'
            }
            queueDialogue([{ speaker: 'SYS', text: layerInfo[layerId], emotion: 'neutral' }])
        }

        if (visitedLayers.length >= 4) {
            completeObjective('act4-explore')
            setObjective({ id: 'act4-address', title: 'Memory Addressing', description: 'Enter a valid memory address', completed: false })
            queueDialogue([{ speaker: 'SYS', text: 'Great! Now let\'s practice memory addressing.', emotion: 'excited' }])
            setTimeout(() => {
                setPhase('address')
                setShowAddressInput(true)
            }, 2000)
        }
    }

    const handleAddressSubmit = (address: string) => {
        setShowAddressInput(false)
        addXP(50)
        completeObjective('act4-address')

        queueDialogue([
            { speaker: 'SYS', text: `Address ${address} resolved! Initiating data transfer...`, emotion: 'excited' }
        ])

        setPhase('transfer')
        setTransferActive(true)
        updateProgress(80)

        setTimeout(() => {
            setTransferActive(false)
            queueDialogue([
                { speaker: 'SYS', text: 'Memory hierarchy mastered! Moving to System Integration...', emotion: 'excited' }
            ])
            setPhase('complete')
            updateProgress(100)
            setTimeout(() => onComplete(), 3000)
        }, 4000)
    }

    return (
        <>
            <ambientLight intensity={0.4} />
            <pointLight position={[0, 15, 0]} intensity={1.5} color="#8B5CF6" />
            <pointLight position={[10, 5, 10]} intensity={0.5} color="#22C55E" />

            {/* Background */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#0F172A" />
            </mesh>

            {/* Memory layers */}
            {MEMORY_LAYERS.map((layer, index) => (
                <MemoryLayer
                    key={layer.id}
                    radius={layer.radius}
                    label={layer.label}
                    color={layer.color}
                    active={visitedLayers.includes(layer.id)}
                    isTarget={phase === 'explore' && !visitedLayers.includes(layer.id)}
                    onClick={() => handleLayerClick(layer.id)}
                />
            ))}

            {/* CPU core at center */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1.5, 1, 1.5]} />
                <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.5} />
            </mesh>
            <Text position={[0, 1.5, 0]} fontSize={0.5} color="#FFFFFF" anchorX="center">
                CPU
            </Text>

            {/* Data packet transfer */}
            <DataPacket
                startPosition={[12, 0, 0]}
                endPosition={[0, 0.5, 0]}
                active={transferActive}
                speed={transferSpeed}
                onArrive={() => setTransferActive(false)}
            />

            <OrbitControls enableZoom={true} enablePan={true} minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.5} />
        </>
    )
}

// ===========================================
// ACT 4 EXPORT
// ===========================================
export function Act4_MemoryHierarchy({ onComplete }: { onComplete: () => void }) {
    const [showAddressInput, setShowAddressInput] = useState(false)
    const [showCacheIndicator, setShowCacheIndicator] = useState<'hit' | 'miss' | null>(null)

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
            <Canvas
                style={{ width: '100%', height: '100%', background: '#0a0a15' }}
                camera={{ position: [0, 20, 15], fov: 60 }}
                gl={{ antialias: true, alpha: false }}
            >
                <Suspense fallback={null}>
                    <Act4Scene onComplete={onComplete} />
                </Suspense>
            </Canvas>

            {/* Phase indicator */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl px-6 py-3 border border-purple-500/30">
                    <p className="text-purple-400 font-bold text-center">ACT 4: MEMORY HIERARCHY</p>
                    <p className="text-gray-400 text-sm text-center">Cache, RAM & Storage Layers</p>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-8 left-8 z-50 bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <p className="text-gray-400 text-sm font-bold mb-2">Speed Legend</p>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500" /> L1 (Fastest)</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500" /> L2</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-500" /> L3</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-500" /> RAM</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500" /> Disk (Slowest)</div>
                </div>
            </div>

            <CacheIndicator type={showCacheIndicator || 'hit'} visible={showCacheIndicator !== null} />
        </div>
    )
}
