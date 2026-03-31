import { useEffect, useState } from 'react'

export function useFontsReady(fonts, sample = 'The quick brown fox') {
  const [readyTick, setReadyTick] = useState(0)
  const fontKey = fonts.join('||')

  useEffect(() => {
    let cancelled = false

    const loadFonts = async () => {
      const fontList = fontKey ? fontKey.split('||') : []

      if (!document.fonts?.load) {
        setReadyTick((value) => value + 1)
        return
      }

      await Promise.allSettled(fontList.map((font) => document.fonts.load(font, sample)))

      if (!cancelled) {
        setReadyTick((value) => value + 1)
      }
    }

    void loadFonts()

    return () => {
      cancelled = true
    }
  }, [fontKey, sample])

  return readyTick
}
