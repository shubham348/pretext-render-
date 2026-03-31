import { useEffect, useRef, useState } from 'react'

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function clampPosition(position, size, bounds) {
  return {
    x: clamp(position.x, 0, Math.max(0, bounds.width - size.width)),
    y: clamp(position.y, 0, Math.max(0, bounds.height - size.height)),
  }
}

export function useDraggableObject({ initialPosition, size, bounds }) {
  const boundsWidth = bounds.width
  const boundsHeight = bounds.height
  const objectWidth = size.width
  const objectHeight = size.height
  const [position, setPosition] = useState(() =>
    clampPosition(initialPosition, size, bounds),
  )
  const containerRef = useRef(null)
  const isDraggingRef = useRef(false)
  const animationFrameRef = useRef(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const targetPositionRef = useRef(position)

  useEffect(() => {
    const nextPosition = clampPosition(targetPositionRef.current, {
      width: objectWidth,
      height: objectHeight,
    }, {
      width: boundsWidth,
      height: boundsHeight,
    })
    targetPositionRef.current = nextPosition
    setPosition(nextPosition)
  }, [boundsHeight, boundsWidth, objectHeight, objectWidth])

  useEffect(
    () => () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    },
    [],
  )

  const ensureAnimation = () => {
    if (animationFrameRef.current !== null) return

    const tick = () => {
      setPosition(targetPositionRef.current)
      animationFrameRef.current = null
    }

    animationFrameRef.current = requestAnimationFrame(tick)
  }

  const schedulePosition = (nextPosition) => {
    targetPositionRef.current = clampPosition(nextPosition, {
      width: objectWidth,
      height: objectHeight,
    }, {
      width: boundsWidth,
      height: boundsHeight,
    })
    ensureAnimation()
  }

  const updateFromPointer = (event) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    schedulePosition({
      x: event.clientX - rect.left - dragOffsetRef.current.x,
      y: event.clientY - rect.top - dragOffsetRef.current.y,
    })
  }

  const handlePointerDown = (event) => {
    if (event.button !== 0) return

    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    dragOffsetRef.current = {
      x: event.clientX - rect.left - position.x,
      y: event.clientY - rect.top - position.y,
    }
    isDraggingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!isDraggingRef.current) return
    updateFromPointer(event)
  }

  const handlePointerUp = (event) => {
    isDraggingRef.current = false

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return {
    position,
    containerRef,
    dragHandleProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  }
}
