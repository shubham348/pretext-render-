import { useEffect, useMemo, useRef } from 'react'
import { layoutNextLine, prepareWithSegments } from '@chenglou/pretext'
import { DemoAccordion } from './DemoAccordion'
import { computeFlowLayout } from '../lib/flowLayout'

const CANVAS_WIDTH = 760
const CANVAS_HEIGHT = 420
const TEXT_WIDTH = 672
const TEXT_X = 42
const TEXT_Y = 54
const LINE_HEIGHT = 24
const BALL_RADIUS = 12
const TRAIL_LENGTH = 12
const TRAIL_WRAP_POINTS = 8
const TEXT_FONT = '600 15px "Fira Code", monospace'
const DEMO_TEXT =`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ultrices, velit sed varius facilisis, lectus magna tincidunt leo, fermentum pellentesque lacus justo in justo. Phasellus venenatis leo sit amet nisi varius blandit at in dui. Nunc dapibus, mauris sollicitudin suscipit tincidunt, dui orci aliquam est, a viverra nulla risus et diam. Curabitur vitae enim at nunc aliquet pharetra. Suspendisse volutpat purus nec metus luctus pretium. Vivamus porttitor pharetra odio, vitae dignissim nunc egestas eu. Praesent accumsan aliquam urna. Donec id suscipit massa, eu laoreet risus. Etiam a metus eu eros auctor dignissim. Ut placerat accumsan blandit. Vivamus quam nisi, commodo a ultricies et, rutrum vel lectus. Vestibulum varius urna augue, quis scelerisque neque tempor sed.

Fusce rhoncus cursus lacus sed ultricies. Cras ac neque libero. Vivamus vehicula quam`
function buildDemoCode() {
  return `const prepared = prepareWithSegments(text, '600 15px "Fira Code"', {
  whiteSpace: "pre-wrap",
})

function renderFrame(ball, trail) {
  const obstacle = buildTrailObstacle(ball, trail)

  const flow = computeFlowLayout({
    getNextLine: (cursor, width) => layoutNextLine(prepared, cursor, width),
    width: 672,
    lineHeight: 24,
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

function buildTrailObstacle(ball, trail) {
  const circles = [
    { x: ball.x - TEXT_X, y: ball.y - TEXT_Y, radius: BALL_RADIUS + 5 },
    ...trail.slice(1, TRAIL_WRAP_POINTS).map((point, index) => ({
      x: point.x - TEXT_X,
      y: point.y - TEXT_Y,
      radius: Math.max(3, getTrailRadius(index + 1) - 1.5),
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
    padding: 8,
  }
}

export function PretextFlowBallDemo() {
  const canvasRef = useRef(null)
  const dragActiveRef = useRef(false)
  const targetRef = useRef({ x: 170, y: 124 })
  const ballRef = useRef({ x: 170, y: 124 })
  const trailRef = useRef(createInitialTrail())
  const prepared = useMemo(
    () =>
      prepareWithSegments(DEMO_TEXT, TEXT_FONT, {
        whiteSpace: 'pre-wrap',
      }),
    [],
  )
  const codeSnippet = useMemo(() => buildDemoCode(), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const context = canvas.getContext('2d')
    if (!context) return undefined

    let frameId = null

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(CANVAS_WIDTH * dpr)
      canvas.height = Math.floor(CANVAS_HEIGHT * dpr)
      canvas.style.width = `${CANVAS_WIDTH}px`
      canvas.style.height = `${CANVAS_HEIGHT}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      const background = context.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
      background.addColorStop(0, '#0c1828')
      background.addColorStop(1, '#09101a')
      context.fillStyle = background
      context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      context.strokeStyle = '#64e5ff'
      context.lineWidth = 2
      context.beginPath()
      context.moveTo(0, 26)
      context.lineTo(CANVAS_WIDTH, 26)
      context.stroke()

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

      const obstacle = buildTrailObstacle(ball, trail)

      const flow = computeFlowLayout({
        getNextLine: (cursor, width) => layoutNextLine(prepared, cursor, width),
        width: TEXT_WIDTH,
        lineHeight: LINE_HEIGHT,
        obstacle,
      })

      context.font = TEXT_FONT
      context.textBaseline = 'top'
      flow.rows.forEach((row) => {
        row.segments.forEach((segment) => {
          const x = TEXT_X + segment.x
          const y = TEXT_Y + row.y

          context.save()
          context.beginPath()
          context.rect(x, y, Math.max(0, segment.width), LINE_HEIGHT)
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
  }, [prepared])

  const updateTargetFromEvent = (event) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    targetRef.current = {
      x: Math.max(
        BALL_RADIUS + 16,
        Math.min(CANVAS_WIDTH - BALL_RADIUS - 16, event.clientX - rect.left),
      ),
      y: Math.max(
        44,
        Math.min(CANVAS_HEIGHT - BALL_RADIUS - 16, event.clientY - rect.top),
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
      <div className="mt-8 mx-auto w-full max-w-[760px] overflow-hidden rounded-[24px] border border-cyan-400/15 bg-[#091729]">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="block w-full touch-none cursor-crosshair"
        />
      </div>

      <pre className="mt-8 overflow-auto rounded-[20px] border border-indigo-300/10 bg-[#111735] px-5 py-5 text-[14px] leading-7 text-cyan-100">
        <code>{codeSnippet}</code>
      </pre>
    </DemoAccordion>
  )
}
