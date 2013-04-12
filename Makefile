

_site: index.html protocol.html css/print.css css/simplefin.css _layouts/default.html
	jekyll

index.html: _templates/index.html _templates/navbar.html
	python render.py index.html > index.html

protocol.html: _templates/protocol.html _templates/navbar.html
	python render.py protocol.html > protocol.html