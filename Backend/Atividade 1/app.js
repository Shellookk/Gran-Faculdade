const express = require('express');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

// Armazenamento em memória
let produtos = [];
let fornecedores = [];
let associacoes = [];
let nextProdutoId = 1;
let nextFornecedorId = 1;

// ========== ROTAS DE PRODUTOS ==========

app.get('/api/produtos', (req, res) => {
    res.json(produtos);
});

app.post('/api/produtos', (req, res) => {
    const { nome, descricao, preco, codigoBarras } = req.body;
    if (!nome || preco === undefined) {
        return res.status(400).json({ erro: 'Nome e preço são obrigatórios' });
    }
    const produto = { id: nextProdutoId++, nome, descricao: descricao || '', preco: parseFloat(preco), codigoBarras: codigoBarras || '' };
    produtos.push(produto);
    res.status(201).json(produto);
});

app.put('/api/produtos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = produtos.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ erro: 'Produto não encontrado' });
    const { nome, descricao, preco, codigoBarras } = req.body;
    produtos[index] = { ...produtos[index], nome, descricao, preco: parseFloat(preco), codigoBarras };
    res.json(produtos[index]);
});

app.delete('/api/produtos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = produtos.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ erro: 'Produto não encontrado' });
    produtos.splice(index, 1);
    associacoes = associacoes.filter(a => a.produtoId !== id);
    res.json({ mensagem: 'Produto deletado com sucesso' });
});

// ========== ROTAS DE FORNECEDORES ==========

app.get('/api/fornecedores', (req, res) => {
    res.json(fornecedores);
});

app.post('/api/fornecedores', (req, res) => {
    const { nome, cnpj, endereco, contato } = req.body;
    if (!nome || !cnpj) {
        return res.status(400).json({ erro: 'Nome e CNPJ são obrigatórios' });
    }
    const fornecedor = { id: nextFornecedorId++, nome, cnpj, endereco: endereco || '', contato: contato || '' };
    fornecedores.push(fornecedor);
    res.status(201).json(fornecedor);
});

app.put('/api/fornecedores/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = fornecedores.findIndex(f => f.id === id);
    if (index === -1) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
    const { nome, cnpj, endereco, contato } = req.body;
    fornecedores[index] = { ...fornecedores[index], nome, cnpj, endereco, contato };
    res.json(fornecedores[index]);
});

app.delete('/api/fornecedores/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = fornecedores.findIndex(f => f.id === id);
    if (index === -1) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
    fornecedores.splice(index, 1);
    associacoes = associacoes.filter(a => a.fornecedorId !== id);
    res.json({ mensagem: 'Fornecedor deletado com sucesso' });
});

// ========== ROTAS DE ASSOCIAÇÕES ==========

app.get('/api/associacoes', (req, res) => {
    const resultado = associacoes.map(a => ({
        produto: produtos.find(p => p.id === a.produtoId),
        fornecedor: fornecedores.find(f => f.id === a.fornecedorId),
    })).filter(a => a.produto && a.fornecedor);
    res.json(resultado);
});

app.post('/api/associacoes', (req, res) => {
    const { produtoId, fornecedorId } = req.body;
    if (!produtoId || !fornecedorId) {
        return res.status(400).json({ erro: 'produtoId e fornecedorId são obrigatórios' });
    }
    const pId = parseInt(produtoId);
    const fId = parseInt(fornecedorId);
    const produto = produtos.find(p => p.id === pId);
    const fornecedor = fornecedores.find(f => f.id === fId);
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
    if (!fornecedor) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
    const jaExiste = associacoes.some(a => a.produtoId === pId && a.fornecedorId === fId);
    if (jaExiste) return res.status(409).json({ erro: 'Associação já existe' });
    associacoes.push({ produtoId: pId, fornecedorId: fId });
    res.status(201).json({ mensagem: 'Associação criada com sucesso', produto, fornecedor });
});

app.delete('/api/associacoes/:produtoId/:fornecedorId', (req, res) => {
    const produtoId = parseInt(req.params.produtoId);
    const fornecedorId = parseInt(req.params.fornecedorId);
    const index = associacoes.findIndex(a => a.produtoId === produtoId && a.fornecedorId === fornecedorId);
    if (index === -1) return res.status(404).json({ erro: 'Associação não encontrada' });
    associacoes.splice(index, 1);
    res.json({ mensagem: 'Associação removida com sucesso' });
});

app.get('/api/associacoes/produto/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const resultado = associacoes
        .filter(a => a.produtoId === id)
        .map(a => fornecedores.find(f => f.id === a.fornecedorId))
        .filter(Boolean);
    res.json(resultado);
});

app.get('/api/associacoes/fornecedor/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const resultado = associacoes
        .filter(a => a.fornecedorId === id)
        .map(a => produtos.find(p => p.id === a.produtoId))
        .filter(Boolean);
    res.json(resultado);
});

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}/`);
});
