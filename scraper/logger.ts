import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

export const logSuccess = (module: string, count: number) => {
    const message = `[${new Date().toISOString()}] SUCCESS: ${module} scraped ${count} records.\n`;
    fs.appendFileSync(path.join(LOG_DIR, 'success.log'), message);
    console.log(message);
};

export const logError = (module: string, error: any) => {
    const message = `[${new Date().toISOString()}] ERROR: ${module} failed. ${error.message || error}\n`;
    fs.appendFileSync(path.join(LOG_DIR, 'errors.log'), message);
    console.error(message);
};
