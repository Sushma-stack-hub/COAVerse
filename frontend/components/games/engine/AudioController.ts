// Audio Controller for game sounds
class AudioManager {
    private context: AudioContext | null = null
    private musicGain: GainNode | null = null
    private sfxGain: GainNode | null = null
    private isMuted: boolean = false

    init() {
        if (typeof window === 'undefined') return
        try {
            this.context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
            this.musicGain = this.context.createGain()
            this.sfxGain = this.context.createGain()
            this.musicGain.connect(this.context.destination)
            this.sfxGain.connect(this.context.destination)
            this.musicGain.gain.value = 0.3
            this.sfxGain.gain.value = 0.5
        } catch {
            console.warn('Audio not supported')
        }
    }

    setMusicVolume(volume: number) {
        if (this.musicGain) this.musicGain.gain.value = volume
    }

    setSFXVolume(volume: number) {
        if (this.sfxGain) this.sfxGain.gain.value = volume
    }

    mute(muted: boolean) {
        this.isMuted = muted
        if (this.musicGain) this.musicGain.gain.value = muted ? 0 : 0.3
        if (this.sfxGain) this.sfxGain.gain.value = muted ? 0 : 0.5
    }

    playSound(type: 'click' | 'success' | 'error' | 'powerup' | 'walk' | 'activate' | 'glitch' | 'victory' | 'dialogue') {
        if (!this.context || this.isMuted) return

        try {
            const osc = this.context.createOscillator()
            const gain = this.context.createGain()
            osc.connect(gain)
            gain.connect(this.sfxGain || this.context.destination)

            const sounds: Record<string, () => void> = {
                click: () => {
                    osc.frequency.value = 800
                    gain.gain.value = 0.05
                    osc.start()
                    setTimeout(() => osc.stop(), 50)
                },
                success: () => {
                    osc.frequency.value = 523
                    gain.gain.value = 0.1
                    osc.start()
                    setTimeout(() => { osc.frequency.value = 659 }, 100)
                    setTimeout(() => { osc.frequency.value = 784 }, 200)
                    setTimeout(() => osc.stop(), 350)
                },
                error: () => {
                    osc.frequency.value = 200
                    osc.type = 'sawtooth'
                    gain.gain.value = 0.12
                    osc.start()
                    setTimeout(() => osc.stop(), 300)
                },
                powerup: () => {
                    osc.frequency.value = 440
                    gain.gain.value = 0.08
                    osc.start()
                    setTimeout(() => { osc.frequency.value = 550 }, 100)
                    setTimeout(() => { osc.frequency.value = 660 }, 200)
                    setTimeout(() => { osc.frequency.value = 880 }, 300)
                    setTimeout(() => osc.stop(), 450)
                },
                walk: () => {
                    osc.frequency.value = 150
                    gain.gain.value = 0.02
                    osc.start()
                    setTimeout(() => osc.stop(), 60)
                },
                activate: () => {
                    osc.frequency.value = 440
                    gain.gain.value = 0.08
                    osc.start()
                    setTimeout(() => { osc.frequency.value = 880 }, 150)
                    setTimeout(() => osc.stop(), 300)
                },
                glitch: () => {
                    osc.frequency.value = 100
                    osc.type = 'square'
                    gain.gain.value = 0.15
                    osc.start()
                    const interval = setInterval(() => {
                        osc.frequency.value = 100 + Math.random() * 200
                    }, 50)
                    setTimeout(() => {
                        clearInterval(interval)
                        osc.stop()
                    }, 400)
                },
                victory: () => {
                    osc.frequency.value = 523
                    gain.gain.value = 0.12
                    osc.start()
                    setTimeout(() => { osc.frequency.value = 659 }, 150)
                    setTimeout(() => { osc.frequency.value = 784 }, 300)
                    setTimeout(() => { osc.frequency.value = 1047 }, 450)
                    setTimeout(() => osc.stop(), 700)
                },
                dialogue: () => {
                    osc.frequency.value = 600
                    gain.gain.value = 0.03
                    osc.start()
                    setTimeout(() => osc.stop(), 30)
                }
            }

            sounds[type]?.()
        } catch { /* Audio not supported */ }
    }

    playAmbient(type: 'cpu_hum' | 'data_flow' | 'alarm') {
        if (!this.context || this.isMuted) return

        const osc = this.context.createOscillator()
        const gain = this.context.createGain()
        osc.connect(gain)
        gain.connect(this.musicGain || this.context.destination)

        switch (type) {
            case 'cpu_hum':
                osc.frequency.value = 60
                osc.type = 'sine'
                gain.gain.value = 0.02
                break
            case 'data_flow':
                osc.frequency.value = 200
                osc.type = 'triangle'
                gain.gain.value = 0.01
                break
            case 'alarm':
                osc.frequency.value = 440
                osc.type = 'square'
                gain.gain.value = 0.1
                break
        }

        osc.start()
        return () => osc.stop()
    }
}

export const audioController = new AudioManager()

// Initialize on first interaction
if (typeof window !== 'undefined') {
    const initAudio = () => {
        audioController.init()
        window.removeEventListener('click', initAudio)
    }
    window.addEventListener('click', initAudio)
}
