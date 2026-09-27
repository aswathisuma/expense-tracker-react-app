import { useEffect, useState } from "react";
import { readFromStorage, writeToStorage } from "../services/storageService";

// Works like useState, but the value is loaded from localStorage on first
// render and saved back to localStorage every time it changes.
export function useLocalStorage(key, initialValue, isValid) {
  const [value, setValue] = useState(() => readFromStorage(key, initialValue, isValid));

  useEffect(() => {
    writeToStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}
