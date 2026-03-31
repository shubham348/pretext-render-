export const DROP_CAP_WIDTH = 72
export const DROP_CAP_LINES = 4

export function extractDropCapContent(text) {
  const source = text?.trimStart() ?? ''

  if (!source) {
    return {
      dropCap: '',
      bodyText: '',
    }
  }

  const [dropCap, ...rest] = source

  return {
    dropCap,
    bodyText: rest.join('').trimStart(),
  }
}

export function getDropCapInset() {
  return {
    width: DROP_CAP_WIDTH,
    lines: DROP_CAP_LINES,
  }
}
