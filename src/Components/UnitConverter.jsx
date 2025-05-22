import React, { useState, useEffect } from "react";
import useUnitConversionData from "../Hooks/useUnitConversionData";
import SwapButton from "./SwapButton"; // Assuming SwapButton is a separate component

function UnitConverter() {
  const [unitType, setUnitType] = useState("len");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [showAbout, setShowAbout] = useState(false);
  // New state for toggling history
  const [keepHistory, setKeepHistory] = useState(true);

  const data = useUnitConversionData(unitType);

  useEffect(() => {
    if (
      inputValue !== "" &&
      fromUnit &&
      toUnit &&
      !isNaN(parseFloat(inputValue))
    ) {
      handleConversion();
    } else {
      setResult(null);
    }
  }, [inputValue, fromUnit, toUnit, unitType, data]);

  const handleConversion = () => {
    if (!data || !data.units[fromUnit] || !data.units[toUnit]) return;

    let outputResult;

    if (unitType === "temp") {
      const formulaKey = `${fromUnit}_to_${toUnit}`;
      const formula = data.formulas?.[formulaKey];
      if (formula) {
        try {
          const value = parseFloat(inputValue);
          // For a production app, consider a library like 'mathjs' for safety and robustness
          const output = Function("value", "return " + formula)(value);
          outputResult = `${output.toFixed(4)} ${data.units[toUnit].name}`;
          setResult(outputResult);
        } catch {
          outputResult = "Invalid temperature conversion";
          setResult(outputResult);
        }
      } else {
        outputResult = "Conversion not supported.";
        setResult(outputResult);
      }
    } else {
      const value = parseFloat(inputValue);
      const baseValue = value * data.units[fromUnit].toBase;
      const converted = baseValue / data.units[toUnit].toBase;
      outputResult = `${converted.toFixed(4)} ${data.units[toUnit].name}`;
      setResult(outputResult);
    }

    if (
      outputResult &&
      !outputResult.toLowerCase().includes("invalid") &&
      !outputResult.toLowerCase().includes("not supported") &&
      // Only add to history if keepHistory is true
      keepHistory
    ) {
      const newEntry = {
        id: Date.now(),
        unitType,
        fromUnit,
        toUnit,
        inputValue,
        result: outputResult,
        timestamp: new Date().toLocaleString(), // Add timestamp
      };
      setHistory((prev) => [newEntry, ...prev.slice(0, 4)]); // Keep max 5 entries
    }
  };

  const swapUnits = () => {
    setFromUnit((prevFrom) => {
      setToUnit(prevFrom);
      return toUnit;
    });
  };

  const clearForm = () => {
    setInputValue("");
    setFromUnit("");
    setToUnit("");
    setResult(null);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderUnitOptions = () =>
    data && data.units
      ? Object.entries(data.units).map(([key, unit]) => (
          <option key={key} value={key}>
            {unit.name}
          </option>
        ))
      : null;

  const loadHistoryItem = (item) => {
    setUnitType(item.unitType);
    setFromUnit(item.fromUnit);
    setToUnit(item.toUnit);
    setInputValue(item.inputValue);
    setResult(item.result);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 flex flex-col items-center font-sans">
      <header className="mb-10 mt-6 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-3 text-gray-900 drop-shadow-sm">
          UnitWise Convert
        </h1>
        <p className="text-md sm:text-lg font-medium text-gray-600 max-w-xl mx-auto">
          Your sleek and smart solution for quick unit conversions.
        </p>
      </header>
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl">
        {/* Converter Form */}
        <section className="flex-1 bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-10 flex flex-col space-y-6 lg:space-y-8">
          {/* Unit Type */}
          <div>
            <label
              htmlFor="unit-type"
              className="block text-lg font-semibold mb-2 text-gray-700"
            >
              Select Unit Type
            </label>
            <div className="relative">
              <select
                id="unit-type"
                value={unitType}
                onChange={(e) => {
                  setUnitType(e.target.value);
                  clearForm();
                }}
                className="block w-full p-3 text-base rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-blue-400 focus:ring-opacity-50 appearance-none pr-10 transition duration-200 ease-in-out bg-white cursor-pointer shadow-sm"
                title="Choose the category of units you want to convert."
              >
                <option value="len">Length</option>
                <option value="area">Area</option>
                <option value="vol">Volume</option>
                <option value="weight">Weight</option>
                <option value="time">Time</option>
                <option value="temp">Temperature</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                <svg
                  className="fill-current h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.95 4.95z" />
                </svg>
              </div>
            </div>
          </div>

          {/* From / Swap / To */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">
            <div>
              <label
                htmlFor="from-unit"
                className="block mb-2 font-semibold text-gray-700 text-lg"
              >
                From
              </label>
              <div className="relative">
                <select
                  id="from-unit"
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="block w-full p-3 text-base rounded-xl border-2 border-gray-200 bg-white text-gray-700
                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                    transition-shadow shadow-sm hover:shadow-md cursor-pointer appearance-none pr-10"
                  title="Select the unit you want to convert from."
                >
                  <option value="">-- Select Unit --</option>
                  {renderUnitOptions()}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                  <svg
                    className="fill-current h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.95 4.95z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-center sm:mb-2">
              <button
                onClick={swapUnits}
                className="bg-blue-500 hover:bg-blue-600 text-white p-3 sm:p-4 rounded-full shadow-md transition transform active:scale-95 flex items-center justify-center w-12 h-12"
                aria-label="Swap Units"
                title="Click to swap the 'From' and 'To' units."
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  ></path>
                </svg>
              </button>
            </div>

            <div>
              <label
                htmlFor="to-unit"
                className="block mb-2 font-semibold text-gray-700 text-lg"
              >
                To
              </label>
              <div className="relative">
                <select
                  id="to-unit"
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="block w-full p-3 text-base rounded-xl border-2 border-gray-200 bg-white text-gray-700
                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                    transition-shadow shadow-sm hover:shadow-md cursor-pointer appearance-none pr-10"
                  title="Select the unit you want to convert to."
                >
                  <option value="">-- Select Unit --</option>
                  {renderUnitOptions()}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                  <svg
                    className="fill-current h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.95 4.95z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Input Value */}
          <div>
            <label
              htmlFor="input-value"
              className="block mb-2 font-semibold text-gray-700 text-lg"
            >
              Enter Value
            </label>
            <input
              id="input-value"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*([eE][-+]?[0-9]+)?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g., 100 or 1.23e4"
              className="w-full p-4 text-xl rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-blue-400 focus:ring-opacity-50 transition placeholder-gray-400 font-mono shadow-sm"
              title="Enter the numeric value you wish to convert."
            />
            <p className="text-sm text-gray-500 mt-1">
              Supports whole numbers, decimals, and scientific notation (e.g.,
              1e6 for 1,000,000).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={clearForm}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl shadow-sm transition transform active:scale-95 flex items-center gap-2 border border-gray-200"
              title="Clear all inputs in the form."
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
              Clear
            </button>

            {result && (
              <button
                onClick={copyResult}
                className={`${
                  copied
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white font-semibold px-6 py-3 rounded-xl shadow-md transition transform active:scale-95 flex items-center gap-2`}
                title="Click to copy the conversion result to your clipboard."
              >
                {copied ? (
                  <>
                    Copied!
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </>
                ) : (
                  <>
                    Copy Result
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-4 3H9m10-4h2a2 2 0 012 2v3m-6 7H9"
                      ></path>
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </section>

        {/* Result & History Panel */}
        <section className="flex-1 flex flex-col gap-6 lg:gap-8">
          {/* Result */}
          <div className="bg-gray-100 rounded-3xl shadow-lg border border-gray-200 p-6 sm:p-10 flex flex-col items-center justify-center text-center min-h-[180px] sm:min-h-[220px] text-gray-800">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 text-gray-700">
              Conversion Result
            </h2>
            {result ? (
              <p className="text-3xl sm:text-4xl font-bold break-all px-4 py-2 bg-gray-200 rounded-lg shadow-inner text-gray-900">
                {result}
              </p>
            ) : (
              <p className="text-gray-500 text-lg sm:text-xl font-medium">
                Enter value and select units to convert.
              </p>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 flex flex-col flex-grow max-h-[400px] lg:max-h-[380px] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-700">
                Conversion History
              </h2>
              {/* History Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="keep-history-toggle"
                  checked={keepHistory}
                  onChange={(e) => setKeepHistory(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  title="Toggle saving conversions to history."
                />
                <label
                  htmlFor="keep-history-toggle"
                  className="text-sm font-medium text-gray-600 cursor-pointer"
                  title="Toggle saving conversions to history."
                >
                  Keep History
                </label>
              </div>

              {keepHistory &&
                history.length > 0 && ( // Only show clear button if history is kept and not empty
                  <button
                    onClick={clearHistory}
                    className="text-sm text-blue-500 hover:text-blue-700 font-semibold py-1 px-3 rounded-md hover:bg-blue-50 transition"
                    aria-label="Clear conversion history"
                    title="Clear all entries from your conversion history."
                  >
                    Clear All
                  </button>
                )}
            </div>

            {!keepHistory ? (
              <p className="text-gray-400 text-center py-10">
                History saving is currently disabled.
              </p>
            ) : history.length === 0 ? (
              <p className="text-gray-400 text-center py-10">
                No conversion history yet. Your conversions will appear here.
              </p>
            ) : (
              <ul className="space-y-3">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className="cursor-pointer p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition duration-200 ease-in-out transform hover:scale-[1.01] shadow-sm hover:shadow-md"
                    onClick={() => loadHistoryItem(item)}
                    title={`Load this conversion: ${item.inputValue} ${
                      data?.units?.[item.fromUnit]?.name || item.fromUnit
                    } to ${data?.units?.[item.toUnit]?.name || item.toUnit}`}
                  >
                    <p className="font-semibold text-gray-800 text-md sm:text-lg mb-1">
                      <span className="font-mono text-blue-600">
                        {item.inputValue}
                      </span>{" "}
                      {data?.units?.[item.fromUnit]?.name || item.fromUnit}
                      <span className="mx-2 text-gray-500">→</span>
                      {data?.units?.[item.toUnit]?.name || item.toUnit}
                    </p>
                    <p className="text-gray-700 text-lg sm:text-xl font-medium break-all">
                      {item.result}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.timestamp}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      ---
      {/* About Section */}
      <section className="w-full max-w-7xl mt-8 bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <h2
          className="text-xl sm:text-2xl font-bold text-gray-700 mb-4 flex justify-between items-center cursor-pointer"
          onClick={() => setShowAbout(!showAbout)}
          title="Click to learn more about UnitWise Convert"
        >
          About UnitWise Convert
          <svg
            className={`w-6 h-6 text-gray-600 transition-transform duration-200 ${
              showAbout ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </h2>
        {showAbout && (
          <div className="text-gray-600 leading-relaxed space-y-4 pt-4 border-t border-gray-200 mt-4">
            <p>
              UnitWise Convert is a simple, elegant web application designed to
              help you quickly convert between various units of measurement.
              Whether you're a student, an engineer, or just need to check a
              quick conversion, UnitWise is here to help.
            </p>
            <p>
              We currently support conversions for **Length, Area, Volume,
              Weight, Time**, and **Temperature**. Our goal is to provide an
              intuitive and efficient user experience.
            </p>
            <p className="text-sm text-gray-500 italic">
              **A Quick Word on Temperature:** Our temperature conversions are
              based on common formulas. For anything really important, it's
              always a good idea to double-check the numbers. Just so you know,
              this app uses a basic method for those formulas. If we were
              building this for a large or super-secure system, we'd use a
              special math tool (like `mathjs`) to make sure everything is extra
              safe.
            </p>
          </div>
        )}
      </section>
      <footer className="mt-12 text-center text-gray-500 text-sm opacity-80">
        Built by Devraj Khatiwada
        &nbsp;|&nbsp; Unit Conversion Data from local JSON
      </footer>
    </div>
  );
}

export default UnitConverter;
