import { useState } from 'react';

const formVazio = { nome: '', descricao: '', preco: '', codigoBarras: '' };

function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState(null);
  const [nextId, setNextId] = useState(1);

  function exibirMensagem(texto, tipo) {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 3500);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome.trim() || !form.preco) {
      exibirMensagem('Nome e preço são obrigatórios.', 'erro');
      return;
    }
    if (editandoId) {
      setProdutos(produtos.map(p => p.id === editandoId ? { id: editandoId, ...form, preco: parseFloat(form.preco) } : p));
      exibirMensagem('Produto atualizado com sucesso!', 'sucesso');
    } else {
      setProdutos([...produtos, { id: nextId, ...form, preco: parseFloat(form.preco) }]);
      setNextId(nextId + 1);
      exibirMensagem('Produto criado com sucesso!', 'sucesso');
    }
    setForm(formVazio);
    setEditandoId(null);
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

  function deletar(id) {
    if (!window.confirm('Deseja realmente deletar este produto?')) return;
    setProdutos(produtos.filter(p => p.id !== id));
    exibirMensagem('Produto deletado com sucesso!', 'sucesso');
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
