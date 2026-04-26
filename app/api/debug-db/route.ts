import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  const { db } = await connectToDatabase();
  const posts = await db.collection("postGenerations").find().sort({ _id: -1 }).limit(3).toArray();
  return NextResponse.json({ posts });
}
