import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(rootDirectory, '.env') });
const port = Number(process.env.PORT || 5000);
connectDatabase()
  .then(() => createApp().listen(port, () => console.log(`AI Mystery Room API listening on ${port}`)))
  .catch((error: Error) => { console.error(`Database startup failed: ${error.message}`); process.exit(1); });
