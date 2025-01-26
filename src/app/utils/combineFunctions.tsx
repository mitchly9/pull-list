export const combineSortedBagNumbers = (
  oldSortedBagNumbers: Record<string, number[]>,
  newSortedBagNumbers: Record<string, number[]>
): Record<string, number[]> => {
  const combinedRanges: Record<string, number[]> = {};
  Object.keys(newSortedBagNumbers).forEach((bagRange) => {
    combinedRanges[bagRange] = [
      ...new Set([
        ...(oldSortedBagNumbers[bagRange] || []),
        ...newSortedBagNumbers[bagRange],
      ]),
    ].sort((a, b) => a - b);
  });
  return combinedRanges;
};

export const combineTeeTimes = (
  oldTimes: { teeTime: string; bagNumbers: number[] }[],
  newTimes: { teeTime: string; bagNumbers: number[] }[]
): { teeTime: string; bagNumbers: number[] }[] => {
  return newTimes.map((newTime) => {
    const oldTime = oldTimes.find((t) => t.teeTime === newTime.teeTime);
    return {
      teeTime: newTime.teeTime,
      bagNumbers: [
        ...new Set([...(oldTime?.bagNumbers || []), ...newTime.bagNumbers]),
      ].sort((a, b) => a - b),
    };
  });
};

/**
 * Combines two sets or arrays, removes duplicates, and returns a sorted Set.
 * @param oldItems - The old items as an array or Set.
 * @param newItems - The new items as an array or Set.
 * @returns A new Set containing the combined and sorted items.
 */
export function combineCartBagNumbers(
  oldCartBagNumbers: Set<number> | number[],
  newCartBagNumbers: Set<number> | number[]
): Set<number> {
  return new Set(
    [...oldCartBagNumbers, ...newCartBagNumbers].sort((a, b) => a - b) // Sort in ascending order
  );
}

/**
 * Combines two arrays of objects with `bag` and `pc` properties.
 * Ensures unique `bag` values, combines `pc` values as per the logic, and sorts the result by `bag`.
 * @param oldPcNumbers - Array of old items with `bag` and `pc` properties.
 * @param newPcNumbers - Array of new items with `bag` and `pc` properties.
 * @returns A sorted array of combined objects with `bag` and `pc` properties.
 */
export function combinePcNumbers(
  oldPcNumbers: { bag: number; pc: number }[],
  newPcNumbers: { bag: number; pc: number }[]
): { bag: number; pc: number }[] {
  const combinedPcNumbers: { bag: number; pc: number }[] = [];

  // Combine new items with corresponding old items
  newPcNumbers.forEach((newItem) => {
    const oldItem = oldPcNumbers.find((old) => old.bag === newItem.bag);

    if (oldItem) {
      // Combine logic for pc values (modify as needed)
      combinedPcNumbers.push({
        bag: newItem.bag,
        pc: Math.min(oldItem.pc, newItem.pc),
      });
    } else {
      // If no old item exists, add the new item
      combinedPcNumbers.push(newItem);
    }
  });

  // Add remaining old items that are not in newPcNumbers
  oldPcNumbers.forEach((oldItem) => {
    const isAlreadyAdded = newPcNumbers.some(
      (newItem) => newItem.bag === oldItem.bag
    );
    if (!isAlreadyAdded) {
      combinedPcNumbers.push(oldItem);
    }
  });

  // Sort by bag number
  return combinedPcNumbers.sort((a, b) => a.bag - b.bag);
}
