package main

import (
	"fmt"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	file := r.URL.Path
	if r.URL.Path == "/" {
		file = "index.html"
	}
	path := fmt.Sprintf("static/%s", file)
	http.ServeFile(w, r, path)
}

func main() {
	http.HandleFunc("/", handler)
	port := 8000
	listen := fmt.Sprintf(":%d", port)
	if err := http.ListenAndServe(listen, nil); err != nil {
		println("fail", err.Error())
	} else {
		println("listen", listen)
	}
}
