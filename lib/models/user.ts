import { connectToDatabase } from "../mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export interface UserDocument {
  _id?: ObjectId;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // hashed
  createdAt: Date;
}

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

const COLLECTION = "users";

async function getCollection() {
  const { db } = await connectToDatabase();
  return db.collection<UserDocument>(COLLECTION);
}

export async function createUser(data: {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}): Promise<SafeUser> {
  const col = await getCollection();

  // Check for existing username or email
  const existing = await col.findOne({
    $or: [{ username: data.username }, { email: data.email }],
  });

  if (existing) {
    if (existing.username === data.username) {
      throw new Error("Username already taken");
    }
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const doc: UserDocument = {
    username: data.username,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    password: hashedPassword,
    createdAt: new Date(),
  };

  const result = await col.insertOne(doc);

  return {
    id: result.insertedId.toString(),
    username: doc.username,
    email: doc.email,
    firstName: doc.firstName,
    lastName: doc.lastName,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function verifyUser(
  username: string,
  password: string
): Promise<SafeUser> {
  const col = await getCollection();

  const user = await col.findOne({ username });
  if (!user) {
    throw new Error("Invalid username or password");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Invalid username or password");
  }

  return {
    id: user._id!.toString(),
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getUserById(id: string): Promise<SafeUser | null> {
  const col = await getCollection();

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return null;
  }

  const user = await col.findOne({ _id: objectId });
  if (!user) return null;

  return {
    id: user._id!.toString(),
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt.toISOString(),
  };
}
