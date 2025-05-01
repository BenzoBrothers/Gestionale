from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

app = Flask(__name__)
CORS(app)

# Database setup
engine = create_engine('sqlite:///warehouse.db')
Base = declarative_base()

class Product(Base):
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    codice = Column(String(50), nullable=False)
    quantita = Column(Integer, nullable=False)
    categoria = Column(String(50), nullable=False)
    prezzo_unitario = Column(Float, nullable=False)

# Create database tables
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

@app.route('/prodotti', methods=['GET'])
def get_products():
    session = Session()
    products = session.query(Product).all()
    result = [{
        'id': p.id,
        'nome': p.nome,
        'codice': p.codice,
        'quantita': p.quantita,
        'categoria': p.categoria,
        'prezzo_unitario': p.prezzo_unitario
    } for p in products]
    session.close()
    return jsonify(result)

@app.route('/prodotti', methods=['POST'])
def add_product():
    data = request.json
    session = Session()
    new_product = Product(
        nome=data['nome'],
        codice=data['codice'],
        quantita=data['quantita'],
        categoria=data['categoria'],
        prezzo_unitario=data['prezzo_unitario']
    )
    session.add(new_product)
    session.commit()
    result = {
        'id': new_product.id,
        'nome': new_product.nome,
        'codice': new_product.codice,
        'quantita': new_product.quantita,
        'categoria': new_product.categoria,
        'prezzo_unitario': new_product.prezzo_unitario
    }
    session.close()
    return jsonify(result), 201

@app.route('/prodotti/<int:id>', methods=['PUT'])
def update_product(id):
    data = request.json
    session = Session()
    product = session.query(Product).get(id)
    if not product:
        session.close()
        return jsonify({'error': 'Product not found'}), 404
    
    product.nome = data.get('nome', product.nome)
    product.codice = data.get('codice', product.codice)
    product.quantita = data.get('quantita', product.quantita)
    product.categoria = data.get('categoria', product.categoria)
    product.prezzo_unitario = data.get('prezzo_unitario', product.prezzo_unitario)
    
    session.commit()
    result = {
        'id': product.id,
        'nome': product.nome,
        'codice': product.codice,
        'quantita': product.quantita,
        'categoria': product.categoria,
        'prezzo_unitario': product.prezzo_unitario
    }
    session.close()
    return jsonify(result)

@app.route('/prodotti/<int:id>', methods=['DELETE'])
def delete_product(id):
    session = Session()
    product = session.query(Product).get(id)
    if not product:
        session.close()
        return jsonify({'error': 'Product not found'}), 404
    
    session.delete(product)
    session.commit()
    session.close()
    return '', 204

@app.route('/prodotti/search', methods=['GET'])
def search_products():
    nome = request.args.get('nome', '')
    categoria = request.args.get('categoria', '')
    
    session = Session()
    query = session.query(Product)
    
    if nome:
        query = query.filter(Product.nome.ilike(f'%{nome}%'))
    if categoria:
        query = query.filter(Product.categoria.ilike(f'%{categoria}%'))
    
    products = query.all()
    result = [{
        'id': p.id,
        'nome': p.nome,
        'codice': p.codice,
        'quantita': p.quantita,
        'categoria': p.categoria,
        'prezzo_unitario': p.prezzo_unitario
    } for p in products]
    session.close()
    return jsonify(result)

@app.route('/prodotti/codice/<codice>', methods=['GET'])
def get_product_by_code(codice):
    session = Session()
    product = session.query(Product).filter(Product.codice == codice).first()
    
    if not product:
        session.close()
        return jsonify({'error': 'Product not found'}), 404
    
    result = {
        'id': product.id,
        'nome': product.nome,
        'codice': product.codice,
        'quantita': product.quantita,
        'categoria': product.categoria,
        'prezzo_unitario': product.prezzo_unitario
    }
    session.close()
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)