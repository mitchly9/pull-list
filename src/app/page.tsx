"use client";
import React, { useState } from "react";
import { parseTeeTimeData } from "./utils/parseData";
import "./App.css";

const App: React.FC = () => {
  const [rawData, setRawData] = useState("");
  const [organizedData, setOrganizedData] = useState<ReturnType<
    typeof parseTeeTimeData
  > | null>(null);

  const handleProcessData = () => {
    const data = parseTeeTimeData(rawData);
    // Sort the numbers in each range
    Object.keys(data.ranges).forEach((key) => {
      data.ranges[key].sort((a, b) => a - b);
    });
    // Sort marked numbers and PC associations
    data.filteredMarkedNumbers.sort((a, b) => a - b);
    data.pcNumbers.sort((a, b) => a.bag - b.bag);
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
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
