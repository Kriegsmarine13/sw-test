## What is here

### Build a project:
`docker-compose up -d --build` to make docker-compose build and run in detached mode

### Example curl query:

``
curl --location 'http://localhost:3000/config?appVersion=13.2.296&platform=android'
``

### Tests:

`jest test/cache/keyv-cache.service.spec.ts --config jest.config.js`

`jest test/config/config-cache.e2e-spec.ts --config test/jest-e2e.json`

`jest --config test/jest-e2e.json --runInBand`

### Confirm cache is writing:
`docker-compose exec redis redis-cli scan 0
`

### Watch logs:
`docker-compose logs -f app`