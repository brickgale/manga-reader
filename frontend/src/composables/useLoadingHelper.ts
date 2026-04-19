/**
 * Ensures an async operation takes at least `minimumDuration` milliseconds.
 * Useful for preventing skeleton flickers on fast responses while still
 * guaranteeing the skeleton is visible long enough to be perceived.
 */
export async function withMinimumLoadingTime<T>(
  operation: () => Promise<T>,
  minimumDuration = 1000,
): Promise<T> {
  const startTime = Date.now()

  try {
    return await operation()
  } finally {
    const elapsed = Date.now() - startTime
    const remainingTime = Math.max(0, minimumDuration - elapsed)

    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    }
  }
}
