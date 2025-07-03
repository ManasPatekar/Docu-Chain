import { useEffect, useState } from "react";

export default function ScanResults() {
  const [scanResult, setScanResult] = useState("");

  useEffect(() => {
    const result = localStorage.getItem("latestScanResult");
    setScanResult(result || "No result available");
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-white-800 mb-4">Scan Results</h2>
      <div className="bg-white shadow rounded p-4">
        <p className="text-gray-700 text-lg">
          <span className="font-semibold">Result:</span> {scanResult}
        </p>
      </div>
    </div>
  );
}
