import { useEffect, useMemo, useRef, useState } from 'react'
import { layoutNextLine, prepareWithSegments } from '@chenglou/pretext'
import { DemoAccordion } from './DemoAccordion'
import { computeFlowLayout } from '../lib/flowLayout'
import { useFontsReady } from '../hooks/useFontsReady'

const MAX_CANVAS_WIDTH = 760
const MIN_CANVAS_HEIGHT = 420
const BALL_RADIUS = 12
const TRAIL_LENGTH = 12
const TRAIL_WRAP_POINTS = 8
const DEMO_TEXT =`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ultrices, velit sed varius facilisis, lectus magna tincidunt leo, fermentum pellentesque lacus justo in justo. Phasellus venenatis leo sit amet nisi varius blandit at in dui. Nunc dapibus, mauris sollicitudin suscipit tincidunt, dui orci aliquam est, a viverra nulla risus et diam. Curabitur vitae enim at nunc aliquet pharetra. Suspendisse volutpat purus nec metus luctus pretium. Vivamus porttitor pharetra odio, vitae dignissim nunc egestas eu. Praesent accumsan aliquam urna. Donec id suscipit massa, eu laoreet risus. Etiam a metus eu eros auctor dignissim. Ut placerat accumsan blandit. Vivamus quam nisi, commodo a ultricies et, rutrum vel lectus. Vestibulum varius urna augue, quis scelerisque neque tempor sed.

Fusce rhoncus cursus lacus sed ultricies. Cras ac neque libero. Vivamus vehicula quam`
function buildDemoCode(textWidth, lineHeight) {
  return `const prepared = prepareWithSegments(text, '600 15px "Fira Code"', {
  whiteSpace: "pre-wrap",
})

function renderFrame(ball, trail) {
  const obstacle = buildTrailObstacle(ball, trail)

  const flow = computeFlowLayout({
    getNextLine: (cursor, width) => layoutNextLine(prepared, cursor, width),
    width: ${textWidth},
    lineHeight: ${lineHeight},
    obstacle,
  })

  drawLines(flow.rows)
  drawTrail(trail)
  drawBall(ball)
}`
}

function createInitialTrail() {
  return Array.from({ length: TRAIL_LENGTH }, () => ({ x: 170, y: 124 }))
}

function getTrailRadius(index) {
  const progress = (TRAIL_LENGTH - index) / TRAIL_LENGTH
  return 2 + progress * 8
}

function buildTrailObstacle(ball, trail, textX, textY) {
  const circles = [
    { x: ball.x - textX, y: ball.y - textY, radius: BALL_RADIUS + 16 },
    ...trail.slice(1, TRAIL_WRAP_POINTS).map((point, index) => ({
      x: point.x - textX,
      y: point.y - textY,
      radius: Math.max(5, getTrailRadius(index + 1) + 2),
    })),
  ]

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  circles.forEach((circle) => {
    minX = Math.min(minX, circle.x - circle.radius)
    maxX = Math.max(maxX, circle.x + circle.radius)
    minY = Math.min(minY, circle.y - circle.radius)
    maxY = Math.max(maxY, circle.y + circle.radius)
  })

  const startX = Math.floor(minX)
  const endX = Math.ceil(maxX)
  const startY = Math.floor(minY)
  const endY = Math.ceil(maxY)
  const width = Math.max(1, endX - startX)
  const height = Math.max(1, endY - startY)
  const rowIntervals = Array.from({ length: height }, () => null)

  for (let row = 0; row < height; row += 1) {
    const y = startY + row + 0.5
    let left = Infinity
    let right = -Infinity

    circles.forEach((circle) => {
      const dy = Math.abs(y - circle.y)

      if (dy > circle.radius) return

      const dx = Math.sqrt(circle.radius * circle.radius - dy * dy)
      left = Math.min(left, circle.x - dx)
      right = Math.max(right, circle.x + dx)
    })

    if (Number.isFinite(left) && Number.isFinite(right)) {
      rowIntervals[row] = {
        left: Math.max(0, Math.floor(left - startX)),
        right: Math.min(width, Math.ceil(right - startX)),
      }
    }
  }

  return {
    x: startX,
    y: startY,
    width,
    height,
    rowIntervals,
    padding: 16,
  }
}

export function PretextFlowBallDemo() {
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const canvasHeightRef = useRef(MIN_CANVAS_HEIGHT)
  const dragActiveRef = useRef(false)
  const [stageWidth, setStageWidth] = useState(MAX_CANVAS_WIDTH)
  const canvasWidth = Math.min(MAX_CANVAS_WIDTH, Math.max(260, Math.floor(stageWidth)))
  const isCompact = canvasWidth < 520
  const textX = isCompact ? 20 : 42
  const textY = isCompact ? 40 : 54
  const lineHeight = isCompact ? 22 : 24
  const textWidth = Math.max(160, canvasWidth - textX * 2)
  const textFont = isCompact ? '600 14px "Fira Code", monospace' : '600 15px "Fira Code", monospace'
  const fontReadyTick = useFontsReady([textFont], 'Lorem ipsum dolor sit amet')
  const targetRef = useRef({ x: 170, y: 124 })
  const ballRef = useRef({ x: 170, y: 124 })
  const trailRef = useRef(createInitialTrail())
  const prepared = useMemo(
    () => {
      void fontReadyTick

      return prepareWithSegments(DEMO_TEXT, textFont, {
        whiteSpace: 'pre-wrap',
      })
    },
    [fontReadyTick, textFont],
  )
  const codeSnippet = useMemo(() => buildDemoCode(textWidth, lineHeight), [lineHeight, textWidth])

  useEffect(() => {
    const node = stageRef.current
    if (!node) return undefined

    const updateWidth = () => {
      setStageWidth((current) => {
        const next = node.clientWidth
        return Math.abs(current - next) < 1 ? current : next
      })
    }

    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const maxX = canvasWidth - BALL_RADIUS - 16
    targetRef.current = {
      x: Math.min(maxX, targetRef.current.x),
      y: targetRef.current.y,
    }
    ballRef.current = {
      x: Math.min(maxX, ballRef.current.x),
      y: ballRef.current.y,
    }
  }, [canvasWidth])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const context = canvas.getContext('2d')
    if (!context) return undefined

    let frameId = null

    const draw = () => {
      const target = targetRef.current
      const ball = ballRef.current
      ball.x += (target.x - ball.x) * 0.18
      ball.y += (target.y - ball.y) * 0.18

      const trail = trailRef.current
      trail[0] = { x: ball.x, y: ball.y }
      for (let index = 1; index < trail.length; index += 1) {
        trail[index].x += (trail[index - 1].x - trail[index].x) * 0.24
        trail[index].y += (trail[index - 1].y - trail[index].y) * 0.24
      }

      const obstacle = buildTrailObstacle(ball, trail, textX, textY)

      const flow = computeFlowLayout({
        getNextLine: (cursor, width) => layoutNextLine(prepared, cursor, width),
        width: textWidth,
        lineHeight,
        obstacle,
      })

      const canvasHeight = Math.max(MIN_CANVAS_HEIGHT, textY + flow.height + 36)
      canvasHeightRef.current = canvasHeight

      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(canvasWidth * dpr)
      canvas.height = Math.floor(canvasHeight * dpr)
      canvas.style.width = `${canvasWidth}px`
      canvas.style.height = `${canvasHeight}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, canvasWidth, canvasHeight)

      const background = context.createLinearGradient(0, 0, 0, canvasHeight)
      background.addColorStop(0, '#0c1828')
      background.addColorStop(1, '#09101a')
      context.fillStyle = background
      context.fillRect(0, 0, canvasWidth, canvasHeight)

      context.strokeStyle = '#64e5ff'
      context.lineWidth = 2
      context.beginPath()
      context.moveTo(0, 26)
      context.lineTo(canvasWidth, 26)
      context.stroke()

      context.font = textFont
      context.textBaseline = 'top'
      flow.rows.forEach((row) => {
        row.segments.forEach((segment) => {
          const x = textX + segment.x
          const y = textY + row.y

          context.save()
          context.beginPath()
          context.rect(x, y, Math.max(0, segment.width), lineHeight)
          context.clip()
          context.fillStyle = '#d8e4f1'
          context.fillText(segment.text, x, y)
          context.restore()
        })
      })

      trail
        .slice()
        .reverse()
        .forEach((point, index) => {
          const trailIndex = TRAIL_LENGTH - 1 - index
          const radius = getTrailRadius(trailIndex)

          context.beginPath()
          context.fillStyle = `rgba(255, 212, 130, ${0.06 + ((TRAIL_LENGTH - trailIndex) / TRAIL_LENGTH) * 0.16})`
          context.arc(point.x, point.y, radius, 0, Math.PI * 2)
          context.fill()
        })

      context.beginPath()
      context.fillStyle = '#ffd778'
      context.shadowColor = '#ffd778'
      context.shadowBlur = 12
      context.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2)
      context.fill()
      context.shadowBlur = 0

      context.beginPath()
      context.lineWidth = 3
      context.strokeStyle = '#ffefb4'
      context.arc(ball.x, ball.y, BALL_RADIUS + 6, 0, Math.PI * 2)
      context.stroke()

      frameId = requestAnimationFrame(draw)
    }

    frameId = requestAnimationFrame(draw)

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [canvasWidth, lineHeight, prepared, textFont, textWidth, textX, textY])

  const updateTargetFromEvent = (event) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = rect.width ? canvasWidth / rect.width : 1
    const scaleY = rect.height ? canvasHeightRef.current / rect.height : 1
    const nextX = (event.clientX - rect.left) * scaleX
    const nextY = (event.clientY - rect.top) * scaleY
    targetRef.current = {
      x: Math.max(
        BALL_RADIUS + 16,
        Math.min(canvasWidth - BALL_RADIUS - 16, nextX),
      ),
      y: Math.max(
        44,
        Math.min(canvasHeightRef.current - BALL_RADIUS - 16, nextY),
      ),
    }
  }

  const handlePointerDown = (event) => {
    dragActiveRef.current = true
    updateTargetFromEvent(event)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!dragActiveRef.current) return
    updateTargetFromEvent(event)
  }

  const handlePointerUp = (event) => {
    dragActiveRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <DemoAccordion
      badge="Demo 2"
      title="Trail Ball With layoutNextLine"
      summary="Drag inside the box and Pretext recomputes the text from the top on every frame. This demo shows layoutNextLine() with a moving obstacle and smooth trailing motion."
      tone="dark"
    >
      <div ref={stageRef} className="mt-6 rounded-[24px] border border-cyan-400/15 bg-[#091729] sm:mt-8">
        <div className="book-scroll mx-auto max-h-[420px] w-full max-w-[760px] overflow-y-auto overflow-x-hidden rounded-[24px]">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="block w-full touch-none cursor-crosshair"
        />
        </div>
      </div>

      <pre className="mt-8 overflow-hidden rounded-[20px] border border-indigo-300/10 bg-[#111735] px-4 py-4 text-[12px] leading-6 text-cyan-100 sm:px-5 sm:py-5 sm:text-[14px] sm:leading-7">
        <code className="whitespace-pre-wrap break-all">{codeSnippet}</code>
      </pre>
    </DemoAccordion>
  )
}
