export class Title {
  private readonly _value: string;
  private static readonly MIN = 1;
  private static readonly MAX = 200;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  static create(input: unknown): Title {
    if (typeof input !== 'string') throw new Error('Title must be a string.');
    const trimmed = input.trim();
    if (trimmed.length < Title.MIN) throw new Error('Title cannot be empty.');
    if (trimmed.length > Title.MAX) throw new Error(`Title max ${Title.MAX} chars.`);
    return new Title(trimmed);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Title): boolean {
    return other && this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}