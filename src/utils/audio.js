// Web Audio API Page Flip Sound Synthesizer
// Synthesizes a page-flip sound effect combining white noise sweeps (friction)
// and low-frequency sine waves (paper snapping down) entirely in code.

export function playPageFlipSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    
    // Resume context if suspended (browser security policies)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    // 1. Friction Swish (White Noise + Bandpass Filter)
    const duration = 0.4;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2.0;
    
    // Sweep frequency: 1200Hz -> 2800Hz -> 800Hz
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2800, ctx.currentTime + 0.15);
    filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.35);
    
    const noiseGain = ctx.createGain();
    // Swish envelope
    noiseGain.gain.setValueAtTime(0.001, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.06);
    noiseGain.gain.exponentialRampToValueAtTime(0.015, ctx.currentTime + 0.28);
    noiseGain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + duration);
    
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    // 2. Snap/Thud (Low Frequency Oscillator)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, ctx.currentTime); // Low thud frequency
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.38);
    
    // Sync thud with the landing of page (around 0.25 seconds in)
    oscGain.gain.setValueAtTime(0.0, ctx.currentTime);
    oscGain.gain.setValueAtTime(0.0, ctx.currentTime + 0.2);
    oscGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.24);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
    
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    
    // Start nodes
    noiseSource.start(ctx.currentTime);
    noiseSource.stop(ctx.currentTime + duration);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.05);
    
    // Close context when audio finishes to release hardware
    setTimeout(() => {
      ctx.close();
    }, (duration + 0.1) * 1000);
  } catch (error) {
    console.warn("Web Audio API not supported or blocked: ", error);
  }
}
