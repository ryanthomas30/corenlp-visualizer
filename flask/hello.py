from flask import Flask, request
from flask_cors import CORS
import json
import uuid
from nltk.tree import *

app = Flask(__name__)
CORS(app)

def tree2dict(tree):
	#name = 'name'
	#children = 'children',
	unique_id = str(uuid.uuid1())
	return {
		'name': tree.label(),
		'id': unique_id,
		'children': [tree2dict(t) if isinstance(t, Tree) else { 'name': t, 'id': str(uuid.uuid1()) } for t in tree]
	}

@app.route('/parse', methods=['POST'])
def hello():
	parseString = request.get_json()[u'parseString']
	print(tree2dict(Tree.fromstring(parseString)))
	return json.dumps(tree2dict(Tree.fromstring(parseString)))

if __name__ == "__main__":
	app.run()