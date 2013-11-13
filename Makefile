REPORTER = spec
HTML_FILE = test/coverage.html
GLOBALS = 

test: test-mocha

build-md: 
	./node_modules/.bin/md2html <readme.md >readme.html

test-mocha:
	@NODE_ENV=test \
	./node_modules/.bin/mocha --reporter $(REPORTER) $(GLOBALS)

test-coverage: lib-coverage
	@LIB=lib-cov $(MAKE) test-mocha REPORTER=html-cov > $(HTML_FILE)

lib-coverage:
	 @NODE_ENV=test \
	./node_modules/.bin/jscoverage lib lib-cov

clean:
	rm -f coverage.html
	rm -rf lib-cov