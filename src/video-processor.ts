import {
  VideoProcessor,
  createCanvasTransform,
  createSegmenter,
  createVideoProcessor,
  createVideoTrackProcessor,
  createVideoTrackProcessorWithFallback
} from '@pexip/media-processor'

interface NavigatorUABrandVersion {
  brand: string
  version: string
}

interface NavigatorUAData {
  brands: NavigatorUABrandVersion[]
  mobile: boolean
  platform: string
}

const isChromium = () => {
  if ('userAgentData' in navigator) {
    const { brands } = navigator.userAgentData as NavigatorUAData
    return Boolean(brands.find(({ brand }) => brand === 'Chromium'))
  }
  return false
}

export const getVideoProcessor = async (effect: 'none' | 'blur' | 'overlay'): Promise<VideoProcessor> => {
  const delegate = isChromium() ? 'GPU' : 'CPU'
  // Setting the path to that `@mediapipe/tasks-vision` assets
  // It will be passed direct to
  // [FilesetResolver.forVisionTasks()](https://ai.google.dev/edge/api/mediapipe/js/tasks-vision.filesetresolver#filesetresolverforvisiontasks)
  const tasksVisionBasePath = '/wasm'

  const segmenter = createSegmenter(tasksVisionBasePath, {
    modelAsset: {
      path: '/models/selfie_segmenter.tflite',
      modelName: 'selfie'
    },
    delegate
  })

  const transformer = createCanvasTransform(segmenter, {
    effects: effect,
    backgroundImageUrl: '/backgrounds/background.png'
  })

  const getTrackProcessor = () => {
    // Feature detection if the browser has the `MediaStreamProcessor` API
    if ('MediaStreamTrackProcessor' in window) {
      return createVideoTrackProcessor() // Using the latest Streams API
    }
    return createVideoTrackProcessorWithFallback() // Using the fallback implementation
  }

  const processor = createVideoProcessor([transformer], getTrackProcessor())

  // Start the processor
  await processor.open()

  return processor
}
