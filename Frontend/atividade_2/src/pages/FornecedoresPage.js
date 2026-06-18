import { useState } from 'react';

const formVazio = { nome: '', cnpj: '', endereco: '', contato: '' };

function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState([]);
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

  function formatarCNPJ(valor) {
    return valor
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  }

  function handleCNPJ(e) {
    setForm({ ...form, cnpj: formatarCNPJ(e.target.value) });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome.trim() || !form.cnpj.trim()) {
      exibirMensagem('Nome e CNPJ são obrigatórios.', 'erro');
      return;
    }
    if (editandoId) {
      setFornecedores(fornecedores.map(f => f.id === editandoId ? { id: editandoId, ...form } : f));
      exibirMensagem('Fornecedor atualizado com sucesso!', 'sucesso');
    } else {
      setFornecedores([...fornecedores, { id: nextId, ...form }]);
      setNextId(nextId + 1);
      exibirMensagem('Fornecedor criado com sucesso!', 'sucesso');
    }
    setForm(formVazio);
    setEditandoId(null);
  }

  function iniciarEdicao(fornecedor) {
    setForm({ nome: fornecedor.nome, cnpj: fornecedor.cnpj, endereco: fornecedor.endereco, contato: fornecedor.contato });
    setEditandoId(fornecedor.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicao() {
    setForm(formVazio);
    setEditandoId(null);
  }

  function deletar(id) {
    if (!window.confirm('Deseja realmente deletar este fornecedor?')) return;
    setFornecedores(fornecedores.filter(f => f.id !== id));
    exibirMensagem('Fornecedor deletado com sucesso!', 'sucesso');
  }

  return (
    <div>
      <div className="card">
        <h2>{editandoId ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>

        {mensagem && (
          <div className={`alerta alerta-${mensagem.tipo === 'erro' ? 'erro' : 'sucesso'}`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Nome *</label>
              <input name="nome" value={form.nome} onChange={handleChange} placeholder="Ex: Distribuidora ABC" />
            </div>
            <div className="form-group">
              <label>CNPJ *</label>
              <input name="cnpj" value={form.cnpj} onChange={handleCNPJ} placeholder="00.000.000/0000-00" />
            </div>
            <div className="form-group">
              <label>Endereço</label>
              <input name="endereco" value={form.endereco} onChange={handleChange} placeholder="Ex: Rua das Flores, 123 - SP" />
            </div>
            <div className="form-group">
              <label>Contato</label>
              <input name="contato" value={form.contato} onChange={handleChange} placeholder="Ex: (11) 99999-0000" />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editandoId ? 'Salvar Alterações' : 'Adicionar Fornecedor'}
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
        <h2>Fornecedores Cadastrados ({fornecedores.length})</h2>
        {fornecedores.length === 0 ? (
          <p className="vazio">Nenhum fornecedor cadastrado ainda.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>CNPJ</th>
                  <th>Endereço</th>
                  <th>Contato</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {fornecedores.map(f => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td><strong>{f.nome}</strong></td>
                    <td>{f.cnpj}</td>
                    <td>{f.endereco || '—'}</td>
                    <td>{f.contato || '—'}</td>
                    <td>
                      <div className="acoes">
                        <button className="btn btn-edit" onClick={() => iniciarEdicao(f)}>Editar</button>
                        <button className="btn btn-danger" onClick={() => deletar(f.id)}>Deletar</button>
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

export default FornecedoresPage;
