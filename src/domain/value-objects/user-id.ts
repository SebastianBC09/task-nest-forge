import { isUuidString } from '../guards/type-guards';

export class UserId {
  private readonly _value: string;
  private constructor(id: string) {
    this._value = id;
    Object.freeze(this);
  }

  static create(input: unknown): UserId {
    if (!isUuidString(input)) throw new Error('UserId must be a valid UUID string.');
    return new UserId(input as string);
  }

  get value(): string { return this._value; }
  equals(other: UserId): boolean { return other && this._value === other._value; }
}