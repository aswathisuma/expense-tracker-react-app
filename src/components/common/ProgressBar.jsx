// status: "ok" | "warning" | "exceeded" (controls the colour)
function ProgressBar({ percent, status = "ok", label }) {
  const fillWidth = Math.min(Math.max(percent, 0), 100);

  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(fillWidth)}
      aria-valuetext={`${Math.round(percent)}% used`}
    >
      <div className={`progress__fill progress__fill--${status}`} style={{ width: `${fillWidth}%` }} />
    </div>
  );
}

export default ProgressBar;
