from flask import Flask, request
from flask_cors import CORS
import json
from nltk.tree import *

app = Flask(__name__)
CORS(app)

def tree2dict(tree):
	name = 'name'
	children = 'children'
	return {name: tree.label(), children: [tree2dict(t) if isinstance(t, Tree) else {name: t} for t in tree]}

@app.route('/parse', methods=['POST'])
def hello():
	parseString = request.get_json()[u'parseString']
	print(tree2dict(Tree.fromstring(parseString)))
	return json.dumps(tree2dict(Tree.fromstring(parseString)))

if __name__ == "__main__":
	app.run()