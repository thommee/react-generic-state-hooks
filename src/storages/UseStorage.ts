export interface SetValue<T> {
  (value: T): void;
  (valueFn: (oldValue: T) => T): void;
}

export type UseStorageApi<T> = [value: T, setValue: SetValue<T>];
export type UseStorage = <T>(key: string, initialValue: T) => UseStorageApi<T>;
