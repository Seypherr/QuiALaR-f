const STORAGE_KEY = "enigma-player-session";

export function savePlayerSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getPlayerSession() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearPlayerSession() {
  localStorage.removeItem(STORAGE_KEY);
}
