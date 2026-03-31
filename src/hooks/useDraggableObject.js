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

export function useDraggableObject({
  initialPosition,
  size,
  bounds,
  scale = 1,
  onDragStart,
}) {
  const [position, setPosition] = useState(() =>
    clampPosition(initialPosition, size, bounds),
  )
  const containerRef = useRef(null)
  const dragStateRef = useRef(null)
  const targetPositionRef = useRef(position)
  const frameRef = useRef(null)

  useEffect(() => {
    const nextPosition = clampPosition(targetPositionRef.current, size, bounds)
    targetPositionRef.current = nextPosition
    setPosition(nextPosition)
  }, [bounds, size])

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    },
    [],
  )

  const flushPosition = () => {
    if (frameRef.current !== null) return

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      setPosition(targetPositionRef.current)
    })
  }

  const moveTo = (nextPosition) => {
    targetPositionRef.current = clampPosition(nextPosition, size, bounds)
    flushPosition()
  }

  const updateFromPointer = (event) => {
    const container = containerRef.current
    const dragState = dragStateRef.current
    if (!container || !dragState) return

    const rect = container.getBoundingClientRect()
    const safeScale = scale || 1

    moveTo({
      x: (event.clientX - rect.left) / safeScale - dragState.offsetX,
      y: (event.clientY - rect.top) / safeScale - dragState.offsetY,
    })
  }

  const endDrag = () => {
    dragStateRef.current = null
  }

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return

    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const safeScale = scale || 1

    dragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: (event.clientX - rect.left) / safeScale - position.x,
      offsetY: (event.clientY - rect.top) / safeScale - position.y,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    onDragStart?.()
    event.stopPropagation()
    event.preventDefault()
  }

  const handlePointerMove = (event) => {
    if (!dragStateRef.current) return
    if (dragStateRef.current.pointerId !== event.pointerId) return

    updateFromPointer(event)
    event.preventDefault()
  }

  const handlePointerUp = (event) => {
    if (!dragStateRef.current) return
    if (dragStateRef.current.pointerId !== event.pointerId) return

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    endDrag()
  }

  const handlePointerCancel = (event) => {
    if (!dragStateRef.current) return
    if (dragStateRef.current.pointerId !== event.pointerId) return

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    endDrag()
  }

  return {
    position,
    setPosition: moveTo,
    containerRef,
    dragHandleProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    },
  }
}
