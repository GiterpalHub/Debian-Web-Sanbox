import { useState, useEffect, useRef } from "react";

const mainOptions = [
  "Guided partitioning",
  "Manual partitioning",
  "IDE1 master (hda) - 12.0 GB Virtual HD",
  "Finish partitioning and write changes to disk",
];

function PartitionMenu({ onComplete, onError }) {
  const [view, setView] = useState("main");
  const [selected, setSelected] = useState(mainOptions[0]);
  const [partitionSize, setPartitionSize] = useState("8");
  const [isPartitioned, setIsPartitioned] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (view === "main" && listRef.current) {
      listRef.current.focus();
    } else if (view === "guidedSize" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [view]);

  const handleMainKeyDown = (e) => {
    e.preventDefault();
    const currentIndex = mainOptions.indexOf(selected);

    if (e.key === "ArrowUp") {
      if (currentIndex > 0) setSelected(mainOptions[currentIndex - 1]);
    } else if (e.key === "ArrowDown") {
      if (currentIndex < mainOptions.length - 1)
        setSelected(mainOptions[currentIndex + 1]);
    } else if (e.key === "Enter") {
      handleSelect(selected);
    }
  };

  const handleSelect = (option) => {
    switch (option) {
      case "Guided partitioning":
        setView("guidedSize");
        onError("");
        break;
      case "Manual partitioning":
        onError("Manual partitioning is not available in this simulation.");
        break;
      case "Finish partitioning and write changes to disk":
        if (isPartitioned) {
          onComplete(partitionSize);
        } else {
          onError(
            "No partition scheme has been created. Use 'Guided partitioning'."
          );
        }
        break;
      default:
        onError("");
        break;
    }
  };

  const handleSizeSubmit = (e) => {
    e.preventDefault();
    const size = parseFloat(partitionSize);
    if (isNaN(size) || size < 4 || size > 12) {
      onError("Please enter a size between 4 and 12 GB.");
    } else {
      setIsPartitioned(true);
      setView("main");
      setSelected(mainOptions[3]);
      onError("");
    }
  };

  if (view === "guidedSize") {
    return (
      <form onSubmit={handleSizeSubmit} className="input-area">
        <label>
          Enter root partition size (4-12 GB) for Guided partitioning:
        </label>
        <input
          ref={inputRef}
          type="text"
          value={partitionSize}
          onChange={(e) => setPartitionSize(e.target.value)}
        />
        <div
          className="button-bar"
          style={{ textAlign: "left", paddingLeft: 0, paddingTop: "1rem" }}
        >
          <button type="submit" autoFocus>
            &lt;Continue&gt;
          </button>
          <button
            type="button"
            onClick={() => {
              setView("main");
              onError("");
            }}
          >
            &lt;Go Back&gt;
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      ref={listRef}
      className="option-list"
      tabIndex="0"
      onKeyDown={handleMainKeyDown}
    >
      {mainOptions.map((option) => (
        <div
          key={option}
          className={`option-item ${option === selected ? "selected" : ""}`}
          onClick={() => setSelected(option)}
          onDoubleClick={() => handleSelect(option)}
        >
          {option}
        </div>
      ))}
    </div>
  );
}

export default PartitionMenu;
