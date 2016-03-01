run:
	cd src && go run main.go httpd

update:
	git submodule update -i
	cp submodules/marked/marked.min.js src/static/vendors/
	npm install viz.js
	cp node_modules/viz.js/viz.js src/static/vendors
	go get google.golang.org/grpc
	go get -a github.com/golang/protobuf/protoc-gen-go
