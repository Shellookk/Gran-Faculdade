import { useState, useEffect } from 'react';

const API = 'http://localhost:3001/api/produtos';

const formVazio = { nome: '', descricao: '', preco: '', codigoBarras: '' };

function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const res = await fetch(API);
      const dados = await res.json();
      setProdutos(dados);
    } catch {
      exibirMensagem('Erro ao conectar com o servidor.', 'erro');
    }
  }

  function exibirMensagem(texto, tipo) {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 3500);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome.trim() || !form.preco) {
      exibirMensagem('Nome e preço são obrigatórios.', 'erro');
      return;
    }
    try {
      const url = editandoId ? `${API}/${editandoId}` : API;
      const method = editandoId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, preco: parseFloat(form.preco) }),
      });
      if (!res.ok) {
        const err = await res.json();
        exibirMensagem(err.erro || 'Erro ao salvar produto.', 'erro');
        return;
      }
      exibirMensagem(editandoId ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!', 'sucesso');
      setForm(formVazio);
      setEditandoId(null);
      carregar();
    } catch {
      exibirMensagem('Erro ao conectar com o servidor.', 'erro');
    }
  }

  function iniciarEdicao(produto) {
    setForm({ nome: produto.nome, descricao: produto.descricao, preco: produto.preco, codigoBarras: produto.codigoBarras });
    setEditandoId(produto.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicao() {
    setForm(formVazio);
    setEditandoId(null);
  }

  async function deletar(id) {
    if (!window.confirm('Deseja realmente deletar este produto?')) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        exibirMensagem(err.erro || 'Erro ao deletar.', 'erro');
        return;
      }
      exibirMensagem('Produto deletado com sucesso!', 'sucesso');
      carregar();
    } catch {
      exibirMensagem('Erro ao conectar com o servidor.', 'erro');
    }
  }

  return (
    <div>
      <div className="card">
        <h2>{editandoId ? 'Editar Produto' : 'Novo Produto'}</h2>

        {mensagem && (
          <div className={`alerta alerta-${mensagem.tipo === 'erro' ? 'erro' : 'sucesso'}`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Nome *</label>
              <input name="nome" value={form.nome} onChange={handleChange} placeholder="Ex: Arroz 5kg" />
            </div>
            <div className="form-group">
              <label>Preço (R$) *</label>
              <input name="preco" type="number" step="0.01" min="0" value={form.preco} onChange={handleChange} placeholder="0,00" />
            </div>
            <div className="form-group">
              <label>Código de Barras</label>
              <input name="codigoBarras" value={form.codigoBarras} onChange={handleChange} placeholder="Ex: 7891000315507" />
            </div>
            <div className="form-group full-width">
              <label>Descrição</label>
              <textarea name="descricao" value={form.descricao} onChange={handleChange} placeholder="Descrição do produto..." />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editandoId ? 'Salvar Alterações' : 'Adicionar Produto'}
            </button>
            {editandoId && (
              <button type="button" className="btn btn-secondary" onClick={cancelarEdicao}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Produtos Cadastrados ({produtos.length})</h2>
        {produtos.length === 0 ? (
          <p className="vazio">Nenhum produto cadastrado ainda.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Preço</th>
                  <th>Cód. Barras</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td><strong>{p.nome}</strong></td>
                    <td>{p.descricao || '—'}</td>
                    <td>R$ {parseFloat(p.preco).toFixed(2)}</td>
                    <td>{p.codigoBarras || '—'}</td>
                    <td>
                      <div className="acoes">
                        <button className="btn btn-edit" onClick={() => iniciarEdicao(p)}>Editar</button>
                        <button className="btn btn-danger" onClick={() => deletar(p.id)}>Deletar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProdutosPage;
