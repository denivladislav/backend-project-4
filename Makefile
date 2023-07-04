install:
	npm install

ci:
	npm ci

publish:
	npm publish --dry-run

lint:
	npx eslint .

test:
	NODE_OPTIONS=--experimental-vm-modules npx jest

test-debug:
	DEBUG=nock.* NODE_OPTIONS=--experimental-vm-modules npx jest

test-coverage:
	DEBUG=nock.* NODE_OPTIONS=--experimental-vm-modules npx jest --coverage
