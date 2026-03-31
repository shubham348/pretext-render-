import { useEffect, useMemo, useRef, useState } from 'react'
import { useCanvasRenderer } from '../hooks/useCanvasRenderer'
import { useDraggableObject } from '../hooks/useDraggableObject'
import {
  CANVAS_BOTTOM_PADDING,
  CANVAS_HORIZONTAL_PADDING,
  CANVAS_TOP_PADDING,
} from '../lib/canvasLayout'
import { computeFlowLayout } from '../lib/flowLayout'

function getMediaKind(url) {
  const value = url.toLowerCase()

  if (/\.(mp4|webm|ogg|mov)(\?|#|$)/.test(value)) return 'video'
  if (/\.(gif|png|jpg|jpeg|webp|avif|svg)(\?|#|$)/.test(value)) return 'image'
  return 'unknown'
}

export function CanvasTextPreview({ layoutData, mediaUrl, hasContent }) {
  const previewHeight = Math.max(layoutData.estimatedHeight, 520)
  const canvasWidth = layoutData.width + CANVAS_HORIZONTAL_PADDING * 2
  const mediaElementRef = useRef(null)
  const [mediaSize, setMediaSize] = useState({ width: 170, height: 170 })
  const [mediaRender, setMediaRender] = useState({
    width: 170,
    height: 170,
    offsetX: 0,
    offsetY: 0,
  })
  const [rowIntervals, setRowIntervals] = useState([])
  const bounds = useMemo(
    () => ({
      width: layoutData.width,
      height: previewHeight,
    }),
    [layoutData.width, previewHeight],
  )
  const {
    position,
    containerRef,
    dragHandleProps,
  } = useDraggableObject({
    initialPosition: { x: layoutData.width * 0.34, y: previewHeight * 0.28 },
    size: mediaSize,
    bounds,
  })
  const mediaKind = getMediaKind(mediaUrl || '')
  const hasMedia = Boolean(mediaUrl?.trim()) && mediaKind !== 'unknown'
  const obstacle = useMemo(
    () =>
      hasMedia
        ? {
            x: position.x,
            y: position.y,
            width: mediaSize.width,
            height: mediaSize.height,
            rowIntervals,
          }
        : null,
    [hasMedia, mediaSize.height, mediaSize.width, position.x, position.y, rowIntervals],
  )
  const flowLayout = useMemo(
    () =>
      computeFlowLayout({
        getNextLine: layoutData.getNextLine,
        width: layoutData.width,
        lineHeight: layoutData.lineHeight,
        obstacle,
        dropCap: layoutData.dropCap,
      }),
    [
      layoutData.dropCap,
      layoutData.getNextLine,
      layoutData.lineHeight,
      layoutData.width,
      obstacle,
    ],
  )
  const canvasHeight = Math.max(
    flowLayout.height + CANVAS_TOP_PADDING + CANVAS_BOTTOM_PADDING,
    280,
  )
  const canvasRef = useCanvasRenderer({
    layoutData,
    flowLayout,
    circle: obstacle,
  })

  if (!hasContent) {
    return (
      <section className="rounded-[28px] border border-[#c9b58d] bg-[#e8d7b3]/70 p-4 shadow-[0_24px_80px_rgba(96,62,28,0.16)]">
        <div className="flex min-h-[320px] items-center justify-center rounded-[22px] border border-dashed border-[#9a7a4e]/40 bg-[#f3e7c9]/60 p-8 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7f5f34]">
              Editorial Flow
            </p>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#62482c]">
              Upload a PDF to render cleaned editorial paragraphs around the draggable media block.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border border-[#c9b58d] bg-[#e8d7b3]/70 p-4 shadow-[0_24px_80px_rgba(96,62,28,0.16)]">
      <div className="book-scroll max-h-[78vh] overflow-auto rounded-[22px] bg-[#dec79f]/45 p-4">
        <div
          ref={containerRef}
          className="relative mx-auto"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
          }}
        >
          <canvas
            ref={canvasRef}
            className="block rounded-[18px] border border-[#b89563]/35 bg-[#f7f1e7]"
          />
          <div
            className="pointer-events-none absolute"
            style={{
              left: `${CANVAS_HORIZONTAL_PADDING}px`,
              top: `${CANVAS_TOP_PADDING}px`,
              width: `${layoutData.width}px`,
              height: `${previewHeight}px`,
            }}
          >
            {hasMedia ? (
              <button
                type="button"
                aria-label="Drag media obstacle"
                className="pointer-events-auto absolute z-10 overflow-hidden touch-none cursor-grab bg-transparent active:cursor-grabbing"
                style={{
                  width: `${mediaSize.width}px`,
                  height: `${mediaSize.height}px`,
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                }}
                {...dragHandleProps}
              >
                <MediaSurface
                  mediaElementRef={mediaElementRef}
                  mediaKind={mediaKind}
                  mediaUrl={mediaUrl}
                  mediaRender={mediaRender}
                  onSizeChange={setMediaSize}
                  onRenderChange={setMediaRender}
                  onRowIntervalsChange={setRowIntervals}
                />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function fitMediaSize(width, height) {
  const maxWidth = 220
  const maxHeight = 220

  if (!width || !height) {
    return { width: 170, height: 170 }
  }

  const scale = Math.min(maxWidth / width, maxHeight / height, 1)

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function getPixelIndex(width, x, y) {
  return (y * width + x) * 4
}

function estimateBackgroundColor(data, width, height) {
  const samples = []

  for (let x = 0; x < width; x += 1) {
    samples.push(getPixelIndex(width, x, 0))
    samples.push(getPixelIndex(width, x, height - 1))
  }

  for (let y = 1; y < height - 1; y += 1) {
    samples.push(getPixelIndex(width, 0, y))
    samples.push(getPixelIndex(width, width - 1, y))
  }

  let red = 0
  let green = 0
  let blue = 0
  let count = 0

  for (const index of samples) {
    const alpha = data[index + 3]

    if (alpha <= 8) continue
    red += data[index]
    green += data[index + 1]
    blue += data[index + 2]
    count += 1
  }

  if (count === 0) {
    return { r: 255, g: 255, b: 255 }
  }

  return {
    r: red / count,
    g: green / count,
    b: blue / count,
  }
}

function getForegroundMask(data, width, height) {
  const background = estimateBackgroundColor(data, width, height)
  const mask = new Uint8Array(width * height)
  const colorThreshold = 52
  const alphaThreshold = 8

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = getPixelIndex(width, x, y)
      const alpha = data[index + 3]

      if (alpha <= alphaThreshold) continue

      const red = data[index]
      const green = data[index + 1]
      const blue = data[index + 2]
      const colorDistance = Math.hypot(
        red - background.r,
        green - background.g,
        blue - background.b,
      )

      if (alpha >= 220 || colorDistance >= colorThreshold) {
        mask[y * width + x] = 1
      }
    }
  }

  return mask
}

function extractLargestComponent(mask, width, height) {
  const visited = new Uint8Array(width * height)
  let bestPixels = null

  for (let start = 0; start < mask.length; start += 1) {
    if (!mask[start] || visited[start]) continue

    const queue = [start]
    const pixels = []
    visited[start] = 1

    while (queue.length > 0) {
      const index = queue.pop()
      pixels.push(index)

      const x = index % width
      const y = Math.floor(index / width)
      const neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ]

      for (const [nextX, nextY] of neighbors) {
        if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= height) continue

        const nextIndex = nextY * width + nextX

        if (!mask[nextIndex] || visited[nextIndex]) continue
        visited[nextIndex] = 1
        queue.push(nextIndex)
      }
    }

    if (!bestPixels || pixels.length > bestPixels.length) {
      bestPixels = pixels
    }
  }

  return bestPixels
}

function measureImageMask(image) {
  const cropPadding = 4
  const fullSize = fitMediaSize(image.naturalWidth, image.naturalHeight)
  const canvas = document.createElement('canvas')
  canvas.width = fullSize.width
  canvas.height = fullSize.height
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context) {
    return {
      size: fullSize,
      render: {
        width: fullSize.width,
        height: fullSize.height,
        offsetX: 0,
        offsetY: 0,
      },
      rowIntervals: [],
    }
  }

  context.clearRect(0, 0, fullSize.width, fullSize.height)
  context.drawImage(image, 0, 0, fullSize.width, fullSize.height)

  try {
    const { data } = context.getImageData(0, 0, fullSize.width, fullSize.height)
    const foregroundMask = getForegroundMask(data, fullSize.width, fullSize.height)
    const component = extractLargestComponent(
      foregroundMask,
      fullSize.width,
      fullSize.height,
    )
    const intervals = Array.from({ length: fullSize.height }, () => null)
    let minX = fullSize.width
    let maxX = -1
    let minY = fullSize.height
    let maxY = -1

    for (const pixel of component ?? []) {
      const x = pixel % fullSize.width
      const y = Math.floor(pixel / fullSize.width)
      const current = intervals[y]

      if (current) {
        current.left = Math.min(current.left, x)
        current.right = Math.max(current.right, x + 1)
      } else {
        intervals[y] = { left: x, right: x + 1 }
      }

      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x + 1)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y + 1)
    }

    if (maxX === -1 || maxY === -1) {
      return {
        size: fullSize,
        render: {
          width: fullSize.width,
          height: fullSize.height,
          offsetX: 0,
          offsetY: 0,
        },
        rowIntervals: [],
      }
    }

    const paddedIntervals = intervals.map((interval) =>
      interval
        ? {
            left: Math.max(0, interval.left - cropPadding),
            right: Math.min(fullSize.width, interval.right + cropPadding),
          }
        : null,
    )

    return {
      size: fullSize,
      render: {
        width: fullSize.width,
        height: fullSize.height,
        offsetX: 0,
        offsetY: 0,
      },
      rowIntervals: paddedIntervals,
    }
  } catch {
    return {
      size: fullSize,
      render: {
        width: fullSize.width,
        height: fullSize.height,
        offsetX: 0,
        offsetY: 0,
      },
      rowIntervals: [],
    }
  }
}

function MediaSurface({
  mediaElementRef,
  mediaKind,
  mediaUrl,
  mediaRender,
  onSizeChange,
  onRenderChange,
  onRowIntervalsChange,
}) {
  const measurementKeyRef = useRef('')

  useEffect(() => {
    if (mediaKind !== 'image') {
      onRowIntervalsChange([])
      onRenderChange({
        width: 170,
        height: 170,
        offsetX: 0,
        offsetY: 0,
      })
    }
  }, [mediaKind, mediaUrl, onRenderChange, onRowIntervalsChange])

  useEffect(() => {
    if (mediaKind !== 'image' || !mediaUrl) return undefined

    let frameId = null

    const syncMeasurement = () => {
      const image = mediaElementRef.current

      if (image?.complete && image.naturalWidth && image.naturalHeight) {
        const measurement = measureImageMask(image)
        const key = [
          measurement.size.width,
          measurement.size.height,
          measurement.render.offsetX,
          measurement.render.offsetY,
          measurement.rowIntervals
            .map((interval) => (interval ? `${interval.left}-${interval.right}` : '_'))
            .join(';'),
        ].join('|')

        if (key !== measurementKeyRef.current) {
          measurementKeyRef.current = key
          onSizeChange(measurement.size)
          onRenderChange(measurement.render)
          onRowIntervalsChange(measurement.rowIntervals)
        }
      }

      frameId = requestAnimationFrame(syncMeasurement)
    }

    syncMeasurement()

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId)
      measurementKeyRef.current = ''
    }
  }, [
    mediaElementRef,
    mediaKind,
    mediaUrl,
    onRenderChange,
    onRowIntervalsChange,
    onSizeChange,
  ])

  if (mediaKind === 'image' && mediaUrl) {
    return (
      <img
        ref={mediaElementRef}
        src={mediaUrl}
        alt=""
        className="pointer-events-none absolute max-w-none select-none"
        draggable="false"
        crossOrigin="anonymous"
        style={{
          width: `${mediaRender.width}px`,
          height: `${mediaRender.height}px`,
          left: `${mediaRender.offsetX}px`,
          top: `${mediaRender.offsetY}px`,
        }}
      />
    )
  }

  if (mediaKind === 'video' && mediaUrl) {
    return (
      <video
        ref={mediaElementRef}
        src={mediaUrl}
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        autoPlay
        muted
        loop
        playsInline
        onLoadedMetadata={(event) => {
          const nextSize = fitMediaSize(
            event.currentTarget.videoWidth,
            event.currentTarget.videoHeight,
          )
          onSizeChange(nextSize)
          onRenderChange({
            width: nextSize.width,
            height: nextSize.height,
            offsetX: 0,
            offsetY: 0,
          })
          onRowIntervalsChange([])
        }}
      />
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center border border-dashed border-white/20 bg-transparent px-4 text-center text-xs leading-5 text-white/80">
      Paste an image, GIF, or video URL
    </div>
  )
}
