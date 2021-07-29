/**
 * WebRTC Server to connect to over ws(s?)://<hostname>:<port>
 */
export const SERVER = `ws://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8188`;