
.PHONY: all watch

PROTOCOL_HTMLS := $(patsubst %.md,%.html,$(wildcard protocol*.md))

all: $(PROTOCOL_HTMLS) diagrams

$(PROTOCOL_HTMLS): %.html : %.md style.css pandoc_template.html CHANGELOG.md
	( cat $< | sed -e s/VERSIONTAG/$$(changer current-version)/ ; echo '# Changes' ; echo ''; cat CHANGELOG.md | sed -e s/#/##/g ) | pandoc \
		-s -c style.css \
		--metadata title="SimpleFIN Protocol" \
		--toc --toc-depth=2 \
		-t html5 \
		--highlight-style zenburn \
		--columns=10000 \
		-f markdown+smart \
		--template pandoc_template.html > $@

diagrams: $(patsubst %,img/%.svg, $(basename $(notdir $(wildcard diag/*.seqdiag))))

img/%.svg: diag/%.seqdiag
	seqdiag $^ -o $@ -Tsvg -a

watch:
	watchmedo shell-command \
		--recursive \
		--wait \
		--drop \
		--command='make' \
		.
