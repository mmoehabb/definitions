import { Word } from '@/lib/types';
import { getDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const word_text = url.pathname.slice(1).toLowerCase().replaceAll("%20", " ");

    const db = await getDB();
    const word_sf = db.get(word_text.slice(0, 2));
    const users_sf = db.get('users');

    const word_index = word_sf.getIndexOf((word: any) => (word as Word).text == word_text)[0];
    const word = word_index !== undefined ? (word_sf.get(word_index) as Word) : {};

    // increase validity if an authenticated user retrieving the word
    (async () => {
      if (!word.text) return;
      const session = await auth();
      if (!session?.user) {
        return;
      }
      let user_index = users_sf.getIndexOf((usr) => usr.email === session.user.email)[0];
      // if the user not found, add him and re-evaluate user_index
      if (user_index === undefined) {
        users_sf.add({ email: session.user.email, views: [{ word: '' }] });
        user_index = users_sf.getIndexOf((usr) => usr.email === session.user.email)[0];
      }
      // otherwise, return; if he has already seen the word
      else {
        const usr = users_sf.get(user_index);
        if (!usr.views) throw Error('something went wrong!', { cause: 500 });
        for (let view of usr.views) {
          if (view.word === word.text) return;
        }
      }
      // increase the V values
      word.V += 1;
      for (let def of word.definitions) def.V += 1;
      for (let exam of word.examples) exam.V += 1;
      for (let ment of word.mentions) ment.V += 1;
      word_sf.update(word_index, (prev) => word);
      // add the word to user views
      users_sf.update(user_index, (prev) => ({ views: [...prev.views, { word: word.text }] }));
    })();

    // reports attribute is removed for user privacy
    return NextResponse.json({ word: { ...word, reports: undefined } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: e.cause });
  }
}
