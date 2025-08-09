import { Title } from '../value-objects/title';
import { UserId } from '../value-objects/user-id';
import { looksLikeTaskRecord } from '../guards/type-guards';

export type TaskStatus = 'PENDING' | 'COMPLETED';

type PersistenceTaskRecord = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  ownerId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
  version?: number;
};

export type TaskResponseDto = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  version: number;
};

export class Task {
  private readonly _id: string;
  private _title: Title;
  private _description: string | null;
  private _status: TaskStatus;
  private readonly _ownerId: UserId;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt: Date | null;
  private _version: number;

  private constructor(params: {
    id: string;
    title: Title;
    description: string | null;
    status: TaskStatus;
    ownerId: UserId;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    version?: number;
  }) {
    this._id = params.id;
    this._title = params.title;
    this._description = params.description;
    this._status = params.status;
    this._ownerId = params.ownerId;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
    this._deletedAt = params.deletedAt ?? null;
    this._version = params.version ?? 1;
  }

  get id(): string { return this._id; }
  get title(): string { return this._title.value; }
  get description(): string | null { return this._description; }
  get status(): TaskStatus { return this._status; }
  get ownerId(): string { return this._ownerId.value; }
  get createdAt(): Date { return new Date(this._createdAt); } // devuelve copia
  get updatedAt(): Date { return new Date(this._updatedAt); }
  get deletedAt(): Date | null { return this._deletedAt ? new Date(this._deletedAt) : null; }
  get version(): number { return this._version; }

  static fromPersistence(record: unknown): Task {
    if (!looksLikeTaskRecord(record)) {
      throw new Error('Invalid Task record from persistence');
    }
    const r = record as PersistenceTaskRecord;
    const title = Title.create(r.title);
    const ownerId = UserId.create(r.ownerId);
    const createdAt = r.createdAt instanceof Date ? r.createdAt : new Date(String(r.createdAt));
    const updatedAt = r.updatedAt instanceof Date ? r.updatedAt : new Date(String(r.updatedAt));
    const deletedAt = r.deletedAt ? (r.deletedAt instanceof Date ? r.deletedAt : new Date(String(r.deletedAt))) : null;
    return new Task({
      id: r.id,
      title,
      description: r.description ?? null,
      status: r.status,
      ownerId,
      createdAt,
      updatedAt,
      deletedAt,
      version: r.version ?? 1,
    });
  }

  markAsCompleted(): void {
    if (this._status === 'COMPLETED') return;
    this._status = 'COMPLETED';
    this.touch();
  }

  markAsPending(): void {
    if (this._status === 'PENDING') return;
    this._status = 'PENDING';
    this.touch();
  }

  updateTitle(input: unknown): void {
    const newTitle = Title.create(input);
    if (!newTitle.equals(this._title)) {
      this._title = newTitle;
      this.touch();
    }
  }

  updateDescription(input: unknown): void {
    const newDesc = input === undefined || input === null ? null : String(input);
    if (newDesc !== this._description) {
      this._description = newDesc;
      this.touch();
    }
  }

  delete(): void {
    if (this._deletedAt) return;
    this._deletedAt = new Date();
    this.touch();
  }

  private touch(): void {
    this._updatedAt = new Date();
    this._version += 1;
  }

  toResponseDto(): TaskResponseDto {
    return {
      id: this._id,
      title: this._title.value,
      description: this._description,
      status: this._status,
      ownerId: this._ownerId.value,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      deletedAt: this._deletedAt ? this._deletedAt.toISOString() : null,
      version: this._version,
    };
  }

}