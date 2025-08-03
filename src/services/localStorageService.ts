class LocalStorageService {
  setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem<T>(key: string, defaultValue: T | null = null): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}

export const localStorageService = new LocalStorageService();
