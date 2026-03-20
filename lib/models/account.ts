import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../mongodb';

export interface AccountDocument {
  _id?: ObjectId;
  userId: string;
  name: string;
  avatarInitials: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLORS = [
  '#0052FF', '#FF4B4B', '#00C853', '#FF9100', '#6200EA', 
  '#00B8D4', '#C51162', '#FFD600', '#304FFE', '#00BFA5'
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'A';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

async function getCollection() {
  const { db } = await connectToDatabase();
  return db.collection<AccountDocument>('accounts');
}

export async function createAccount(userId: string, name: string): Promise<AccountDocument> {
  const collection = await getCollection();
  
  const newAccount: AccountDocument = {
    userId,
    name,
    avatarInitials: getInitials(name),
    color: getRandomColor(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await collection.insertOne(newAccount);
  return { ...newAccount, _id: result.insertedId };
}

export async function getAccountsByUserId(userId: string): Promise<AccountDocument[]> {
  const collection = await getCollection();
  return collection.find({ userId }).sort({ createdAt: 1 }).toArray();
}

export async function getAccountById(id: string): Promise<AccountDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection();
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function updateAccount(id: string, userId: string, patch: Partial<Pick<AccountDocument, 'name'>>): Promise<AccountDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection();
  
  const updateData: any = { updatedAt: new Date() };
  if (patch.name) {
    updateData.name = patch.name;
    updateData.avatarInitials = getInitials(patch.name);
  }
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id), userId },
    { $set: updateData },
    { returnDocument: 'after' }
  );
  
  return result;
}

export async function deleteAccount(id: string, userId: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection();
  
  const result = await collection.deleteOne({ _id: new ObjectId(id), userId });
  return result.deletedCount === 1;
}
