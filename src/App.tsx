import { useEffect, useState } from 'react'
import { Select, Video } from '@pexip/components'
import { VideoProcessor } from '@pexip/media-processor'
import { getVideoProcessor } from './video-processor'

import './App.css'

function App() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [processedStream, setProcessedStream] = useState<MediaStream | null>(null)
  const [effect, setEffect] = useState<Effect>('none')
  const [currentVideoProcessor, setCurrentVideoProcessor] = useState<VideoProcessor | null>(null)

  const changeEffect = async (): Promise<void> => {
    if (localStream != null) {
      currentVideoProcessor?.close()
      const videoProcessor = await getVideoProcessor(effect)
      const newProcessedStream = await videoProcessor.process(localStream)
      setProcessedStream(newProcessedStream)
      setCurrentVideoProcessor(videoProcessor)
    }
  }

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true
      })
      .then((stream) => {
        setLocalStream(stream)
        setProcessedStream(stream)
      })
      .catch((error) => {
        console.error('mediaDevice.getUserMedia() error:', error)
        return
      })
  }, [])

  useEffect(() => {
    changeEffect().catch(console.error)
  }, [effect])

  return (
    <>
      <Select
        className="EffectSelector"
        value={effect}
        label={''}
        onValueChange={(value) => setEffect(value as Effect)}
        options={[
          {
            id: 'none',
            label: 'No Effect'
          },
          {
            id: 'blur',
            label: 'Blur Effect'
          },
          {
            id: 'overlay',
            label: 'Background Replacement Effect'
          }
        ]}
      />
      {processedStream != null && <Video className="LocalStreamVideo" isMirrored srcObject={processedStream} />}
    </>
  )
}

export default App
