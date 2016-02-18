package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"path/filepath"
)

var (
	port  = 8001
	texts = []byte(`{"texts":[]}`)
)

func main() {
	http.HandleFunc("/api/get", routeGet)
	http.HandleFunc("/", routeIndex)

	loadJson()

	listen := fmt.Sprintf(":%d", port)
	if err := http.ListenAndServe(listen, nil); err != nil {
		println("fail", err.Error())
	} else {
		println("listen", listen)
	}
}

func routeIndex(w http.ResponseWriter, r *http.Request) {
	file := r.URL.Path
	if r.URL.Path == "/" {
		file = "index.html"
	}
	path := fmt.Sprintf("static/%s", file)
	http.ServeFile(w, r, path)
}

func routeGet(w http.ResponseWriter, r *http.Request) {
	loadJson()
	w.Header().Add("Content-Type", "application/json; charset=utf-8")
	w.Write(texts)
}

func loadJson() error {
	paths, err := filepath.Glob("data/*.txt")
	if err != nil {
		return err
	}
	buffers := make([]string, 0, len(paths))
	capacity := 0
	for _, path := range paths {
		item, err := ioutil.ReadFile(path)
		if err != nil {
			return err
		}
		capacity += len(item)
		buffers = append(buffers, string(item))
	}

	buf := bytes.NewBuffer(make([]byte, 0, capacity))
	enc := json.NewEncoder(buf)
	root := map[string][]string{
		"texts": buffers,
	}
	enc.Encode(root)
	texts = buf.Bytes()
	return nil
}
