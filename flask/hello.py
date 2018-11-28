from flask import Flask
import json
from nltk.tree import *

app = Flask(__name__)

def tree2dict(tree):
	label = 'label'
	children = 'children'
	return {label: tree.label(), children: [tree2dict(t) if isinstance(t, Tree) else t for t in tree]}

@app.route("/")
def hello():
	a = ['(ROOT\n  (NP\n    (NP (NNP Bob) (NN pet))\n    (NP (DT a) (NN dog))\n    (. .)))']
	print(tree2dict(Tree.fromstring(a[0])))
	return 'Hello World'

if __name__ == "__main__":
	app.run()