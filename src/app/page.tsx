"use client";
import React, { useState } from "react";
import { parseTeeTimeData } from "./utils/parseData";
import "./App.css";

const App: React.FC = () => {
  const [rawData, setRawData] = useState("");
  const [organizedData, setOrganizedData] = useState<ReturnType<
    typeof parseTeeTimeData
  > | null>(null);
  const [viewMode, setViewMode] = useState<"byNumber" | "byTime">("byNumber");

  const handleProcessData = () => {
    const data = parseTeeTimeData(rawData);
    // Sort the numbers in each range
    Object.keys(data.ranges).forEach((key) => {
      const rangeKey = key as keyof typeof data.ranges;
      data.ranges[rangeKey].sort((a, b) => a - b);
    });

    // Sort marked numbers and PC associations
    data.filteredMarkedNumbers.sort((a, b) => a - b);
    data.pcNumbers.sort((a, b) => a.bag - b.bag);

    // Sort bagsByTimes by time
    // Object.keys(data.bagsByTimes).forEach((time) => {
    //   data.bagsByTimes[time].sort((a, b) => a - b);
    // });

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
                    Bag Number Ranges
                  </h2>
                  {Object.entries(organizedData.ranges).map(
                    ([range, numbers]) => (
                      <p key={range}>
                        <strong className="text-blue-300">{range}:</strong>{" "}
                        {numbers.length > 0 ? numbers.join(", ") : "None"}
                      </p>
                    )
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2 text-blue-400">
                    Bag Number Associations with PC#
                  </h2>
                  {organizedData.pcNumbers.length > 0 ? (
                    organizedData.pcNumbers.map(({ bag, pc }, idx) => (
                      <p key={idx}>
                        <strong className="text-blue-300">Bag#:</strong> {bag} →{" "}
                        <strong>PC#:</strong> {pc}
                      </p>
                    ))
                  ) : (
                    <p>None</p>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2 text-blue-400">
                    Riding in Cart or has Personal PC
                  </h2>
                  {organizedData.filteredMarkedNumbers.length > 0 ? (
                    <p>{organizedData.filteredMarkedNumbers.join(", ")}</p>
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
                {Object.entries(organizedData.timesWithBags).map(
                  ([time, bags]) => (
                    <div key={time}>
                      {bags.bagNumbers.length > 0 ? (
                        <div>
                          <strong className="text-blue-300">
                            {bags.time}:
                          </strong>{" "}
                          {bags.bagNumbers.join(", ")}
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
    </div>
  );
  // 12 15 26 39 5096 30 252  9
  // 12 15 26 39 50 96 252
};

export default App;
