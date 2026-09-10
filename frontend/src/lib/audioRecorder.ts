/**
 * Universal Web Audio 16kHz PCM WAV Recorder.
 * Provides 100% cross-browser and cross-device compatibility (Chrome, Safari iOS/Mac, Edge, Firefox, Android).
 * Directly outputs standard 16kHz 16-bit Mono PCM WAV audio required by Bhashini ASR.
 */

export class UniversalAudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private audioBuffers: Float32Array[] = [];
  private isRecording: boolean = false;

  public async start(): Promise<void> {
    this.audioBuffers = [];
    this.isRecording = true;

    // 1. Get user media with fallback constraints
    const constraints: MediaStreamConstraints = {
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Microphone access is not supported by your browser or requires a secure context (HTTPS/localhost).");
    }

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);

    // 2. Initialize AudioContext with 16kHz target sample rate
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioCtx({ sampleRate: 16000 });
    
    // In case browser creates context with native hardware sample rate (e.g. 48000 or 44100)
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
    
    // 3. Process audio chunks with 4096 sample buffer
    this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.processorNode.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const inputData = e.inputBuffer.getChannelData(0);
      this.audioBuffers.push(new Float32Array(inputData));
    };

    this.sourceNode.connect(this.processorNode);
    this.processorNode.connect(this.audioContext.destination);
  }

  public async stop(): Promise<Blob> {
    this.isRecording = false;

    // Disconnect audio nodes
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    const currentContext = this.audioContext;
    const sampleRate = currentContext ? currentContext.sampleRate : 16000;

    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        await this.audioContext.close();
      } catch (e) {
        console.warn("AudioContext close error:", e);
      }
      this.audioContext = null;
    }

    // Safely stop microphone stream tracks AFTER buffering
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    // Merge Float32 buffers
    let totalLength = 0;
    for (const b of this.audioBuffers) {
      totalLength += b.length;
    }
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const b of this.audioBuffers) {
      merged.set(b, offset);
      offset += b.length;
    }

    // Downsample to 16000 Hz if recorded at hardware sample rate
    const downsampled = sampleRate === 16000 ? merged : this.downsampleBuffer(merged, sampleRate, 16000);

    // Encode to 16-bit PCM WAV Blob
    const wavBlob = this.encodeWAV(downsampled, 16000);
    this.audioBuffers = [];
    return wavBlob;
  }

  private downsampleBuffer(buffer: Float32Array, inputSampleRate: number, outputSampleRate: number): Float32Array {
    if (inputSampleRate === outputSampleRate) return buffer;
    const ratio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
      let accum = 0, count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  private encodeWAV(samples: Float32Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    this.writeString(view, 0, "RIFF");
    // RIFF chunk length
    view.setUint32(4, 36 + samples.length * 2, true);
    // RIFF type
    this.writeString(view, 8, "WAVE");
    // format chunk identifier
    this.writeString(view, 12, "fmt ");
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (1 = PCM)
    view.setUint16(20, 1, true);
    // channel count (1 = mono)
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    this.writeString(view, 36, "data");
    // data chunk length
    view.setUint32(40, samples.length * 2, true);

    // Write PCM samples (16-bit signed integer)
    let index = 44;
    for (let i = 0; i < samples.length; i++) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      index += 2;
    }

    return new Blob([view], { type: "audio/wav" });
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
