import { useEffect, useMemo, useRef, useState } from 'react'
import { useCanvasRenderer } from '../hooks/useCanvasRenderer'
import { useDraggableObject } from '../hooks/useDraggableObject'
import {
  CANVAS_BOTTOM_PADDING,
  CANVAS_HORIZONTAL_PADDING,
  CANVAS_TOP_PADDING,
} from '../lib/canvasLayout'
import { computeFlowLayout } from '../lib/flowLayout'

function buildCircleRowIntervals(size) {
  const radius = size.width / 2
  const centerX = radius
  const centerY = size.height / 2

  return Array.from({ length: size.height }, (_, row) => {
    const y = row + 0.5
    const dy = Math.abs(y - centerY)

    if (dy > radius) return null

    const dx = Math.sqrt(radius * radius - dy * dy)

    return {
      left: Math.max(0, Math.floor(centerX - dx)),
      right: Math.min(size.width, Math.ceil(centerX + dx)),
    }
  })
}

export function CanvasTextPreview({ layoutData, mediaUrl, hasContent }) {
  const viewportRef = useRef(null)
  const autoPlacedKeyRef = useRef('')
  const hasDraggedOnMobileRef = useRef(false)
  const [stageWidth, setStageWidth] = useState(() =>
    typeof window !== 'undefined' ? Math.max(280, window.innerWidth - 32) : 720,
  )
  const isPhoneLayout = stageWidth < 540
  const isTabletLayout = stageWidth >= 540 && stageWidth < 900
  const isCompactLayout = isPhoneLayout || isTabletLayout
  const viewportPadding = isPhoneLayout ? 10 : isTabletLayout ? 14 : 18
  const scrollbarReserve = 16
  const ballSize = useMemo(
    () => ({
      width: isPhoneLayout ? 56 : isTabletLayout ? 60 : 68,
      height: isPhoneLayout ? 56 : isTabletLayout ? 60 : 68,
    }),
    [isPhoneLayout, isTabletLayout],
  )
  const contentWidth = useMemo(() => {
    const availableWidth =
      stageWidth -
      viewportPadding * 2 -
      CANVAS_HORIZONTAL_PADDING * 2 -
      scrollbarReserve -
      (isPhoneLayout ? 22 : isTabletLayout ? 18 : 10)
    const maxWidth = isPhoneLayout ? 284 : isTabletLayout ? 420 : layoutData.width
    const minWidth = isPhoneLayout ? 180 : isTabletLayout ? 260 : 320

    return Math.max(minWidth, Math.min(maxWidth, Math.floor(availableWidth)))
  }, [
    isPhoneLayout,
    isTabletLayout,
    layoutData.width,
    scrollbarReserve,
    stageWidth,
    viewportPadding,
  ])
  const previewHeight = Math.max(
    layoutData.estimatedHeight,
    isPhoneLayout ? 560 : isTabletLayout ? 620 : 680,
  )
  const canvasWidth = contentWidth + CANVAS_HORIZONTAL_PADDING * 2
  const bounds = useMemo(
    () => ({
      width: contentWidth,
      height: previewHeight,
    }),
    [contentWidth, previewHeight],
  )
  const {
    position,
    setPosition,
    containerRef,
    dragHandleProps,
  } = useDraggableObject({
    initialPosition: { x: contentWidth * 0.48, y: previewHeight * 0.3 },
    size: ballSize,
    bounds,
    onDragStart: () => {
      if (isCompactLayout) {
        hasDraggedOnMobileRef.current = true
      }
    },
  })
  const rowIntervals = useMemo(() => buildCircleRowIntervals(ballSize), [ballSize])
  const hasBall = hasContent
  const obstacle = useMemo(
    () =>
      hasBall
        ? {
            x: position.x,
            y: position.y,
            width: ballSize.width,
            height: ballSize.height,
            rowIntervals,
          }
        : null,
    [ballSize.height, ballSize.width, hasBall, position.x, position.y, rowIntervals],
  )
  const flowLayout = useMemo(
    () =>
      computeFlowLayout({
        getNextLine: layoutData.getNextLine,
        width: contentWidth,
        lineHeight: layoutData.lineHeight,
        obstacle,
        dropCap: layoutData.dropCap,
      }),
    [
      layoutData.dropCap,
      layoutData.getNextLine,
      layoutData.lineHeight,
      contentWidth,
      obstacle,
    ],
  )
  const canvasHeight = Math.max(
    flowLayout.height + CANVAS_TOP_PADDING + CANVAS_BOTTOM_PADDING,
    280,
  )
  const canvasRef = useCanvasRenderer({
    layoutData: {
      ...layoutData,
      width: contentWidth,
    },
    flowLayout,
    circle: obstacle,
  })

  useEffect(() => {
    const node = viewportRef.current
    if (!node) return undefined

    const updateWidth = () => {
      setStageWidth((current) =>
        Math.abs(current - node.clientWidth) < 1 ? current : node.clientWidth,
      )
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    hasDraggedOnMobileRef.current = false
    autoPlacedKeyRef.current = ''
  }, [mediaUrl, hasContent])

  useEffect(() => {
    if (!hasBall || !isCompactLayout) return
    if (hasDraggedOnMobileRef.current) return
    const placementKey = `ball|${contentWidth}|${ballSize.width}|${ballSize.height}`

    if (autoPlacedKeyRef.current === placementKey) return

    autoPlacedKeyRef.current = placementKey
    setPosition({
      x: Math.max(0, (contentWidth - ballSize.width) / 2),
      y: 18,
    })
  }, [
    ballSize.height,
    ballSize.width,
    contentWidth,
    hasBall,
    isCompactLayout,
    setPosition,
  ])

  useEffect(() => {
    if (isCompactLayout) return
    hasDraggedOnMobileRef.current = false
    autoPlacedKeyRef.current = ''
  }, [isCompactLayout])

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
    <section className="min-w-0 rounded-[24px] border border-[#c9b58d] bg-[#e8d7b3]/70 p-3 shadow-[0_24px_80px_rgba(96,62,28,0.16)] sm:rounded-[28px] sm:p-4">
      <div
        ref={viewportRef}
        className="book-scroll max-h-[78vh] overflow-y-auto overflow-x-hidden rounded-[20px] bg-[#dec79f]/45 p-2 sm:rounded-[22px] sm:p-4"
      >
        <div
          className="mx-auto w-full"
          style={{ height: `${canvasHeight}px` }}
        >
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
            className="absolute"
            style={{
              left: `${CANVAS_HORIZONTAL_PADDING}px`,
              top: `${CANVAS_TOP_PADDING}px`,
              width: `${contentWidth}px`,
              height: `${previewHeight}px`,
              touchAction: 'pan-y',
            }}
          >
            {hasBall ? (
              <div
                role="presentation"
                className="pointer-events-auto absolute z-10 cursor-grab select-none active:cursor-grabbing"
                style={{
                  width: `${ballSize.width}px`,
                  height: `${ballSize.height}px`,
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  touchAction: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                }}
                onDragStart={(event) => event.preventDefault()}
                {...dragHandleProps}
              >
                <div
                  className="h-full w-full rounded-full border border-[#7d5a2d]/55"
                  style={{
                    background:
                      'radial-gradient(circle at 32% 32%, #fff1bf 0%, #ffd970 28%, #d79c32 65%, #9a5c10 100%)',
                    boxShadow: '0 8px 20px rgba(154, 92, 16, 0.24)',
                  }}
                  aria-hidden="true"
                >
                  <div className="h-full w-full rounded-full border-4 border-[#fff2bd]/80" />
                </div>
              </div>
            ) : null}
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
