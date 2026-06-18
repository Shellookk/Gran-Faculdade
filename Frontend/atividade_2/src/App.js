import { useState } from 'react';
import './App.css';
import ProdutosPage from './pages/ProdutosPage';
import FornecedoresPage from './pages/FornecedoresPage';
import AssociacaoPage from './pages/AssociacaoPage';

function App() {
  const [paginaAtiva, setPaginaAtiva] = useState('produtos');

  const paginas = [
    { id: 'produtos', label: 'Produtos' },
    { id: 'fornecedores', label: 'Fornecedores' },
    { id: 'associacoes', label: 'Associações' },
  ];

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">Gran Faculdade</div>
        <ul className="navbar-links">
          {paginas.map(p => (
            <li key={p.id}>
              <button
                className={`nav-btn ${paginaAtiva === p.id ? 'ativo' : ''}`}
                onClick={() => setPaginaAtiva(p.id)}
              >
                {p.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="main-content">
        {paginaAtiva === 'produtos' && <ProdutosPage />}
        {paginaAtiva === 'fornecedores' && <FornecedoresPage />}
        {paginaAtiva === 'associacoes' && <AssociacaoPage />}
      </main>
    </div>
  );
}

export default App;
