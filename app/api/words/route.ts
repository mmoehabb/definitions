import { Word } from '@/lib/types';
import { getDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(_: Request) {
  try {
    const db = await getDB();
    const allWords: string[] = [];

    for (const substate of db.substates) {
      const stateFile = db.get(substate);
      const words = stateFile.getList(0, stateFile.len()) as Array<Word>;
      allWords.push(...words.map((word) => word.text));
    }

    return NextResponse.json({ words: allWords });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.cause });
  }
}
