
.PHONY: all


all: index.html protocol.html


index.html: _templates/index.html _templates/navbar.html _templates/base.html
	python _util/render.py index.html > index.html

protocol.html: _templates/protocol.html _templates/navbar.html _templates/base.html
	python _util/render.py protocol.html > protocol.html