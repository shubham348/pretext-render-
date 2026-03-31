import { useEffect, useEffectEvent, useRef } from 'react'
import {
  CANVAS_BOTTOM_PADDING,
  CANVAS_HORIZONTAL_PADDING,
  CANVAS_TOP_PADDING,
} from '../lib/canvasLayout'

function drawDropCap(context, layoutData) {
  const letter = layoutData.dropCap?.letter

  if (!letter) return

  const x = CANVAS_HORIZONTAL_PADDING + 8
  const y = CANVAS_TOP_PADDING - 2
  const size = layoutData.dropCap?.size ?? 74

  context.save()
  context.fillStyle = '#2a180f'
  context.font = `700 ${size}px "MedievalSharp", "Palatino Linotype", "Book Antiqua", serif`
  context.textBaseline = 'top'
  context.fillText(letter, x, y)
  context.restore()
}

export function useCanvasRenderer({ layoutData, flowLayout, circle }) {
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

    context.fillStyle = '#f8f4ea'
    context.fillRect(0, 0, width, height)
    context.strokeStyle = 'rgba(128, 100, 57, 0.18)'
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

        context.save()
        context.beginPath()
        context.rect(
          x,
          y,
          Math.max(0, Math.min(segment.width + 8, layoutData.width - segment.x + 8)),
          layoutData.lineHeight,
        )
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
            `700 ${layoutData.dropCap?.size ?? 74}px "MedievalSharp"`,
            layoutData.dropCap?.letter || 'A',
          ),
          document.fonts.load(layoutData.font, 'The quick brown fox'),
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
  }, [circle, flowLayout, layoutData])

  return canvasRef
}
