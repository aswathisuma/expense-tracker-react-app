function Loader({ message = "Loading…" }) {
  return (
    <div className="loader" role="status">
      <span className="loader__spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export default Loader;
