from jinja2 import Environment, FileSystemLoader


def base64enc(s):
	return s.encode('base64')


def base64dec(s):
	return s.decode('base64')


def render(filename):
	loader = FileSystemLoader('_templates')
	jenv = Environment(loader=loader)
	jenv.filters.update({
		'b64enc': base64enc,
		'b64dec': base64dec,
	})
	template = jenv.get_template(filename)
	return template.render()


if __name__ == '__main__':
	import sys
	print render(sys.argv[1])