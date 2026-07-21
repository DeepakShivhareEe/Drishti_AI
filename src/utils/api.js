import { auth } from "../firebase";

export async function fetchWithAuth(url, options = {}) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : "";
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  return fetch(url, { ...options, headers });
}

export async function createEventSourceWithAuth(url) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : "";
  const separator = url.includes("?") ? "&" : "?";
  return new EventSource(`${url}${separator}token=${token}`);
}
