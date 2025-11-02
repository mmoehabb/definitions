import path from 'node:path';
import AdmZip from 'adm-zip';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const headers = new Headers();
    headers.append('Content-Disposition', 'attachment; filename=archive.zip');
    headers.append('Content-Type', 'application/zip');

    const DB_PATH = process.env.DB_PATH;
    if (!DB_PATH || DB_PATH === '') {
      console.warn('DB_PATH undefined.');
    }
    const dbpath = path.join(DB_PATH || './', 'db');

    const zip = new AdmZip();
    zip.addLocalFolder(dbpath);

    const zipBuffer = zip.toBuffer();

    return new Response(zipBuffer, {
      headers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.cause });
  }
}
