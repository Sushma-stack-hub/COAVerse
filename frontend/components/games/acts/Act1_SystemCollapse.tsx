"use client"

import { useState, useEffect, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { useGame, useGameActions } from "../engine/GameState"
import { audioController } from "../engine/AudioController"
import { Engineer } from "../characters/Engineer"
import { SysGuide } from "../characters/SysGuide"
import { GlitchEntity } from "../characters/GlitchEntity"
import { CPUWorld, ControlUnitTower } from "../environments/CPUWorld"

// ACT 1 DIALOGUE
const ACT1_INTRO_DIALOGUE = [
    { speaker: 'NARRATOR' as const, text: "The CPU world is dark. Something has gone terribly wrong.", emotion: 'concerned' as const },
    { speaker: 'SYS' as const, text: "Engineer, you made it. I've been waiting for someone to respond to the emergency beacon.", emotion: 'concerned' as const },
    { speaker: 'SYS' as const, text: "The entire system has collapsed. Data streams are broken, the Control Unit is offline, and nothing is responding.", emotion: 'warning' as const },
    { speaker: 'SYS' as const, text: "If we don't restore the core systems, this machine will be lost forever.", emotion: 'concerned' as const },
    { speaker: 'SYS' as const, text: "I need you to explore this area. Get familiar with the environment. Look for the Control Unit tower - it's our first priority.", emotion: 'neutral' as const },
]

const ACT1_OBJECTIVE = {
    id: 'explore_act1',
    title: 'Explore the CPU World',
    description: 'Look around and find the Control Unit tower',
    completed: false
}

const ACT1_FOUND_CU_DIALOGUE = [
    { speaker: 'SYS' as const, text: "There it is! The Control Unit tower. It's completely dark.", emotion: 'excited' as const },
    { speaker: 'SYS' as const, text: "The Control Unit is the brain of the CPU. It coordinates all operations between components.", emotion: 'neutral' as const },
    { speaker: 'SYS' as const, text: "We'll need to move to the next area to begin the reactivation sequence. Are you ready?", emotion: 'neutral' as const },
]

// Inner 3D scene component
function Act1Scene({ onComplete }: { onComplete: () => void }) {
    const { state } = useGame()
    const { queueDialogue, setObjective, completeObjective, updateProgress, setPhase } = useGameActions()

    const [introComplete, setIntroComplete] = useState(false)
    const [playerPos] = useState<[number, number, number]>([0, 0, 5])
    const [playerState, setPlayerState] = useState<'idle' | 'walking' | 'interacting' | 'success' | 'error'>('idle')
    const [sysVisible, setSysVisible] = useState(true)
    const [foundCU, setFoundCU] = useState(false)
    const [targetPos, setTargetPos] = useState<[number, number, number] | undefined>(undefined)

    // Start intro dialogue
    useEffect(() => {
        const timer = setTimeout(() => {
            queueDialogue(ACT1_INTRO_DIALOGUE)
            setSysVisible(true)
            audioController.playSound('powerup')
        }, 2000)
        return () => clearTimeout(timer)
    }, [queueDialogue])

    // Set objective after intro
    useEffect(() => {
        if (!state.isDialogueActive && !introComplete && state.currentPhase === 'CINEMATIC') {
            setIntroComplete(true)
            setObjective(ACT1_OBJECTIVE)
            setPhase('EXPLORATION')
            updateProgress(20)
        }
    }, [state.isDialogueActive, introComplete, state.currentPhase, setObjective, setPhase, updateProgress])

    const handleCUClick = () => {
        if (foundCU || !introComplete) return

        setFoundCU(true)
        setPlayerState('walking')
        setTargetPos([-2, 0, -3])
        audioController.playSound('success')

        setTimeout(() => {
            setPlayerState('success')
            completeObjective('explore_act1')
            updateProgress(100)
            queueDialogue(ACT1_FOUND_CU_DIALOGUE)
        }, 2000)
    }

    // Complete act after final dialogue
    useEffect(() => {
        if (foundCU && !state.isDialogueActive && state.actProgress === 100) {
            const timer = setTimeout(() => {
                audioController.playSound('victory')
                onComplete()
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [foundCU, state.isDialogueActive, state.actProgress, onComplete])

    return (
        <>
            {/* Scene background color */}
            <color attach="background" args={['#0a0808']} />

            {/* Lighting - increased for visibility */}
            <ambientLight intensity={0.4} />
            <pointLight position={[0, 10, 0]} intensity={1} color="#ff5555" />
            <spotLight position={[10, 15, 10]} angle={0.3} intensity={0.6} color="#ff8888" />
            <hemisphereLight args={['#ff6666', '#330000', 0.3]} />

            {/* Environment */}
            <CPUWorld broken={true}>
                {/* Control Unit Tower (dark/broken) */}
                <ControlUnitTower
                    position={[0, 0, -8]}
                    activated={false}
                    onInteract={handleCUClick}
                />
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
                position={[-3, 2, 3]}
                visible={sysVisible}
                speaking={state.isDialogueActive && state.dialogueQueue[0]?.speaker === 'SYS'}
                emotion={state.dialogueQueue[0]?.emotion}
            />

            {/* Glitch effect if present */}
            <GlitchEntity
                position={[5, 2, 0]}
                visible={state.glitchActive}
                intensity={state.glitchIntensity}
            />

            {/* Camera */}
            <PerspectiveCamera makeDefault position={[8, 6, 12]} fov={60} />
            <OrbitControls
                target={[0, 1, 0]}
                maxPolarAngle={Math.PI / 2.2}
                minDistance={5}
                maxDistance={20}
            />
        </>
    )
}

// Exported wrapper with Canvas
export function Act1_SystemCollapse({ onComplete }: { onComplete: () => void }) {
    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
            <Canvas
                style={{ width: '100%', height: '100%', background: '#0a0808' }}
                camera={{ position: [8, 6, 12], fov: 60 }}
                gl={{ antialias: true, alpha: false }}
            >
                <Suspense fallback={null}>
                    <Act1Scene onComplete={onComplete} />
                </Suspense>
            </Canvas>
        </div>
    )
}
