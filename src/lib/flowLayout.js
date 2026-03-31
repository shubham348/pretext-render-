const MIN_LINE_WIDTH = 48
const SPLIT_MIN_WIDTH = 72
const OBJECT_PADDING = 8

function getObstaclePadding(obstacle) {
  return obstacle?.padding ?? OBJECT_PADDING
}

function lineIntersectsObject(y, lineHeight, object) {
  if (!object) return false

  const lineBottom = y + lineHeight
  const objectBottom = object.y + object.height

  return lineBottom > object.y && y < objectBottom
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function getBlockedInterval(width, y, lineHeight, obstacle) {
  if (!obstacle) {
    return null
  }

  const padding = getObstaclePadding(obstacle)

  if (!lineIntersectsObject(y, lineHeight, obstacle)) {
    return null
  }

  if (obstacle.rowIntervals?.length) {
    const localRow = Math.round(y + lineHeight / 2 - obstacle.y)
    const interval =
      obstacle.rowIntervals[clamp(localRow, 0, obstacle.rowIntervals.length - 1)]

    if (interval) {
      return {
        left: clamp(obstacle.x + interval.left - padding, 0, width),
        right: clamp(obstacle.x + interval.right + padding, 0, width),
      }
    }

    return null
  }

  return {
    left: clamp(obstacle.x - padding, 0, width),
    right: clamp(obstacle.x + obstacle.width + padding, 0, width),
  }
}

function getLineCursor(line) {
  return line.nextCursor ?? line.end ?? null
}

function pushSegment(segments, line, x, width) {
  segments.push({
    ...line,
    x,
    width,
  })
}

function getDropCapOffset(y, lineHeight, dropCap) {
  if (!dropCap?.letter || !dropCap.inset) return 0
  if (y >= dropCap.inset.lines * lineHeight) return 0

  return dropCap.inset.width
}

export function computeFlowLayout({
  getNextLine,
  width,
  lineHeight,
  obstacle,
  dropCap,
}) {
  const rows = []
  let cursor = { segmentIndex: 0, graphemeIndex: 0 }
  let y = 0

  while (true) {
    const rowStartCursor = cursor
    const segments = []
    const blocked = getBlockedInterval(width, y, lineHeight, obstacle)
    const baseOffsetX = getDropCapOffset(y, lineHeight, dropCap)
    const baseWidth = Math.max(MIN_LINE_WIDTH, width - baseOffsetX)

    if (!blocked) {
      const line = getNextLine(cursor, baseWidth)

      if (line === null) break

      pushSegment(segments, line, baseOffsetX, baseWidth)
      cursor = getLineCursor(line)
    } else {
      const leftWidth = Math.max(0, blocked.left - baseOffsetX)
      const rightStart = Math.min(width, blocked.right)
      const rightWidth = Math.max(0, width - rightStart)

      if (leftWidth >= SPLIT_MIN_WIDTH && rightWidth >= SPLIT_MIN_WIDTH) {
        const leftLine = getNextLine(cursor, Math.max(MIN_LINE_WIDTH, leftWidth))

        if (leftLine === null) break

        pushSegment(segments, leftLine, baseOffsetX, leftWidth)
        cursor = getLineCursor(leftLine)

        const rightLine = getNextLine(cursor, Math.max(MIN_LINE_WIDTH, rightWidth))

        if (rightLine !== null) {
          pushSegment(segments, rightLine, rightStart, rightWidth)
          cursor = getLineCursor(rightLine)
        }
      } else {
        const offsetX = Math.max(baseOffsetX, rightStart)
        const availableWidth = Math.max(MIN_LINE_WIDTH, width - offsetX)
        const line = getNextLine(cursor, availableWidth)

        if (line === null) break

        pushSegment(segments, line, offsetX, availableWidth)
        cursor = getLineCursor(line)
      }
    }

    if (!cursor || segments.length === 0) break

    if (
      cursor.segmentIndex === rowStartCursor.segmentIndex &&
      cursor.graphemeIndex === rowStartCursor.graphemeIndex
    ) {
      break
    }

    rows.push({
      segments,
      y,
      intersectsObject: Boolean(blocked),
    })

    y += lineHeight
  }

  return {
    rows,
    lineCount: rows.length,
    segmentCount: rows.reduce((count, row) => count + row.segments.length, 0),
    height: Math.max(rows.length * lineHeight, obstacle ? obstacle.y + obstacle.height : 0),
  }
}
