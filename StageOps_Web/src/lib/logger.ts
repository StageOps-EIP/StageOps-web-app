type LogLevel = 'info' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  action: string;
  data: Record<string, unknown>;
}

const STORAGE_KEY = 'stageops-audit-log';
const MAX_ENTRIES = 300;

function readLogs(): LogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as LogEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLogs(entries: LogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    // Ignore storage errors; logging must never break the app flow.
  }
}

function log(level: LogLevel, action: string, data: Record<string, unknown>): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    action,
    data,
  };

  const logs = readLogs();
  logs.push(entry);
  writeLogs(logs);

  if (level === 'error') {
    console.error(action, data);
  }
}

export const logger = {
  info: (action: string, data: Record<string, unknown> = {}) => log('info', action, data),
  error: (action: string, data: Record<string, unknown> = {}) => log('error', action, data),
};
