'use server';

import { StateManager, FileManager } from 'cracksdb';
import { Word, DB_Word, User, DB_User } from '@/lib/types';
import path from 'node:path';

function createDB() {
  const DB_PATH = process.env.DB_PATH;
  if (!DB_PATH || DB_PATH === '') {
    console.warn('DB_PATH undefined.');
  }
  const dbpath = path.join(DB_PATH || './', 'db');
  console.log('db path: ', dbpath);
  const db = new StateManager(dbpath, new FileManager({}));

  // Initialize the words objects StateFiles
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  for (let l1 of alphabet) {
    try {
      for (let l2 of alphabet) {
        const sf = db.add<Word>(l1 + l2);
        sf.extendUnitType(DB_Word);
      }
    } catch (e) {
      // TODO comment this in production!
      console.warn(Date().split(' ')[4] + ': words statefiles are already initialized!');
      // Assumes if just one StateFile exists then all do as well
      break;
    }
  }

  // Initialize users StateFile
  try {
    const sf = db.add<User>('users');
    sf.extendUnitType(DB_User);
  } catch (e) {
    console.warn(Date().split(' ')[4] + ': users statefile is already initialized!');
  }

  return db;
}

export async function getDB() {
  if (!global.db) {
    global.db = createDB();
  }
  return global.db;
}
