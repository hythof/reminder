package main

import (
	"fmt"
	"os"

	"./commands"
)

func main() {
	args := os.Args
	if len(args) < 2 {
		usage()
		return
	}
	switch args[1] {
	case "httpd":
		commands.Httpd()
	default:
		usage()
	}
}

func usage() {
	fmt.Printf(`Usage:
	%s dev # run httpd server for developer mode
`, "go run main.go")
}
