/**
 * This file is the audio processor for the extension. It converts the audio data into 16-bit PCM format.
 */
const MAX_16BIT_INT = 32767

class AudioProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: "source",
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
        automationRate: "k-rate",
      },
    ];
  }
  process(inputs, outputs, parameters) {
    //console.error("AudioProcessor.process", parameters)
    try {
      const input = inputs[0]
      if (!input) throw new Error("No input")

      const channelData = input[0]
      if (!channelData) throw new Error("No channelData")

      const float32Array = Float32Array.from(channelData)
      const int16Array = Int16Array.from(
        float32Array.map((n) => n * MAX_16BIT_INT)
      )
      const buffer = int16Array.buffer
      this.port.postMessage({ data: buffer, source: parameters.source[0] })

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }
}
console.log("Registering audio-processor", registerProcessor)
registerProcessor("audio-processor", AudioProcessor)
