run:
	(cd src && go run dev.go)

update:
	git submodule update -i
	cp submodules/marked/marked.min.js src/static/vendors/
