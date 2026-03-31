import { useEffect, useEffectEvent, useRef } from 'react'
import {
  CANVAS_BOTTOM_PADDING,
  CANVAS_HORIZONTAL_PADDING,
  CANVAS_TOP_PADDING,
} from '../lib/canvasLayout'

function drawPaperTexture(context, width, height) {
  const background = context.createLinearGradient(0, 0, width, height)
  background.addColorStop(0, '#f8f0dc')
  background.addColorStop(0.48, '#efe2c4')
  background.addColorStop(1, '#e6d5b1')
  context.fillStyle = background
  context.fillRect(0, 0, width, height)

  for (let y = 0; y < height; y += 18) {
    for (let x = 0; x < width; x += 18) {
      const grain = (Math.sin(x * 0.11 + y * 0.07) + 1) / 2
      context.fillStyle = `rgba(120, 86, 44, ${0.018 + grain * 0.022})`
      context.fillRect(x, y, 2, 2)
    }
  }

  for (let y = 14; y < height; y += 32) {
    const wobble = Math.sin(y * 0.06) * 8
    context.strokeStyle = 'rgba(122, 88, 51, 0.05)'
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(0, y)
    context.bezierCurveTo(width * 0.3, y + wobble, width * 0.7, y - wobble, width, y)
    context.stroke()
  }

  const vignette = context.createRadialGradient(
    width * 0.5,
    height * 0.45,
    width * 0.2,
    width * 0.5,
    height * 0.45,
    width * 0.7,
  )
  vignette.addColorStop(0, 'rgba(255,255,255,0)')
  vignette.addColorStop(1, 'rgba(103, 69, 33, 0.12)')
  context.fillStyle = vignette
  context.fillRect(0, 0, width, height)
}

function drawDropCap(context, layoutData) {
  const letter = layoutData.dropCap?.letter

  if (!letter) return

  const x = CANVAS_HORIZONTAL_PADDING + 8
  const y = CANVAS_TOP_PADDING - 2

  context.save()
  context.fillStyle = '#2a180f'
  context.font = '700 74px "MedievalSharp", "Palatino Linotype", "Book Antiqua", serif'
  context.textBaseline = 'top'
  context.shadowColor = 'rgba(87, 46, 18, 0.10)'
  context.shadowBlur = 1
  context.fillText(letter, x, y)
  context.restore()
}

export function usePdfCanvasRenderer({ layoutData, flowLayout, obstacle }) {
  const canvasRef = useRef(null)

  const draw = useEffectEvent(() => {
    const canvas = canvasRef.current
    if (!canvas || !layoutData || !flowLayout) return

    const dpr = window.devicePixelRatio || 1
    const width = layoutData.width + CANVAS_HORIZONTAL_PADDING * 2
    const height = Math.max(
      flowLayout.height + CANVAS_TOP_PADDING + CANVAS_BOTTOM_PADDING,
      280,
    )

    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const context = canvas.getContext('2d')
    if (!context) return

    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    context.clearRect(0, 0, width, height)

    drawPaperTexture(context, width, height)
    context.strokeStyle = 'rgba(113, 83, 46, 0.28)'
    context.lineWidth = 1
    context.strokeRect(0.5, 0.5, width - 1, height - 1)

    drawDropCap(context, layoutData)

    context.fillStyle = '#2f2116'
    context.font = layoutData.font
    context.textBaseline = 'top'

    flowLayout.rows.forEach((row) => {
      row.segments.forEach((segment) => {
        const y = CANVAS_TOP_PADDING + row.y
        const x = CANVAS_HORIZONTAL_PADDING + segment.x
        const clipWidth = Math.max(
          0,
          Math.min(segment.width + 10, layoutData.width - segment.x + 10),
        )

        context.save()
        context.beginPath()
        context.rect(x, y, clipWidth, layoutData.lineHeight)
        context.clip()
        context.fillText(segment.text, x, y)
        context.restore()
      })
    })
  })

  useEffect(() => {
    let cancelled = false
    let frameId = null

    const renderWhenFontsReady = async () => {
      if (document.fonts?.load) {
        await Promise.allSettled([
          document.fonts.load(layoutData.font, 'The quick brown fox'),
          document.fonts.load(
            '700 74px "MedievalSharp"',
            layoutData.dropCap?.letter || 'A',
          ),
          document.fonts.load('400 19px "MedievalSharp"', 'The quick brown fox'),
        ])
      }

      if (cancelled) return

      frameId = requestAnimationFrame(() => {
        draw()
      })
    }

    void renderWhenFontsReady()

    return () => {
      cancelled = true

      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [flowLayout, layoutData, obstacle])

  return canvasRef
}
