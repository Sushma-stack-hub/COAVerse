"use client"

import { useState, useEffect, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei"
import { useGame, useGameActions } from "../engine/GameState"
import { audioController } from "../engine/AudioController"
import { Engineer } from "../characters/Engineer"
import { SysGuide } from "../characters/SysGuide"
import { GlitchEntity } from "../characters/GlitchEntity"
import { CPUWorld, ControlUnitTower, LogicGate } from "../environments/CPUWorld"

// ACT 2 DIALOGUE
const ACT2_INTRO_DIALOGUE = [
    { speaker: 'SYS' as const, text: "Welcome to the Control Unit chamber. This is where all CPU operations are coordinated.", emotion: 'neutral' as const },
    { speaker: 'SYS' as const, text: "The Control Unit is protected by a series of logic gates. We need to activate them in the correct sequence.", emotion: 'neutral' as const },
    { speaker: 'SYS' as const, text: "Remember: the Control Unit coordinates EVERYTHING. It must be the first to come online before any other component can work.", emotion: 'warning' as const },
    { speaker: 'SYS' as const, text: "Route the control signals through the gates in order: first the basic gates, then the compound ones.", emotion: 'neutral' as const },
    { speaker: 'SYS' as const, text: "Be careful - wrong sequences will trigger system instability. I'll try to help if things go wrong.", emotion: 'concerned' as const },
]

const GATE_SEQUENCE = ['AND', 'OR', 'NOT', 'NAND'] as const
const GATES = [
    { id: 'and', type: 'AND' as const, position: [-4, 0, 0] as [number, number, number] },
    { id: 'or', type: 'OR' as const, position: [-2, 0, 2] as [number, number, number] },
    { id: 'not', type: 'NOT' as const, position: [2, 0, 2] as [number, number, number] },
    { id: 'nand', type: 'NAND' as const, position: [4, 0, 0] as [number, number, number] },
]

const ACT2_ERROR_DIALOGUE = [
    { speaker: 'GLITCH' as const, text: "WRONG SEQUENCE! SYSTEM DESTABILIZING!", emotion: 'warning' as const },
    { speaker: 'SYS' as const, text: "The sequence is broken! Try again - remember, basic gates first.", emotion: 'concerned' as const },
]

const ACT2_GATE_SUCCESS = [
    { speaker: 'SYS' as const, text: "Excellent! That gate is now active. Keep going!", emotion: 'excited' as const },
]

const ACT2_CU_ACTIVE = [
    { speaker: 'SYS' as const, text: "All gates are active! Now we can bring the Control Unit online!", emotion: 'excited' as const },
    { speaker: 'NARRATOR' as const, text: "The Control Unit hums to life, sending pulses of green light through the chamber.", emotion: 'neutral' as const },
    { speaker: 'SYS' as const, text: "Incredible! The Control Unit is responding. This is the first step to full system recovery.", emotion: 'excited' as const },
    { speaker: 'SYS' as const, text: "The Control Unit will now coordinate the boot sequence for the remaining components.", emotion: 'neutral' as const },
]

// Inner 3D scene component
function Act2Scene({ onComplete }: { onComplete: () => void }) {
    const { state } = useGame()
    const { queueDialogue, setObjective, completeObjective, updateProgress, setPhase, triggerGlitch, clearGlitch, takeDamage, addXP } = useGameActions()

    const [introComplete, setIntroComplete] = useState(false)
    const [playerPos] = useState<[number, number, number]>([0, 0, 6])
    const [playerState, setPlayerState] = useState<'idle' | 'walking' | 'interacting' | 'success' | 'error'>('idle')
    const [activatedGates, setActivatedGates] = useState<string[]>([])
    const [cuActivated, setCuActivated] = useState(false)
    const [currentSequence, setCurrentSequence] = useState(0)
    const [targetPos, setTargetPos] = useState<[number, number, number] | undefined>(undefined)

    // Start intro
    useEffect(() => {
        const timer = setTimeout(() => {
            queueDialogue(ACT2_INTRO_DIALOGUE)
            audioController.playSound('powerup')
        }, 1500)
        return () => clearTimeout(timer)
    }, [queueDialogue])

    // Set objective after intro
    useEffect(() => {
        if (!state.isDialogueActive && !introComplete && state.currentPhase !== 'PUZZLE') {
            setIntroComplete(true)
            setObjective({
                id: 'activate_gates',
                title: 'Activate Logic Gates',
                description: `Activate gates in sequence: ${GATE_SEQUENCE.join(' → ')}`,
                completed: false
            })
            setPhase('PUZZLE')
            updateProgress(10)
        }
    }, [state.isDialogueActive, introComplete, state.currentPhase, setObjective, setPhase, updateProgress])

    const handleGateClick = (gateId: string, gateType: typeof GATE_SEQUENCE[number]) => {
        if (!introComplete || activatedGates.includes(gateId) || cuActivated) return
        if (state.isDialogueActive) return

        const expectedType = GATE_SEQUENCE[currentSequence]
        const gate = GATES.find(g => g.id === gateId)

        if (!gate) return

        // Move player to gate
        setPlayerState('walking')
        setTargetPos([gate.position[0] - 1, 0, gate.position[2] + 1])

        setTimeout(() => {
            if (gateType === expectedType) {
                // Correct!
                audioController.playSound('success')
                setPlayerState('success')
                setActivatedGates(prev => [...prev, gateId])
                setCurrentSequence(prev => prev + 1)
                addXP(25)
                updateProgress(10 + (currentSequence + 1) * 20)

                if (currentSequence + 1 < GATE_SEQUENCE.length) {
                    queueDialogue(ACT2_GATE_SUCCESS)
                }

                setTimeout(() => setPlayerState('idle'), 1000)
            } else {
                // Wrong!
                audioController.playSound('error')
                audioController.playSound('glitch')
                setPlayerState('error')
                triggerGlitch(2)
                takeDamage(10)
                queueDialogue(ACT2_ERROR_DIALOGUE)

                setTimeout(() => {
                    clearGlitch()
                    setPlayerState('idle')
                }, 2000)
            }
        }, 800)
    }

    // Check if all gates activated
    useEffect(() => {
        if (activatedGates.length === 4 && !cuActivated && !state.isDialogueActive) {
            setCuActivated(true)
            setObjective({
                id: 'activate_cu',
                title: 'Control Unit Online',
                description: 'The Control Unit is now active!',
                completed: true
            })
            completeObjective('activate_gates')
            updateProgress(100)
            audioController.playSound('victory')
            queueDialogue(ACT2_CU_ACTIVE)
        }
    }, [activatedGates, cuActivated, state.isDialogueActive, setObjective, completeObjective, updateProgress, queueDialogue])

    // Complete act after CU dialogue
    useEffect(() => {
        if (cuActivated && !state.isDialogueActive && state.actProgress === 100) {
            const timer = setTimeout(() => {
                onComplete()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [cuActivated, state.isDialogueActive, state.actProgress, onComplete])

    return (
        <>
            {/* Scene background color */}
            <color attach="background" args={['#081015']} />

            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <pointLight position={[0, 10, 0]} intensity={1} color={cuActivated ? "#22C55E" : "#06B6D4"} />
            <spotLight position={[0, 8, 0]} angle={0.5} intensity={0.6} color="#06B6D4" />
            <hemisphereLight args={['#06B6D4', '#0a152a', 0.3]} />

            {/* Environment */}
            <CPUWorld broken={!cuActivated}>
                {/* Control Unit Tower */}
                <ControlUnitTower
                    position={[0, 0, -6]}
                    activated={cuActivated}
                    onInteract={() => { }}
                />

                {/* Logic Gates */}
                {GATES.map(gate => (
                    <LogicGate
                        key={gate.id}
                        position={gate.position}
                        type={gate.type}
                        activated={activatedGates.includes(gate.id)}
                        locked={!introComplete || (GATE_SEQUENCE.indexOf(gate.type) > currentSequence && !activatedGates.includes(gate.id))}
                        onInteract={() => handleGateClick(gate.id, gate.type)}
                    />
                ))}

                {/* Sequence indicator */}
                <Text
                    position={[0, 3, 4]}
                    fontSize={0.3}
                    color="#FFFFFF"
                    anchorX="center"
                >
                    {`Sequence: ${GATE_SEQUENCE.map((g, i) =>
                        i < currentSequence ? `✓${g}` : i === currentSequence ? `→${g}` : g
                    ).join(' ')}`}
                </Text>
            </CPUWorld>

            {/* Player */}
            <Engineer
                position={playerPos}
                targetPosition={targetPos}
                state={playerState}
                onReachTarget={() => setPlayerState('idle')}
            />

            {/* SYS Guide */}
            <SysGuide
                position={[-5, 2, 4]}
                visible={true}
                speaking={state.isDialogueActive && state.dialogueQueue[0]?.speaker === 'SYS'}
                emotion={state.dialogueQueue[0]?.emotion}
            />

            {/* Glitch */}
            <GlitchEntity
                position={[6, 2, 0]}
                visible={state.glitchActive}
                intensity={state.glitchIntensity}
            />

            {/* Camera */}
            <PerspectiveCamera makeDefault position={[0, 8, 14]} fov={60} />
            <OrbitControls
                target={[0, 1, -2]}
                maxPolarAngle={Math.PI / 2.2}
                minDistance={5}
                maxDistance={20}
            />
        </>
    )
}

// Exported wrapper with Canvas
export function Act2_ControlUnit({ onComplete }: { onComplete: () => void }) {
    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
            <Canvas
                style={{ width: '100%', height: '100%', background: '#081015' }}
                camera={{ position: [0, 8, 14], fov: 60 }}
                gl={{ antialias: true, alpha: false }}
            >
                <Suspense fallback={null}>
                    <Act2Scene onComplete={onComplete} />
                </Suspense>
            </Canvas>
        </div>
    )
}
