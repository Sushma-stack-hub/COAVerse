"use client"

// ============================================================================
// 3D SIMULATION CANVAS
// Three.js canvas for hardware component visualization
// Enhanced with ghost preview, snap-to-grid, and placement confirmation
// ============================================================================

import { Suspense, useRef, useState, useEffect, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, ContactShadows, Float } from "@react-three/drei"
import { useSimulation } from "@/lib/simulation-state"
import type { HardwareComponent, HardwareComponentType } from "@/lib/hardware-schema"
import * as THREE from "three"

// Component colors matching the schema
const COMPONENT_COLORS: Record<HardwareComponentType, string> = {
    register: "#C084FC",
    alu: "#22D3EE",
    memory: "#34D399",
    bus: "#F59E0B",
    "control-unit": "#F472B6",
    mux: "#A78BFA",
    decoder: "#FB923C",
}

// Grid configuration
const GRID_SIZE = 50 // Units per grid cell
const GRID_CELLS = 6

// ============================================================================
// 3D COMPONENT BLOCKS
// ============================================================================

interface ComponentBlockProps {
    component: HardwareComponent
    isSelected: boolean
    isActive: boolean
    isNewlyPlaced?: boolean
    onClick: () => void
}

function ComponentBlock({ component, isSelected, isActive, isNewlyPlaced, onClick }: ComponentBlockProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)
    const [flashOpacity, setFlashOpacity] = useState(isNewlyPlaced ? 1 : 0)

    const color = COMPONENT_COLORS[component.type] || "#8B7CFF"
    const scale = isSelected ? 1.1 : hovered ? 1.05 : 1

    // Flash animation for newly placed components
    useEffect(() => {
        if (isNewlyPlaced) {
            setFlashOpacity(1)
            const timer = setTimeout(() => setFlashOpacity(0), 500)
            return () => clearTimeout(timer)
        }
    }, [isNewlyPlaced])

    // Animate active state
    useFrame((state) => {
        if (meshRef.current && isActive) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05
        }
    })

    // Position based on component position
    const getPosition = (): [number, number, number] => {
        const { x, y } = component.position
        return [x / 50 - 3, 0.5, y / 50 - 2]
    }

    const position = getPosition()

    // Render distinct 3D geometry based on component type
    const renderComponentGeometry = () => {
        switch (component.type) {
            case "register":
                // Register: Rounded box with data display
                return (
                    <group>
                        <mesh ref={meshRef} castShadow receiveShadow>
                            <boxGeometry args={[1.2, 0.6, 0.8]} />
                            <meshStandardMaterial
                                color={color}
                                emissive={color}
                                emissiveIntensity={flashOpacity > 0 ? 0.8 : isActive ? 0.5 : isSelected ? 0.3 : hovered ? 0.15 : 0.05}
                                metalness={0.4}
                                roughness={0.6}
                            />
                        </mesh>
                        {/* Register bit indicators */}
                        {[...Array(4)].map((_, i) => (
                            <mesh key={i} position={[(i - 1.5) * 0.25, 0.31, 0]} castShadow>
                                <boxGeometry args={[0.15, 0.02, 0.6]} />
                                <meshStandardMaterial color="#00FF88" emissive="#00FF88" emissiveIntensity={0.3} />
                            </mesh>
                        ))}
                    </group>
                )

            case "alu":
                // ALU: Hexagonal prism shape
                return (
                    <group>
                        <mesh ref={meshRef} rotation={[0, 0, 0]} castShadow receiveShadow>
                            <cylinderGeometry args={[0.7, 0.9, 0.8, 6]} />
                            <meshStandardMaterial
                                color={color}
                                emissive={color}
                                emissiveIntensity={flashOpacity > 0 ? 0.8 : isActive ? 0.5 : isSelected ? 0.3 : hovered ? 0.15 : 0.05}
                                metalness={0.5}
                                roughness={0.5}
                            />
                        </mesh>
                        {/* ALU operation indicator */}
                        <mesh position={[0, 0.45, 0]}>
                            <sphereGeometry args={[0.15, 16, 16]} />
                            <meshStandardMaterial color="#FFFFFF" emissive="#22D3EE" emissiveIntensity={isActive ? 1 : 0.2} />
                        </mesh>
                    </group>
                )

            case "memory":
                // Memory: Stacked blocks with address lines
                return (
                    <group>
                        {/* Main memory block */}
                        <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
                            <boxGeometry args={[1.2, 1, 0.8]} />
                            <meshStandardMaterial
                                color={color}
                                emissive={color}
                                emissiveIntensity={flashOpacity > 0 ? 0.8 : isActive ? 0.5 : isSelected ? 0.3 : hovered ? 0.15 : 0.05}
                                metalness={0.3}
                                roughness={0.7}
                            />
                        </mesh>
                        {/* Memory cell dividers */}
                        {[...Array(4)].map((_, i) => (
                            <mesh key={i} position={[0, (i - 1.5) * 0.22, 0.41]} castShadow>
                                <boxGeometry args={[1.1, 0.02, 0.01]} />
                                <meshStandardMaterial color="#1a1a2e" />
                            </mesh>
                        ))}
                    </group>
                )

            case "bus":
                // Bus: Long connector with data flow lines
                return (
                    <group>
                        {/* Main bus bar */}
                        <mesh ref={meshRef} castShadow receiveShadow>
                            <boxGeometry args={[4, 0.15, 0.3]} />
                            <meshStandardMaterial
                                color={color}
                                emissive={color}
                                emissiveIntensity={flashOpacity > 0 ? 0.8 : isActive ? 0.8 : isSelected ? 0.4 : hovered ? 0.2 : 0.1}
                                metalness={0.7}
                                roughness={0.3}
                            />
                        </mesh>
                        {/* Data flow indicators */}
                        {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
                            <mesh key={i} position={[x, 0.1, 0]} castShadow>
                                <boxGeometry args={[0.15, 0.05, 0.35]} />
                                <meshStandardMaterial
                                    color="#FFFFFF"
                                    emissive={color}
                                    emissiveIntensity={isActive ? 0.8 : 0.2}
                                />
                            </mesh>
                        ))}
                    </group>
                )

            case "control-unit":
                // Control Unit: Panel with signal outputs
                return (
                    <group>
                        <mesh ref={meshRef} castShadow receiveShadow>
                            <boxGeometry args={[1.4, 0.6, 0.8]} />
                            <meshStandardMaterial
                                color={color}
                                emissive={color}
                                emissiveIntensity={flashOpacity > 0 ? 0.8 : isActive ? 0.5 : isSelected ? 0.3 : hovered ? 0.15 : 0.05}
                                metalness={0.4}
                                roughness={0.6}
                            />
                        </mesh>
                        {/* Signal indicators */}
                        {[-0.35, 0, 0.35].map((z, i) => (
                            <mesh key={i} position={[0.71, 0.1, z]} castShadow>
                                <sphereGeometry args={[0.08, 8, 8]} />
                                <meshStandardMaterial
                                    color={isActive ? "#00FF88" : "#333"}
                                    emissive={isActive ? "#00FF88" : "#333"}
                                    emissiveIntensity={isActive ? 1 : 0.1}
                                />
                            </mesh>
                        ))}
                    </group>
                )

            default:
                // Default box
                return (
                    <mesh ref={meshRef} castShadow receiveShadow>
                        <boxGeometry args={[1, 0.6, 0.8]} />
                        <meshStandardMaterial
                            color={color}
                            emissive={color}
                            emissiveIntensity={0.1}
                            metalness={0.3}
                            roughness={0.7}
                        />
                    </mesh>
                )
        }
    }

    // Get label height based on component type
    const getLabelHeight = () => {
        switch (component.type) {
            case "memory": return 0.65
            case "alu": return 0.55
            case "bus": return 0.25
            default: return 0.45
        }
    }

    return (
        <group position={position}>
            <Float speed={isActive ? 2 : 0} rotationIntensity={isActive ? 0.1 : 0} floatIntensity={isActive ? 0.2 : 0}>
                <group
                    onClick={(e) => {
                        e.stopPropagation()
                        onClick()
                    }}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                    scale={scale}
                >
                    {renderComponentGeometry()}

                    {/* Placement flash effect */}
                    {flashOpacity > 0 && (
                        <mesh scale={1.3}>
                            <sphereGeometry args={[0.8, 16, 16]} />
                            <meshBasicMaterial color={color} transparent opacity={flashOpacity * 0.3} />
                        </mesh>
                    )}

                    {/* Component label */}
                    <Text
                        position={[0, getLabelHeight(), 0]}
                        fontSize={0.18}
                        color="white"
                        anchorX="center"
                        anchorY="bottom"
                        outlineWidth={0.02}
                        outlineColor="#000000"
                    >
                        {component.label}
                    </Text>

                    {/* Value display for registers */}
                    {component.type === "register" && "value" in component.state && (
                        <Text
                            position={[0, 0, 0.41]}
                            fontSize={0.25}
                            color="#00FF88"
                            anchorX="center"
                            anchorY="middle"
                            outlineWidth={0.01}
                            outlineColor="#000000"
                        >
                            {String((component.state as { value: number }).value).padStart(2, "0")}
                        </Text>
                    )}

                    {/* Selection ring */}
                    {isSelected && (
                        <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <ringGeometry args={[1, 1.1, 32]} />
                            <meshBasicMaterial color={color} transparent opacity={0.6} />
                        </mesh>
                    )}
                </group>
            </Float>
        </group>
    )
}


// ============================================================================
// GHOST COMPONENT PREVIEW
// ============================================================================

interface GhostComponentProps {
    type: HardwareComponentType
    position: [number, number, number]
    isValid: boolean
}

function GhostComponent({ type, position, isValid }: GhostComponentProps) {
    const color = isValid ? COMPONENT_COLORS[type] : "#FF4444"

    // Render ghost geometry matching actual component shapes
    const renderGhostGeometry = () => {
        const opacity = 0.35
        const emissiveIntensity = 0.4

        switch (type) {
            case "register":
                return (
                    <mesh>
                        <boxGeometry args={[1.2, 0.6, 0.8]} />
                        <meshStandardMaterial color={color} transparent opacity={opacity} emissive={color} emissiveIntensity={emissiveIntensity} />
                    </mesh>
                )
            case "alu":
                return (
                    <mesh>
                        <cylinderGeometry args={[0.7, 0.9, 0.8, 6]} />
                        <meshStandardMaterial color={color} transparent opacity={opacity} emissive={color} emissiveIntensity={emissiveIntensity} />
                    </mesh>
                )
            case "memory":
                return (
                    <mesh>
                        <boxGeometry args={[1.2, 1, 0.8]} />
                        <meshStandardMaterial color={color} transparent opacity={opacity} emissive={color} emissiveIntensity={emissiveIntensity} />
                    </mesh>
                )
            case "bus":
                return (
                    <mesh>
                        <boxGeometry args={[4, 0.15, 0.3]} />
                        <meshStandardMaterial color={color} transparent opacity={opacity} emissive={color} emissiveIntensity={0.6} />
                    </mesh>
                )
            case "control-unit":
                return (
                    <mesh>
                        <boxGeometry args={[1.4, 0.6, 0.8]} />
                        <meshStandardMaterial color={color} transparent opacity={opacity} emissive={color} emissiveIntensity={emissiveIntensity} />
                    </mesh>
                )
            default:
                return (
                    <mesh>
                        <boxGeometry args={[1, 0.6, 0.8]} />
                        <meshStandardMaterial color={color} transparent opacity={opacity} emissive={color} emissiveIntensity={emissiveIntensity} />
                    </mesh>
                )
        }
    }

    // Get height for label positioning
    const getLabelHeight = () => {
        switch (type) {
            case "memory": return 0.7
            case "bus": return 0.25
            default: return 0.5
        }
    }

    return (
        <group position={position}>
            {/* Ghost mesh */}
            {renderGhostGeometry()}

            {/* Placement zone indicator */}
            <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.8, 32]} />
                <meshBasicMaterial color={isValid ? "#22C55E" : "#EF4444"} transparent opacity={0.4} />
            </mesh>

            {/* Type label */}
            <Text
                position={[0, getLabelHeight(), 0]}
                fontSize={0.15}
                color={isValid ? "#22C55E" : "#EF4444"}
                anchorX="center"
                anchorY="bottom"
                outlineWidth={0.02}
                outlineColor="#000000"
            >
                {type.toUpperCase()}
            </Text>
        </group>
    )
}

// ============================================================================
// SNAP GRID VISUALIZATION
// ============================================================================

interface SnapGridProps {
    isActive: boolean
    highlightPosition?: [number, number, number]
    isValid?: boolean
}

function SnapGrid({ isActive, highlightPosition, isValid }: SnapGridProps) {
    if (!isActive) return null

    const gridPoints: [number, number, number][] = []
    for (let x = -3; x <= 3; x++) {
        for (let z = -2; z <= 3; z++) {
            gridPoints.push([x, 0.02, z])
        }
    }

    return (
        <group>
            {gridPoints.map((pos, i) => {
                const isHighlighted =
                    highlightPosition &&
                    Math.abs(pos[0] - highlightPosition[0]) < 0.5 &&
                    Math.abs(pos[2] - highlightPosition[2]) < 0.5

                return (
                    <mesh key={i} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[0.1, 16]} />
                        <meshBasicMaterial
                            color={isHighlighted ? (isValid ? "#22C55E" : "#EF4444") : "#333333"}
                            transparent
                            opacity={isHighlighted ? 0.8 : 0.3}
                        />
                    </mesh>
                )
            })}
        </group>
    )
}

// ============================================================================
// DATA PATH VISUALIZATION
// ============================================================================

interface DataPathLineProps {
    from: THREE.Vector3
    to: THREE.Vector3
    isActive: boolean
    color: string
}

function DataPathLine({ from, to, isActive, color }: DataPathLineProps) {
    // Create curved path
    const curve = new THREE.QuadraticBezierCurve3(
        from,
        new THREE.Vector3((from.x + to.x) / 2, Math.max(from.y, to.y) + 0.5, (from.z + to.z) / 2),
        to
    )
    const points = curve.getPoints(50)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
        color: isActive ? color : "#333333",
        transparent: true,
        opacity: isActive ? 1 : 0.3,
    })
    const line = new THREE.Line(geometry, material)

    return <primitive object={line} />
}

// ============================================================================
// GRID AND ENVIRONMENT
// ============================================================================

function SceneEnvironment() {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
                position={[5, 10, 5]}
                intensity={1}
                castShadow
                shadow-mapSize={[2048, 2048]}
            />
            <pointLight position={[-5, 5, -5]} intensity={0.5} color="#C084FC" />
            <pointLight position={[5, 5, -5]} intensity={0.5} color="#22D3EE" />

            {/* Ground grid */}
            <gridHelper args={[20, 20, "#1a1a2e", "#1a1a2e"]} position={[0, 0, 0]} />

            {/* Contact shadows */}
            <ContactShadows
                position={[0, 0, 0]}
                opacity={0.4}
                scale={20}
                blur={2}
                far={10}
                color="#000000"
            />
        </>
    )
}

// ============================================================================
// CAMERA CONTROLS WRAPPER
// ============================================================================

function CameraController({ focusPosition }: { focusPosition?: [number, number, number] }) {
    const { camera } = useThree()
    const controlsRef = useRef<any>(null)

    // Set initial camera position
    useEffect(() => {
        camera.position.set(5, 5, 5)
        camera.lookAt(0, 0, 0)
    }, [camera])

    // Focus on new placement
    useEffect(() => {
        if (focusPosition && controlsRef.current) {
            controlsRef.current.target.set(focusPosition[0], focusPosition[1], focusPosition[2])
        }
    }, [focusPosition])

    return (
        <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={15}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2 - 0.1}
        />
    )
}

// ============================================================================
// MAIN CANVAS COMPONENT
// ============================================================================

export function Simulation3DCanvas() {
    const { state, selectComponent, getActiveSignals, placeComponent, getCurrentStage } = useSimulation()
    const [selectedPaletteItem, setSelectedPaletteItem] = useState<HardwareComponentType | null>(null)
    const [ghostPosition, setGhostPosition] = useState<[number, number, number]>([0, 0.5, 0])
    const [isValidPlacement, setIsValidPlacement] = useState(true)
    const [newlyPlacedId, setNewlyPlacedId] = useState<string | null>(null)
    const [focusPosition, setFocusPosition] = useState<[number, number, number] | undefined>()
    const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null)

    const activeSignals = getActiveSignals()
    const hasActiveSignals = activeSignals.length > 0
    const currentStage = getCurrentStage()

    // Get available components for current stage
    const availableComponents = currentStage?.availableComponents || ["register", "alu", "memory", "bus", "control-unit"]

    // Snap position to grid
    const snapToGrid = useCallback((x: number, z: number): [number, number, number] => {
        const snappedX = Math.round(x)
        const snappedZ = Math.round(z)
        return [snappedX, 0.5, snappedZ]
    }, [])

    // Check if placement is valid (no overlapping)
    const checkValidPlacement = useCallback((x: number, z: number): boolean => {
        const threshold = 1.5
        return !state.simulation.components.some(comp => {
            const compX = comp.position.x / 50 - 3
            const compZ = comp.position.y / 50 - 2
            return Math.abs(compX - x) < threshold && Math.abs(compZ - z) < threshold
        })
    }, [state.simulation.components])

    // Mouse move handler for ghost preview
    const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (!selectedPaletteItem) return

        const rect = event.currentTarget.getBoundingClientRect()
        const normalizedX = (event.clientX - rect.left) / rect.width
        const normalizedZ = (event.clientY - rect.top) / rect.height

        // Convert to 3D coordinates
        const x = (normalizedX - 0.5) * 6
        const z = (normalizedZ - 0.5) * 5

        const [snappedX, y, snappedZ] = snapToGrid(x, z)
        setGhostPosition([snappedX, y, snappedZ])
        setIsValidPlacement(checkValidPlacement(snappedX, snappedZ))
    }, [selectedPaletteItem, snapToGrid, checkValidPlacement])

    // Handle placement
    const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (selectedPaletteItem && isValidPlacement) {
            // Convert 3D position back to schema coordinates
            const x = (ghostPosition[0] + 3) * 50
            const y = (ghostPosition[2] + 2) * 50

            placeComponent(selectedPaletteItem, { x, y })

            // Generate temporary ID for flash effect
            const tempId = `${selectedPaletteItem}-${Date.now()}`
            setNewlyPlacedId(tempId)
            setFocusPosition(ghostPosition)

            // Show confirmation message
            const labels: Record<string, string> = {
                register: "Register",
                alu: "ALU",
                memory: "Memory",
                bus: "Bus",
                "control-unit": "Control Unit",
            }
            setConfirmationMessage(`${labels[selectedPaletteItem] || selectedPaletteItem} placed successfully!`)

            // Clear states after animation
            setTimeout(() => {
                setNewlyPlacedId(null)
                setConfirmationMessage(null)
            }, 2000)

            setSelectedPaletteItem(null)
        }
    }, [selectedPaletteItem, isValidPlacement, ghostPosition, placeComponent])

    // ESC to cancel placement
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && selectedPaletteItem) {
                setSelectedPaletteItem(null)
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [selectedPaletteItem])

    return (
        <div
            className="w-full h-full relative"
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
        >
            <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
                <Suspense fallback={null}>
                    <SceneEnvironment />
                    <CameraController focusPosition={focusPosition} />

                    {/* Snap grid */}
                    <SnapGrid
                        isActive={!!selectedPaletteItem}
                        highlightPosition={ghostPosition}
                        isValid={isValidPlacement}
                    />

                    {/* Ghost preview */}
                    {selectedPaletteItem && (
                        <GhostComponent
                            type={selectedPaletteItem}
                            position={ghostPosition}
                            isValid={isValidPlacement}
                        />
                    )}

                    {/* Render placed components */}
                    {state.simulation.components.map((component, index) => (
                        <ComponentBlock
                            key={component.id}
                            component={component}
                            isSelected={state.selectedComponent === component.id}
                            isActive={hasActiveSignals}
                            isNewlyPlaced={index === state.simulation.components.length - 1 && !!newlyPlacedId}
                            onClick={() => selectComponent(component.id)}
                        />
                    ))}

                    {/* Render data paths */}
                    {state.simulation.dataPaths.map((path) => {
                        const fromComponent = state.simulation.components.find(c => c.id === path.fromComponent)
                        const toComponent = state.simulation.components.find(c => c.id === path.toComponent)

                        if (!fromComponent || !toComponent) return null

                        const from = new THREE.Vector3(
                            fromComponent.position.x / 50 - 3,
                            0.5,
                            fromComponent.position.y / 50 - 2
                        )
                        const to = new THREE.Vector3(
                            toComponent.position.x / 50 - 3,
                            0.5,
                            toComponent.position.y / 50 - 2
                        )

                        return (
                            <DataPathLine
                                key={path.id}
                                from={from}
                                to={to}
                                isActive={path.active}
                                color={COMPONENT_COLORS[fromComponent.type]}
                            />
                        )
                    })}

                    {/* Instructions overlay when no components */}
                    {state.simulation.components.length === 0 && !selectedPaletteItem && (
                        <Text
                            position={[0, 1, 0]}
                            fontSize={0.3}
                            color="#666666"
                            anchorX="center"
                            anchorY="middle"
                        >
                            Select a component below, then click to place
                        </Text>
                    )}
                </Suspense>
            </Canvas>

            {/* Component Palette */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-xl bg-black/80 border border-purple-500/30 backdrop-blur-sm">
                {(["register", "alu", "memory", "bus"] as HardwareComponentType[]).map((type) => {
                    const isAvailable = availableComponents.includes(type)
                    const isSelected = selectedPaletteItem === type
                    const color = COMPONENT_COLORS[type]
                    const labels: Record<string, { name: string; icon: string }> = {
                        register: { name: "Register", icon: "📦" },
                        alu: { name: "ALU", icon: "⚙️" },
                        memory: { name: "Memory", icon: "🗄️" },
                        bus: { name: "Bus", icon: "═══" },
                    }

                    return (
                        <button
                            key={type}
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedPaletteItem(isSelected ? null : type)
                            }}
                            disabled={!isAvailable}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${isSelected
                                ? "ring-2 ring-offset-2 ring-offset-black"
                                : isAvailable
                                    ? "hover:bg-white/10"
                                    : "opacity-30 cursor-not-allowed"
                                }`}
                            style={isSelected ? {
                                backgroundColor: `${color}30`,
                                ["--tw-ring-color" as any]: color,
                            } : undefined}
                        >
                            <span className="text-lg">{labels[type]?.icon}</span>
                            <span className="text-[10px] font-medium" style={{ color: isSelected ? color : "#888" }}>
                                {labels[type]?.name}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Placement instruction */}
            {selectedPaletteItem && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
                    <div className={`px-4 py-2 rounded-lg border backdrop-blur-sm text-sm ${isValidPlacement
                        ? "bg-green-500/20 border-green-500/50 text-green-300"
                        : "bg-red-500/20 border-red-500/50 text-red-300"}`}>
                        {isValidPlacement
                            ? `Click to place ${selectedPaletteItem} • ESC to cancel`
                            : "Invalid placement - overlaps with existing component"}
                    </div>
                </div>
            )}

            {/* Placement confirmation message */}
            {confirmationMessage && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/50 text-sm text-green-300 flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        {confirmationMessage}
                    </div>
                </div>
            )}

            {/* Canvas overlay info */}
            <div className="absolute bottom-4 left-4 text-xs text-gray-500">
                <div>🖱️ Drag to rotate • Scroll to zoom • Shift+Drag to pan</div>
            </div>

            {/* Clock cycle indicator */}
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/60 border border-cyan-500/30">
                <div className="text-xs text-gray-400">Clock Cycle</div>
                <div className="text-lg font-mono font-bold text-cyan-400">
                    {state.simulation.clockCycle}
                </div>
            </div>
        </div>
    )
}
