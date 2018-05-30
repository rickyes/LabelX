BIN_MOCHA = ./node_modules/.bin/mocha

install:
	@npm i

dev:
	NODE_ENV=production node app.js