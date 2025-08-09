type Raw = Record<string, unknown>;

export type UserResponseDto = {
  id: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
};

export class User {
  private readonly _id: string;
  private readonly _name: string | null;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  private constructor(args: { id: string; name?: string | null; createdAt: Date; updatedAt: Date }) {
    this._id = args.id;
    this._name = args.name ?? null;
    this._createdAt = args.createdAt;
    this._updatedAt = args.updatedAt;
    Object.freeze(this);
  }

  get id(): string { return this._id; }
  get name(): string | null { return this._name; }
  get createdAt(): Date { return new Date(this._createdAt); }
  get updatedAt(): Date { return new Date(this._updatedAt); }

  static fromPersistence(record: unknown): User {
    if (!record || typeof record !== 'object') throw new Error('Invalid user record');
    const r = record as Raw;
    const id = r.id == null ? null : String(r.id);
    if (!id) throw new Error('User record missing id');
    const name = r.name == null ? null : String(r.name);
    const createdAt = r.createdAt instanceof Date ? r.createdAt : new Date(String(r.createdAt));
    const updatedAt = r.updatedAt instanceof Date ? r.updatedAt : new Date(String(r.updatedAt));
    return new User({ id, name, createdAt, updatedAt });
  }

  toResponseDto(): UserResponseDto {
    return {
      id: this._id,
      name: this._name,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}