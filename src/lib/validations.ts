import { TrackType } from './types'

export interface EnrollmentValidationRecord {
  level_id: string
  track_type: string
  status: string
  levels: {
    level_title: string
    course_id: string
  }
}

export interface ValidationResult {
  isValid: boolean
  errorType?: 'ExpertConflict' | 'ProgressiveConflict' | 'FastConflict' | 'LevelOverlap'
  errorMessage?: string
  conflictingLevels?: string[]
}

export function validateTrackSelection(
  existingEnrollments: EnrollmentValidationRecord[],
  requestedTrack: TrackType,
  requestedLevelIds: string[],
  allCourseLevels: { level_id: string; no: number }[] = []
): ValidationResult {
  // Extract all tracks the user currently owns (excluding rejected ones if they were filtered before passing here)
  const ownedTracks = Array.from(new Set(existingEnrollments.map((e) => e.track_type)))
  
  // 1. Expert / Premium Rule
  if (ownedTracks.includes('Expert') || ownedTracks.includes('Premium')) {
    const trackName = ownedTracks.includes('Expert') ? 'Expert' : 'Premium'
    return {
      isValid: false,
      errorType: 'ExpertConflict',
      errorMessage: `You already have full access to this course via the ${trackName} track.`,
    }
  }

  // 2. Progressive Track Rule
  if (ownedTracks.includes('Progressive')) {
    if (requestedTrack === 'Expert' || requestedTrack === 'Fast') {
      return {
        isValid: false,
        errorType: 'ProgressiveConflict',
        errorMessage: `You are currently enrolled in the Progressive track for this course. You cannot switch to the ${requestedTrack} track.`,
      }
    }
  }

  // 3. Fast Track Rule
  if (ownedTracks.includes('Fast')) {
    if (requestedTrack === 'Progressive' || requestedTrack === 'Expert') {
      return {
        isValid: false,
        errorType: 'FastConflict',
        errorMessage: `You have previously customized your learning via the Fast track. You cannot purchase the ${requestedTrack} track.`,
      }
    }
  }

  // 4. Fast Track Consecutive Levels Rule
  if (requestedTrack === 'Fast' && allCourseLevels.length > 0) {
    const ownedNos = existingEnrollments
      .map((e) => allCourseLevels.find((l) => l.level_id === e.level_id)?.no)
      .filter((n): n is number => n !== undefined)

    const requestedNos = allCourseLevels
      .filter((l) => requestedLevelIds.includes(l.level_id))
      .map((l) => l.no)
      .sort((a, b) => a - b)

    if (requestedNos.length > 0) {
      if (ownedNos.length === 0) {
        // First time purchase: must be consecutive
        for (let i = 1; i < requestedNos.length; i++) {
          if (requestedNos[i] - requestedNos[i - 1] !== 1) {
            return {
              isValid: false,
              errorType: 'FastConflict',
              errorMessage: 'You must select consecutive levels in the Fast track (e.g., Level 1 and 2). You cannot skip levels.',
            }
          }
        }
      } else {
        // Subsequent purchase
        const maxOwned = Math.max(...ownedNos)
        const ascendingRequested = requestedNos.filter((n) => n > maxOwned)

        if (ascendingRequested.length > 0) {
          // Must start exactly at maxOwned + 1
          if (ascendingRequested[0] !== maxOwned + 1) {
            return {
              isValid: false,
              errorType: 'FastConflict',
              errorMessage: `You must purchase Level ${maxOwned + 1} before skipping to higher levels.`,
            }
          }
          // Must be consecutive
          for (let i = 1; i < ascendingRequested.length; i++) {
            if (ascendingRequested[i] - ascendingRequested[i - 1] !== 1) {
              return {
                isValid: false,
                errorType: 'FastConflict',
                errorMessage: 'Higher levels must be purchased consecutively. You cannot skip levels.',
              }
            }
          }
        }
        // Descending requested (n < maxOwned) have no consecutive restrictions.
      }
    }
  }

  // 5. Level Overlap Rule
  const ownedLevelIds = existingEnrollments.map((e) => e.level_id)
  const overlappingLevelIds = requestedLevelIds.filter((id) => ownedLevelIds.includes(id))

  if (overlappingLevelIds.length > 0) {
    const overlappingNames = existingEnrollments
      .filter((e) => overlappingLevelIds.includes(e.level_id))
      .map((e) => e.levels.level_title)
    
    const uniqueNames = Array.from(new Set(overlappingNames)).join(', ')

    return {
      isValid: false,
      errorType: 'LevelOverlap',
      errorMessage: `You have already enrolled in: ${uniqueNames}. Please choose different levels.`,
      conflictingLevels: overlappingLevelIds,
    }
  }

  return { isValid: true }
}
