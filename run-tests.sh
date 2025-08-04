#!/bin/sh
set -eux

# Небольшая пауза, чтобы MySQL и Redis успели подняться и стать доступны.
# Можно заменить на health-check loop в продакшн-стиле.
#echo "Waiting briefly for dependencies..."
#sleep 5

echo "Running unit/cache/config-cache and e2e tests..."
# Запускаем нужные тестовые команды. Подстраивай под свои скрипты в package.json
npx jest test/cache/keyv-cache.service.spec.ts --config jest.config.js
npx jest test/config/config-cache.e2e-spec.ts --config test/jest-e2e.json
npm jest --config test/jest-e2e.json --runInBand
