
_site: index.html css/simplefin.css
	jekyll

index.html: _templates/index.html
	python render.py index.html > index.html