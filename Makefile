REPORTER = tap

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
	--ui tdd

.PHONY: test