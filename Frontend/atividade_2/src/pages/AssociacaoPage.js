import { useState } from 'react';

function AssociacaoPage() {
  const [produtos] = useState([]);
  const [fornecedores] = useState([]);
  const [associacoes, setAssociacoes] = useState([]);
  const [formProdutoId, setFormProdutoId] = useState('');
  const [formFornecedorId, setFormFornecedorId] = useState('');
  const [mensagem, setMensagem] = useState(null);

  const [consultaTipo, setConsultaTipo] = useState('produto');
  const [consultaId, setConsultaId] = useState('');
  const [resultadoConsulta, setResultadoConsulta] = useState(null);

  function exibirMensagem(texto, tipo) {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 3500);
  }

  function associar(e) {
    e.preventDefault();
    if (!formProdutoId || !formFornecedorId) {
      exibirMensagem('Selecione um produto e um fornecedor.', 'erro');
      return;
    }
    exibirMensagem('Associação criada com sucesso!', 'sucesso');
    setFormProdutoId('');
    setFormFornecedorId('');
  }

  function desassociar(produtoId, fornecedorId) {
    if (!window.confirm('Deseja remover esta associação?')) return;
    setAssociacoes(associacoes.filter(a => !(a.produtoId === produtoId && a.fornecedorId === fornecedorId)));
    exibirMensagem('Associação removida com sucesso!', 'sucesso');
    setResultadoConsulta(null);
  }

  function consultar(e) {
    e.preventDefault();
    if (!consultaId) {
      exibirMensagem('Selecione um item para consultar.', 'erro');
      return;
    }
    setResultadoConsulta({ tipo: consultaTipo, id: parseInt(consultaId), itens: [] });
  }

  return (
    <div>
      <div className="card">
        <h2>Associar Produto a Fornecedor</h2>

        {mensagem && (
          <div className={`alerta alerta-${mensagem.tipo === 'erro' ? 'erro' : 'sucesso'}`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={associar}>
          <div className="select-pair">
            <div className="form-group">
              <label>Produto *</label>
              <select value={formProdutoId} onChange={e => setFormProdutoId(e.target.value)}>
                <option value="">Selecione um produto...</option>
                {produtos.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Fornecedor *</label>
              <select value={formFornecedorId} onChange={e => setFormFornecedorId(e.target.value)}>
                <option value="">Selecione um fornecedor...</option>
                {fornecedores.map(f => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Criar Associação</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Todas as Associações ({associacoes.length})</h2>
        {associacoes.length === 0 ? (
          <p className="vazio">Nenhuma associação cadastrada ainda.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Fornecedor</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {associacoes.map((a, i) => (
                  <tr key={i}>
                    <td><strong>{a.produto?.nome}</strong></td>
                    <td>{a.fornecedor?.nome}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => desassociar(a.produto?.id, a.fornecedor?.id)}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Consultar Associações</h2>
        <form onSubmit={consultar}>
          <div className="form-grid">
            <div className="form-group">
              <label>Consultar por</label>
              <select value={consultaTipo} onChange={e => { setConsultaTipo(e.target.value); setConsultaId(''); setResultadoConsulta(null); }}>
                <option value="produto">Produto (ver seus fornecedores)</option>
                <option value="fornecedor">Fornecedor (ver seus produtos)</option>
              </select>
            </div>
            <div className="form-group">
              <label>{consultaTipo === 'produto' ? 'Produto' : 'Fornecedor'}</label>
              <select value={consultaId} onChange={e => setConsultaId(e.target.value)}>
                <option value="">Selecione...</option>
                {(consultaTipo === 'produto' ? produtos : fornecedores).map(item => (
                  <option key={item.id} value={item.id}>{item.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Consultar</button>
          </div>
        </form>

        {resultadoConsulta && (
          <div className="consulta-resultado">
            <h3>
              {resultadoConsulta.tipo === 'produto'
                ? 'Fornecedores de um produto:'
                : 'Produtos de um fornecedor:'}
            </h3>
            {resultadoConsulta.itens.length === 0 ? (
              <p className="vazio">Nenhuma associação encontrada.</p>
            ) : (
              <div className="lista-consulta">
                {resultadoConsulta.itens.map(item => (
                  <div key={item.id} className="item-consulta">
                    <strong>{item.nome}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssociacaoPage;
