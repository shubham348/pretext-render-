import { useMemo } from 'react'
import {
  layoutNextLine,
  layoutWithLines,
  prepareWithSegments,
} from '@chenglou/pretext'
import { PRETEXT_FONT } from '../lib/pretext'
import { useFontsReady } from './useFontsReady'

export function usePretextLayout(text, font = PRETEXT_FONT) {
  const fontReadyTick = useFontsReady([font])

  const prepared = useMemo(() => {
    void fontReadyTick
    const source = text?.trim() ? text : ''

    return prepareWithSegments(source, font, {
      whiteSpace: 'pre-wrap',
    })
  }, [font, fontReadyTick, text])

  const getLines = useMemo(
    () => (width, lineHeight) => layoutWithLines(prepared, width, lineHeight),
    [prepared],
  )

  const getNextLine = useMemo(
    () => (cursor, width) => layoutNextLine(prepared, cursor, width),
    [prepared],
  )

  return {
    prepared,
    getLines,
    getNextLine,
    fontReadyTick,
  }
}
