import { useCallback, useMemo } from "react";
import { SettingsContext } from "./SettingsContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { CURRENCIES, DEFAULT_SETTINGS } from "../constants/settings";

function isValidSettings(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    CURRENCIES.some((currency) => currency.code === value.currency)
  );
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useLocalStorage(
    STORAGE_KEYS.SETTINGS,
    DEFAULT_SETTINGS,
    isValidSettings
  );

  // updateSettings({ currency: "USD" }) changes only the fields passed in.
  const updateSettings = useCallback(
    (changes) => {
      setSettings((previous) => ({ ...previous, ...changes }));
    },
    [setSettings]
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings }),
    [settings, updateSettings, resetSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
