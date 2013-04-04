from jinja2 import Environment, FileSystemLoader


def render(filename):
	loader = FileSystemLoader('_templates')
	jenv = Environment(loader=loader)
	template = jenv.get_template(filename)
	return template.render()


if __name__ == '__main__':
	import sys
	print render(sys.argv[1])