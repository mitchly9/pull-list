"use client";
import React, { useState } from "react";
import { parseTeeTimeData } from "./utils/parseData";
import {
  combineSortedBagNumbers,
  combineTeeTimes,
  combineCartBagNumbers,
  combinePcNumbers,
} from "./utils/combineFunctions";
import {
  useBagNumbers,
  usePcNumbers,
  useSortedBagNumbers,
  useTeeTimes,
  useCartBagNumbers,
} from "./hooks/dataReferenceHooks";
import "./App.css";

const App: React.FC = () => {
  // Initialize hooks for re-rendering when needed
  const [teeTimeInput, setTeeTimeInput] = useState("");
  const [parsedData, setParsedData] = useState<ReturnType<
    typeof parseTeeTimeData
  > | null>(null);
  const [viewMode, setViewMode] = useState<"byNumber" | "byTeeTime">(
    "byNumber"
  );

  // Create Refs
  const { oldBagNumbersRef, newBagNumbersRef } = useBagNumbers();
  const { oldTeeTimesRef, newTeeTimesRef, combinedTeeTimesRef } = useTeeTimes();
  const { oldPcNumbersRef, newPcNumbersRef, combinedPcNumbersRef } =
    usePcNumbers();
  const {
    oldSortedBagNumbersRef,
    newSortedBagNumbersRef,
    combinedSortedBagNumbersRef,
  } = useSortedBagNumbers();
  const {
    newCartBagNumbersRef,
    oldCartBagNumbersRef,
    combinedCartBagNumbersRef,
  } = useCartBagNumbers();

  /**
   * Stores the previous values to old, and sets the new values into new
   * @param data - The dataset containing the new data for sortedBagNumbers,
   *               teeTimeswithBags, pcNumbers, and cartBagNumbers
   */
  const updateOldAndNewRefs = (data: {
    sortedBagNumbers: Record<string, number[]>;
    teeTimesWithBags: { teeTime: string; bagNumbers: number[] }[];
    pcNumbers: {
      bag: number;
      pc: number;
    }[];
    cartBagNumbers: number[];
  }) => {
    // Stores the previous values
    oldSortedBagNumbersRef.current = newSortedBagNumbersRef.current;
    oldBagNumbersRef.current = newBagNumbersRef.current;
    oldTeeTimesRef.current = newTeeTimesRef.current;
    oldPcNumbersRef.current = newPcNumbersRef.current;
    oldCartBagNumbersRef.current = newCartBagNumbersRef.current;

    // Stores the new values
    newSortedBagNumbersRef.current = { ...data.sortedBagNumbers };
    newTeeTimesRef.current = [...data.teeTimesWithBags];
    newPcNumbersRef.current = [...data.pcNumbers];
    newCartBagNumbersRef.current = [...data.cartBagNumbers];
    newBagNumbersRef.current = new Set([
      ...data.sortedBagNumbers["1-72"],
      ...data.sortedBagNumbers["73-144"],
      ...data.sortedBagNumbers["145-216"],
      ...data.sortedBagNumbers["217-252"],
      ...data.sortedBagNumbers["253-324"],
      ...data.sortedBagNumbers["325+"],
    ]);
  };

  // Combines the old and new data into a single constant for all four refs
  const combineData = () => {
    combinedSortedBagNumbersRef.current = combineSortedBagNumbers(
      oldSortedBagNumbersRef.current,
      newSortedBagNumbersRef.current
    );

    combinedTeeTimesRef.current = combineTeeTimes(
      oldTeeTimesRef.current,
      newTeeTimesRef.current
    );

    combinedCartBagNumbersRef.current = combineCartBagNumbers(
      oldCartBagNumbersRef.current,
      newCartBagNumbersRef.current
    );

    combinedPcNumbersRef.current = combinePcNumbers(
      oldPcNumbersRef.current,
      newPcNumbersRef.current
    );
  };

  // Parses the data, sets the refs, and combines the data.
  const handleProcessData = () => {
    const data = parseTeeTimeData(teeTimeInput);

    updateOldAndNewRefs(data);
    combineData();

    setParsedData(data);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 shadow-lg rounded-lg p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Tee TeeTime Organizer
        </h1>

        <textarea
          className="w-full h-40 p-2 bg-gray-700 text-gray-200 border border-gray-600 rounded mb-4"
          placeholder="Paste your tee TeeTimes here..."
          value={teeTimeInput}
          onChange={(e) => setTeeTimeInput(e.target.value)}
        />

        <button
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          onClick={handleProcessData}
        >
          Organize Tee TeeTimes
        </button>

        {parsedData && (
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
                  viewMode === "byTeeTime"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                }`}
                onClick={() => setViewMode("byTeeTime")}
              >
                View by TeeTime
              </button>
            </div>

            {viewMode === "byNumber" ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-blue-400">
                    Bag Number sortedBagNumbers{" "}
                    <span className="text-sm font-sans font-normal text-gray-300">
                      (Total Bags:{" "}
                      <span className="text-gray-200 font-medium">
                        {newBagNumbersRef.current.size}
                      </span>
                      )
                    </span>
                  </h2>

                  {Object.entries(combinedSortedBagNumbersRef.current).map(
                    ([range, numbers]) => (
                      <p key={range + "range"}>
                        <strong className="text-blue-300">{range}:</strong>{" "}
                        {numbers.map((num: number, index: number) => {
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
                              {num}
                              {index !== numbers.length - 1 ? "," : ""}{" "}
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
                  {combinedCartBagNumbersRef.current.size > 0 ? (
                    <div>
                      {Array.from(combinedCartBagNumbersRef.current).map(
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
                                combinedCartBagNumbersRef.current.size - 1
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
                  Bags by TeeTimes
                </h2>
                {Object.entries(combinedTeeTimesRef.current).map(
                  ([teeTime, bags]) => (
                    <div key={teeTime}>
                      {bags.bagNumbers.length > 0 ? (
                        <div>
                          <strong className="text-blue-300">
                            {bags.teeTime}:{" "}
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
