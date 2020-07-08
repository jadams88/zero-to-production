import { Connection, Model, Schema, Document } from 'mongoose';
import { defaultSchemaOptions } from '@ztp/server/utils';
import { ITodoNote } from '@ztp/data';
import { todoDbKey, todoNoteDbKey } from './todo';
import { TSchemaDefinition } from '../interface';

export const todoSchemaDefinition: TSchemaDefinition<ITodoNote> = {
  todoId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: todoDbKey,
  },
  body: String,
  createdOn: {
    type: Date,
    default: new Date(),
  },
};

export const todoNoteSchema = new Schema<ITodoNote>(todoSchemaDefinition, {
  ...defaultSchemaOptions,
});

export async function createTodoNoteModel(
  con: Connection
): Promise<ITodoNoteModel> {
  const m = con.model<ITodoNoteDocument, ITodoNoteModel>(
    todoNoteDbKey,
    todoNoteSchema
  );
  m.createCollection();
  return m;
}

export function getTodoNoteModel(con: Connection): ITodoNoteModel {
  return con.model<ITodoNoteDocument, ITodoNoteModel>(todoNoteDbKey);
}

export interface ITodoNoteDocument extends ITodoNote, Document {
  id: string;
}

export interface ITodoNoteModel extends Model<ITodoNoteDocument> {}
