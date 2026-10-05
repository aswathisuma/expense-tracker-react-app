// The ONLY file that talks to localStorage directly.
// Used for device preferences (theme, currency). Financial data goes through api.js.

export function readFromStorage(key, fallbackValue, isValid = () => true) {
  try {
    const storedText = window.localStorage.getItem(key);
    if (storedText === null) {
      return fallbackValue; // nothing saved yet (first visit)
    }

    const parsedValue = JSON.parse(storedText); // throws if the text is corrupted
    if (!isValid(parsedValue)) {
      console.warn(`Invalid data in localStorage for "${key}". Using default value.`);
      return fallbackValue;
    }
    return parsedValue;
  } catch (error) {
    console.warn(`Could not read "${key}" from localStorage. Using default value.`, error);
    return fallbackValue;
  }
}

export function writeToStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Happens when storage is full or blocked (e.g. some private browsing modes)
    console.error(`Could not save "${key}" to localStorage.`, error);
  }
}
