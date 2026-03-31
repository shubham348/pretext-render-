import { useMemo } from 'react'
import {
  layoutNextLine,
  layoutWithLines,
  prepareWithSegments,
} from '@chenglou/pretext'
import { PRETEXT_FONT } from '../lib/pretext'
import { useFontsReady } from './useFontsReady'

export function usePretextLayout(text) {
  const fontReadyTick = useFontsReady([PRETEXT_FONT])

  const prepared = useMemo(() => {
    void fontReadyTick
    const source = text?.trim() ? text : ''

    return prepareWithSegments(source, PRETEXT_FONT, {
      whiteSpace: 'pre-wrap',
    })
  }, [fontReadyTick, text])

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
