
.PHONY: all


protocol.html: protocol.md style.css pandoc_template.html
	cat protocol.md | pandoc \
		-s -S -c style.css \
		--toc --toc-depth=2 \
		-t html5 \
		--highlight-style zenburn \
		--columns=10000 \
		--template pandoc_template.html > $@

