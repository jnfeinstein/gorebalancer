package main

import (
	"github.com/go-martini/martini"
	"github.com/martini-contrib/render"
	"gorebalancer/config"
	"html/template"
	"runtime"
)

func main() {
	runtime.GOMAXPROCS(runtime.NumCPU())

	m := martini.Classic()

	config.Initialize(m)

	m.Use(render.Renderer(render.Options{
		Funcs: []template.FuncMap{
			{
				"heroku": config.IsHeroku,
			},
		},
		Layout: "app",
	}))

	m.Get("/", func(r render.Render) {
		r.HTML(200, "index", nil)
	})

	m.Run()
}
