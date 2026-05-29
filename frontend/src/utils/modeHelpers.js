/**
 * App mode configuration and helpers
 */

export const appModeConfig = {
  passenger: {
    defaultRoute: "search",
    label: "Passager",
    role: "Etudiant passager",
    roleValue: "passager",
  },
  driver: {
    defaultRoute: "my-trips",
    label: "Driver",
    role: "Etudiant conducteur",
    roleValue: "conducteur",
  },
};

export const routeModeHints = {
  publish: "driver",
  "my-trips": "driver",
  reservation: "passenger",
  search: "passenger",
  "my-reservations": "passenger",
};

export function normalizeMode(mode) {
  return mode === "driver" ? "driver" : "passenger";
}

export function persistMode(mode) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("campusride-mode", normalizeMode(mode));
  }
}

export function readInitialMode(initialRoute) {
  const hintedMode = routeModeHints[initialRoute];

  if (hintedMode) {
    return hintedMode;
  }

  if (typeof window !== "undefined") {
    return normalizeMode(window.localStorage.getItem("campusride-mode"));
  }

  return "passenger";
}

export function applyModeToUser(user, mode) {
  const modeConfig = appModeConfig[normalizeMode(mode)];

  return {
    ...user,
    role: modeConfig.role,
    roleValue: modeConfig.roleValue,
  };
}
