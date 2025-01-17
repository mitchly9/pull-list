"use client";
import React, { useRef, useState } from "react";
import { parseTeeTimeData } from "./utils/parseData";
import "./App.css";

const App: React.FC = () => {
  const [rawData, setRawData] = useState("");
  const [organizedData, setOrganizedData] = useState<ReturnType<
    typeof parseTeeTimeData
  > | null>(null);

  const oldBagNumbersRef = useRef<Set<number>>(new Set());
  const newBagNumbersRef = useRef<Set<number>>(new Set());

  const oldRangesRef = useRef<Record<string, number[]>>({});
  const newRangesRef = useRef<Record<string, number[]>>({});
  const combinedRangesRef = useRef<Record<string, number[]>>({});

  const oldTimesRef = useRef<{ time: string; bagNumbers: number[] }[]>([]);
  const newTimesRef = useRef<{ time: string; bagNumbers: number[] }[]>([]);
  const combinedTimesRef = useRef<{ time: string; bagNumbers: number[] }[]>([]);

  const oldPcNumbersRef = useRef<{ bag: number; pc: number }[]>([]);
  const newPcNumbersRef = useRef<{ bag: number; pc: number }[]>([]);
  const combinedPcNumbersRef = useRef<{ bag: number; pc: number }[]>([]);

  const oldFilteredMarkedNumbersRef = useRef<number[]>([]);
  const newFilteredMarkedNumbersRef = useRef<number[]>([]);
  const combinedFilteredMarkedNumbersRef = useRef<Set<number>>(new Set());

  const [viewMode, setViewMode] = useState<"byNumber" | "byTime">("byNumber");

  const handleProcessData = () => {
    const data = parseTeeTimeData(rawData);

    // Sort the numbers in each range
    Object.keys(data.ranges).forEach((key) => {
      const rangeKey = key as keyof typeof data.ranges;
      data.ranges[rangeKey].sort((a, b) => a - b);
    });

    data.filteredMarkedNumbers.sort((a, b) => a - b);

    data.timesWithBags.forEach((item) => {
      item.bagNumbers.sort((a, b) => a - b); // Sort the numbers in ascending order
    });

    // Save the current value of newRanges

    // Update the ref for immediate synchronous access
    oldRangesRef.current = newRangesRef.current;
    oldBagNumbersRef.current = newBagNumbersRef.current;
    oldTimesRef.current = newTimesRef.current;
    oldPcNumbersRef.current = newPcNumbersRef.current;
    oldFilteredMarkedNumbersRef.current = newFilteredMarkedNumbersRef.current;

    // Update newRanges to the new value
    newRangesRef.current = { ...data.ranges };
    newTimesRef.current = [...data.timesWithBags];
    newPcNumbersRef.current = [...data.pcNumbers];
    newFilteredMarkedNumbersRef.current = [...data.filteredMarkedNumbers];

    // Update newBagNumbers with combined numbers from all ranges
    newBagNumbersRef.current = new Set([
      ...data.ranges["1-72"],
      ...data.ranges["73-144"],
      ...data.ranges["145-216"],
      ...data.ranges["217-252"],
      ...data.ranges["253-324"],
      ...data.ranges["325+"],
    ]);

    // Combine ranges using the current value of oldRanges
    combinedRangesRef.current = (() => {
      const combinedRanges: Record<
        keyof typeof newRangesRef.current,
        number[]
      > = {}; // Specify exact key type for combinedRanges

      // Iterate through each key in data.ranges
      for (const key in data.ranges) {
        const rangeKey = key as keyof typeof data.ranges;

        // Combine the arrays for each range, remove duplicates, and sort the result
        combinedRanges[rangeKey] = oldRangesRef.current[rangeKey]
          ? [
              ...new Set(
                oldRangesRef.current[rangeKey].concat(data.ranges[rangeKey])
              ),
            ].sort((a, b) => a - b) // Sort in ascending order
          : [...new Set(data.ranges[rangeKey])].sort((a, b) => a - b); // Sort in ascending order
      }

      return combinedRanges;
    })();

    combinedTimesRef.current = (() => {
      const combinedTimes: { time: string; bagNumbers: number[] }[] = [];

      // Iterate over each time and combine old and new times
      data.timesWithBags.forEach(
        (item: { time: string; bagNumbers: number[] }) => {
          const oldTime = oldTimesRef.current.find(
            (old) => old.time === item.time
          );
          const newTime = newTimesRef.current.find(
            (newT) => newT.time === item.time
          );

          // Combine the bag numbers for each time, remove duplicates, and sort the result
          combinedTimes.push({
            time: item.time,
            bagNumbers: [
              ...new Set([
                ...(oldTime ? oldTime.bagNumbers : []),
                ...item.bagNumbers,
                ...(newTime ? newTime.bagNumbers : []),
              ]),
            ].sort((a, b) => a - b),
          });
        }
      );

      return combinedTimes; // Return the combined times from the IIFE
    })();

    combinedFilteredMarkedNumbersRef.current = new Set(
      [
        ...oldFilteredMarkedNumbersRef.current,
        ...newFilteredMarkedNumbersRef.current,
      ].sort((a, b) => a - b) // Sort the array in ascending order
    );

    combinedPcNumbersRef.current = (() => {
      const combinedPcNumbers: { bag: number; pc: number }[] = [];

      // Iterate over newPcNumbersRef to combine with oldPcNumbersRef
      newPcNumbersRef.current.forEach((newItem) => {
        // Check if there's a corresponding item in oldPcNumbersRef
        const oldItem = oldPcNumbersRef.current.find(
          (old) => old.bag === newItem.bag
        );

        if (oldItem) {
          // If there's an old item, combine the pc values (unique) and sort them
          combinedPcNumbers.push({
            bag: newItem.bag,
            pc: Math.min(oldItem.pc, newItem.pc), // Example of combining PCs, modify logic as needed
          });
        } else {
          // If no old item exists, just push the new item
          combinedPcNumbers.push(newItem);
        }
      });

      // Add any remaining items from oldPcNumbersRef that are not in newPcNumbersRef
      oldPcNumbersRef.current.forEach((oldItem) => {
        const isAlreadyAdded = newPcNumbersRef.current.some(
          (newItem) => newItem.bag === oldItem.bag
        );
        if (!isAlreadyAdded) {
          combinedPcNumbers.push(oldItem);
        }
      });

      return combinedPcNumbers.sort((a, b) => a.bag - b.bag); // Sort by bag number for consistency
    })();

    setOrganizedData(data);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 shadow-lg rounded-lg p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Tee Time Organizer
        </h1>

        <textarea
          className="w-full h-40 p-2 bg-gray-700 text-gray-200 border border-gray-600 rounded mb-4"
          placeholder="Paste your tee times here..."
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
        />

        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          onClick={handleProcessData}
        >
          Organize Tee Times
        </button>

        {organizedData && (
          <div className="mt-6">
            <div className="flex space-x-4 mb-4">
              <button
                className={`py-2 px-4 rounded ${
                  viewMode === "byNumber"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                }`}
                onClick={() => setViewMode("byNumber")}
              >
                View by Numbers
              </button>
              <button
                className={`py-2 px-4 rounded ${
                  viewMode === "byTime"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                }`}
                onClick={() => setViewMode("byTime")}
              >
                View by Time
              </button>
            </div>

            {viewMode === "byNumber" ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-blue-400">
                    Bag Number Ranges{" "}
                    <span className="text-sm font-sans font-normal text-gray-300">
                      (Total Bags:{" "}
                      <span className="text-gray-200 font-medium">
                        {newBagNumbersRef.current.size}
                      </span>
                      )
                      {/* {oldBagNumbersRef.current.size !== 0 ? (
                        <span>
                          , Added:{" "}
                          <span className="text-gray-200 font-medium">
                            {Math.max(
                              newBagNumbersRef.current.size -
                                oldBagNumbersRef.current.size,
                              0
                            )}
                          </span>
                          , Removed:{" "}
                          <span className="text-gray-200 font-medium">
                            {Math.max(
                              oldBagNumbersRef.current.size -
                                newBagNumbersRef.current.size,
                              0
                            )}
                          </span>
                        </span>
                      ) : (
                        <></>
                      )} */}
                    </span>
                  </h2>

                  {Object.entries(combinedRangesRef.current).map(
                    ([range, numbers]) => (
                      <p key={range + "range"}>
                        <strong className="text-blue-300">{range}:</strong>{" "}
                        {numbers.map((num: number) => {
                          const oldBagNumbersExist =
                            oldBagNumbersRef.current.size !== 0;
                          const isAdded = !oldBagNumbersRef.current.has(num);
                          const isRemoved =
                            oldBagNumbersRef.current.has(num) &&
                            !newBagNumbersRef.current.has(num);
                          return (
                            <span
                              key={num}
                              className={
                                !oldBagNumbersExist
                                  ? "text-gray-200"
                                  : isRemoved
                                  ? "text-red-400"
                                  : isAdded
                                  ? "text-green-400"
                                  : "text-gray-200"
                              }
                            >
                              {num}{" "}
                            </span>
                          );
                        })}
                      </p>
                    )
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2 text-blue-400">
                    Bag Number Associations with PC#
                  </h2>

                  {combinedPcNumbersRef.current.length > 0 ? (
                    combinedPcNumbersRef.current.map(({ bag, pc }) => {
                      const oldBagNumbersExist =
                        oldBagNumbersRef.current.size !== 0;
                      const isAdded = !oldBagNumbersRef.current.has(bag);
                      const isRemoved =
                        oldBagNumbersRef.current.has(bag) &&
                        !newBagNumbersRef.current.has(bag);
                      return (
                        <div
                          key={bag}
                          className={
                            !oldBagNumbersExist
                              ? "text-gray-200"
                              : isRemoved
                              ? "text-red-400"
                              : isAdded
                              ? "text-green-400"
                              : "text-gray-200"
                          }
                        >
                          <strong className="text-blue-300">Bag#:</strong>{" "}
                          <span>{bag}</span> → <strong>PC#:</strong> {pc}{" "}
                        </div>
                      );
                    })
                  ) : (
                    <p>None</p>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2 text-blue-400">
                    Riding in Cart or has Personal PC
                  </h2>
                  {combinedFilteredMarkedNumbersRef.current.size > 0 ? (
                    <div>
                      {Array.from(combinedFilteredMarkedNumbersRef.current).map(
                        (bagNumber, index) => {
                          const oldBagNumbersExist =
                            oldBagNumbersRef.current.size !== 0;
                          const isAdded =
                            !oldBagNumbersRef.current.has(bagNumber);
                          const isRemoved =
                            oldBagNumbersRef.current.has(bagNumber) &&
                            !newBagNumbersRef.current.has(bagNumber);
                          return (
                            <span
                              key={bagNumber}
                              className={
                                !oldBagNumbersExist
                                  ? "text-gray-200"
                                  : isRemoved
                                  ? "text-red-400"
                                  : isAdded
                                  ? "text-green-400"
                                  : "text-gray-200"
                              }
                            >
                              <span key={index}>
                                {bagNumber}
                                {index !==
                                combinedFilteredMarkedNumbersRef.current.size -
                                  1
                                  ? ","
                                  : ""}{" "}
                              </span>{" "}
                            </span>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <p>None</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-2 text-blue-400">
                  Bags by Times
                </h2>
                {Object.entries(combinedTimesRef.current).map(
                  ([time, bags]) => (
                    <div key={time}>
                      {bags.bagNumbers.length > 0 ? (
                        <div>
                          <strong className="text-blue-300">
                            {bags.time}:{" "}
                          </strong>
                          {bags.bagNumbers.map(
                            (bagNumber: number, index: number) => {
                              const oldBagNumbersExist =
                                oldBagNumbersRef.current.size !== 0;
                              const isAdded =
                                !oldBagNumbersRef.current.has(bagNumber);
                              const isRemoved =
                                oldBagNumbersRef.current.has(bagNumber) &&
                                !newBagNumbersRef.current.has(bagNumber);
                              return (
                                <span
                                  key={bagNumber}
                                  className={
                                    !oldBagNumbersExist
                                      ? "text-gray-200"
                                      : isRemoved
                                      ? "text-red-400"
                                      : isAdded
                                      ? "text-green-400"
                                      : "text-gray-200"
                                  }
                                >
                                  <span key={index}>
                                    {bagNumber}
                                    {index !== bags.bagNumbers.length - 1
                                      ? ","
                                      : ""}{" "}
                                  </span>{" "}
                                </span>
                              );
                            }
                          )}
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {oldBagNumbersRef.current.size !== 0 ? (
        <p className="p-4 text-gray-400 text-sm ">
          <strong>Red text:</strong> Bags that are no longer on the tee sheet.{" "}
          <br />
          <strong>Green text:</strong> Bags that have been recently added.
        </p>
      ) : (
        <></>
      )}
    </div>
  );
};

export default App;
