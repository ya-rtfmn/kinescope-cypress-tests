import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  viewportWidth: 1280,
  viewportHeight: 800,
  e2e: {
    setupNodeEvents(on, config) { },
    baseUrl: 'https://app.kinescope.io',
    "defaultCommandTimeout": 20000,
    "requestTimeout": 15000,
    "video": false, // Отключает запись видео
    "reporter": "spec",
    "env": {
      ...process.env,
      "CYPRESS_LOG": false // Скрывает логи
    },
  },
});