import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001/api';

function AssociacaoPage() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [associacoes, setAssociacoes] = useState([]);
  const [formProdutoId, setFormProdutoId] = useState('');
  const [formFornecedorId, setFormFornecedorId] = useState('');
  const [mensagem, setMensagem] = useState(null);

  // Campos de consulta
  const [consultaTipo, setConsultaTipo] = useState('produto');
  const [consultaId, setConsultaId] = useState('');
  const [resultadoConsulta, setResultadoConsulta] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [resProd, resForn, resAssoc] = await Promise.all([
        fetch(`${API_BASE}/produtos`),
        fetch(`${API_BASE}/fornecedores`),
        fetch(`${API_BASE}/associacoes`),
      ]);
      setProdutos(await resProd.json());
      setFornecedores(await resForn.json());
      setAssociacoes(await resAssoc.json());
    } catch {
      exibirMensagem('Erro ao conectar com o servidor.', 'erro');
    }
  }

  function exibirMensagem(texto, tipo) {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 3500);
  }

  async function associar(e) {
    e.preventDefault();
    if (!formProdutoId || !formFornecedorId) {
      exibirMensagem('Selecione um produto e um fornecedor.', 'erro');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/associacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtoId: parseInt(formProdutoId), fornecedorId: parseInt(formFornecedorId) }),
      });
      const dados = await res.json();
      if (!res.ok) {
        exibirMensagem(dados.erro || 'Erro ao criar associação.', 'erro');
        return;
      }
      exibirMensagem('Associação criada com sucesso!', 'sucesso');
      setFormProdutoId('');
      setFormFornecedorId('');
      carregarDados();
    } catch {
      exibirMensagem('Erro ao conectar com o servidor.', 'erro');
    }
  }

  async function desassociar(produtoId, fornecedorId) {
    if (!window.confirm('Deseja remover esta associação?')) return;
    try {
      const res = await fetch(`${API_BASE}/associacoes/${produtoId}/${fornecedorId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        exibirMensagem(err.erro || 'Erro ao remover associação.', 'erro');
        return;
      }
      exibirMensagem('Associação removida com sucesso!', 'sucesso');
      carregarDados();
      setResultadoConsulta(null);
    } catch {
      exibirMensagem('Erro ao conectar com o servidor.', 'erro');
    }
  }

  async function consultar(e) {
    e.preventDefault();
    if (!consultaId) {
      exibirMensagem('Selecione um item para consultar.', 'erro');
      return;
    }
    try {
      const url = consultaTipo === 'produto'
        ? `${API_BASE}/associacoes/produto/${consultaId}`
        : `${API_BASE}/associacoes/fornecedor/${consultaId}`;
      const res = await fetch(url);
      const dados = await res.json();
      setResultadoConsulta({ tipo: consultaTipo, id: parseInt(consultaId), itens: dados });
    } catch {
      exibirMensagem('Erro ao consultar.', 'erro');
    }
  }

  const nomeProduto = (id) => produtos.find(p => p.id === id)?.nome || `#${id}`;
  const nomeFornecedor = (id) => fornecedores.find(f => f.id === id)?.nome || `#${id}`;

  return (
    <div>
      {/* Formulário de associação */}
      <div className="card">
        <h2>Associar Produto a Fornecedor</h2>

        {mensagem && (
          <div className={`alerta alerta-${mensagem.tipo === 'erro' ? 'erro' : 'sucesso'}`}>
            {mensagem.texto}
          </div>
        )}

        {produtos.length === 0 || fornecedores.length === 0 ? (
          <p className="vazio">
            Cadastre ao menos um produto e um fornecedor antes de criar associações.
          </p>
        ) : (
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
        )}
      </div>

      {/* Lista de todas as associações */}
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

      {/* Consulta */}
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
                ? `Fornecedores de "${nomeProduto(resultadoConsulta.id)}":`
                : `Produtos de "${nomeFornecedor(resultadoConsulta.id)}":`}
            </h3>
            {resultadoConsulta.itens.length === 0 ? (
              <p className="vazio">Nenhuma associação encontrada.</p>
            ) : (
              <div className="lista-consulta">
                {resultadoConsulta.itens.map(item => (
                  <div key={item.id} className="item-consulta">
                    <strong>{item.nome}</strong>
                    {resultadoConsulta.tipo === 'produto' && item.cnpj && (
                      <span style={{ color: '#666', marginLeft: 12 }}>CNPJ: {item.cnpj}</span>
                    )}
                    {resultadoConsulta.tipo === 'fornecedor' && item.preco !== undefined && (
                      <span style={{ color: '#666', marginLeft: 12 }}>R$ {parseFloat(item.preco).toFixed(2)}</span>
                    )}
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
