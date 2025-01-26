import { useRef } from "react";

export const useBagNumbers = () => {
  const oldBagNumbersRef = useRef<Set<number>>(new Set());
  const newBagNumbersRef = useRef<Set<number>>(new Set());

  return { oldBagNumbersRef, newBagNumbersRef };
};

export const useTeeTimes = () => {
  const oldTeeTimesRef = useRef<{ teeTime: string; bagNumbers: number[] }[]>(
    []
  );
  const newTeeTimesRef = useRef<{ teeTime: string; bagNumbers: number[] }[]>(
    []
  );
  const combinedTeeTimesRef = useRef<
    { teeTime: string; bagNumbers: number[] }[]
  >([]);

  return { oldTeeTimesRef, newTeeTimesRef, combinedTeeTimesRef };
};

export const usePcNumbers = () => {
  const oldPcNumbersRef = useRef<{ bag: number; pc: number }[]>([]);
  const newPcNumbersRef = useRef<{ bag: number; pc: number }[]>([]);
  const combinedPcNumbersRef = useRef<{ bag: number; pc: number }[]>([]);

  return { oldPcNumbersRef, newPcNumbersRef, combinedPcNumbersRef };
};

export const useSortedBagNumbers = () => {
  const oldSortedBagNumbersRef = useRef<Record<string, number[]>>({});
  const newSortedBagNumbersRef = useRef<Record<string, number[]>>({});
  const combinedSortedBagNumbersRef = useRef<Record<string, number[]>>({});

  return {
    oldSortedBagNumbersRef,
    newSortedBagNumbersRef,
    combinedSortedBagNumbersRef,
  };
};

export const useCartBagNumbers = () => {
  const oldCartBagNumbersRef = useRef<number[]>([]);
  const newCartBagNumbersRef = useRef<number[]>([]);
  const combinedCartBagNumbersRef = useRef<Set<number>>(new Set());

  return {
    oldCartBagNumbersRef,
    newCartBagNumbersRef,
    combinedCartBagNumbersRef,
  };
};
