run:
	(cd src && go run dev.go)

update:
	git submodule update -i
	cp submodules/marked/marked.min.js src/static/vendors/
	npm install viz.js
	cp node_modules/viz.js/viz.js src/static/vendors
