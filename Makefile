
.PHONY: all


all: index.html protocol.html examples.html examples examples/fakeaccountant.html examples/fakebank.html

index.html: _templates/index.html _templates/navbar.html _templates/base.html
	python _util/render.py index.html > index.html

protocol.html: _templates/protocol.html _templates/navbar.html _templates/base.html
	python _util/render.py protocol.html > protocol.html

examples.html: _templates/examples.html _templates/navbar.html _templates/base.html
	python _util/render.py examples.html > examples.html

examples:
	mkdir examples

examples/fakeaccountant.html: examples _templates/examples/fakeaccountant.html
	cp _templates/examples/fakeaccountant.html examples/fakeaccountant.html

examples/fakebank.html: examples _templates/examples/fakebank.html
	cp _templates/examples/fakebank.html examples/fakebank.html