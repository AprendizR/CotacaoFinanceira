/**
 * Busca os dados api da API HG Brasil e exibe na tela.
 * @returns {void}
 */
async function buscarFinanceiro() {
    const titulo = document.getElementById('titulo').value.trim().toUpperCase();
    const actions = document.getElementById('return-actions');

    // Validação se o campo está vazio
    if (!titulo) {
        Swal.fire({
            title: 'Campo obrigatório',
            text: 'Digite uma sigla. Ex: USD, EUR, IBOVESPA, blockchain_info',
            icon: 'warning'
        });
        return;
    }

    try {
        const url = new URL('/finance', 'https://api.hgbrasil.com');
        url.searchParams.set('key', 'fce6a8a1');
        url.searchParams.set('format', 'json-cors');

        const response = await fetch(url.href);
        const data = await response.json();

        if (!data.valid_key) {
            Swal.fire({ title: 'Chave de API inválida', icon: 'error' });
            return;
        }

        const { currencies, stocks } = data.results;

        const moeda  = currencies[titulo];
        const bolsa  = stocks[titulo];

        if (moeda) {
            exibirMoeda(titulo, moeda);
            salvarHistorico(titulo, 
                moeda.name, 'Moeda', 
                `R$ ${moeda.buy?.toFixed(2)}`, 
                `${moeda.variation}%`);

        } else if (bolsa) {
            exibirBolsa(titulo, bolsa);
            salvarHistorico(titulo,
                bolsa.name, 'Bolsa', 
                bolsa.points?.toLocaleString('pt-BR'), 
                `${bolsa.variation}%`);

        } else {
            actions.innerHTML = '';
            Swal.fire({
                title: 'Não encontrado',
                html: `"<b>${titulo}</b>" não está disponível.<br><br>
                       <b>Moedas:</b> USD, EUR, GBP, BTC, ARS, CAD, AUD, JPY, CNY<br>
                       <b>Bolsas:</b> IBOVESPA, IFIX, NASDAQ, DOWJONES, CAC, NIKKEI<br>
                       <b>Crypto:</b> blockchain_info, bitstamp, foxbit, mercadobitcoin`,
                icon: 'info'
            });
            return;
        }

        renderTabela();

    } catch (err) {
        console.error('Erro:', err);
        Swal.fire({ title: 'Erro ao buscar', text: err.message, icon: 'error' });
    }
}

/**
 * Exibe o card de uma moeda na tela.
 * @param {string} titulo - Sigla da moeda (ex: "USD").
 * @param {Object} moeda  - Dados da moeda retornados pela API.
 * @returns {void}
 */
function exibirMoeda(titulo, moeda) {
    document.getElementById('return-actions').innerHTML = `
        <div class="card">
            <h2>💵 ${moeda.name} (${titulo})</h2>
            <p><b>Compra:</b> R$ ${moeda.buy?.toFixed(2) ?? 'N/A'}</p>
            <p><b>Venda:</b> R$ ${moeda.sell?.toFixed(2) ?? 'N/A'}</p>
            <p><b>Variação:</b> ${moeda.variation}%</p>
            <p><b>Moeda base:</b> BRL</p>
        </div>`;
}

/**
 * Exibe o card de um índice de bolsa na tela.
 * @param {string} titulo - Sigla da bolsa (ex: "IBOVESPA").
 * @param {Object} bolsa  - Dados da bolsa retornados pela API.
 * @returns {void}
 */
function exibirBolsa(titulo, bolsa) {
    document.getElementById('return-actions').innerHTML = `
        <div class="card">
            <h2>📊 ${bolsa.name} (${titulo})</h2>
            <p><b>Localização:</b> ${bolsa.location}</p>
            <p><b>Pontos:</b> ${bolsa.points?.toLocaleString('pt-BR') ?? 'N/A'}</p>
            <p><b>Variação:</b> ${bolsa.variation}%</p>
        </div>`;
}

/**
 * Salva uma consulta no localStorage.
 * @param {string} titulo   - Sigla buscada.
 * @param {string} nome     - Nome completo do ativo.
 * @param {string} tipo     - Tipo: Moeda, Bolsa ou Crypto.
 * @param {string} valor    - Valor principal formatado.
 * @param {string} variacao - Variação percentual.
 * @returns {void}
 */
function salvarHistorico(titulo, nome, tipo, valor, variacao) {
    const historico = JSON.parse(localStorage.getItem('historico')) || [];

    historico.unshift({
        titulo,
        nome,
        tipo,
        valor,
        variacao,
        data: new Date().toLocaleString('pt-BR')
    });

    localStorage.setItem('historico', JSON.stringify(historico));
}

/**
 * Renderiza a tabela de histórico com os dados salvos no localStorage.
 * @returns {void}
 */
function renderTabela() {
    const historico = JSON.parse(localStorage.getItem('historico')) || [];
    const tbody = document.getElementById('tbody-historico');
    const linhaVazia = document.getElementById('linha-vazia');

    // Remove linhas antigas (menos a linha vazia)
    tbody.querySelectorAll('tr:not(#linha-vazia)').forEach(tr => tr.remove());

    if (historico.length === 0) {
        linhaVazia.style.display = '';
        return;
    }

    linhaVazia.style.display = 'none';

    historico.forEach(function(item, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.titulo}</td>
            <td>${item.nome}</td>
            <td>${item.tipo}</td>
            <td>${item.valor}</td>
            <td>${item.variacao}</td>
            <td>${item.data}</td>
            <td><button class="btn-excluir" onclick="excluirItem(${index})">Remover</button></td>`;
        tbody.appendChild(tr);
    });
}

/**
 * Remove um item do histórico pelo índice.
 * @param {number} index - Índice do item a remover.
 * @returns {void}
 */
function excluirItem(index) {
    const historico = JSON.parse(localStorage.getItem('historico')) || [];
    historico.splice(index, 1);
    localStorage.setItem('historico', JSON.stringify(historico));
    renderTabela();
}

/**
 * Limpa todo o histórico de consultas.
 * @returns {void}
 */
function limparHistorico() {
    Swal.fire({
        title: 'Limpar histórico?',
        text: 'Todos os registros serão removidos.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, limpar',
        cancelButtonText: 'Cancelar'
    }).then(function(result) {
        if (result.isConfirmed) {
            localStorage.removeItem('historico');
            renderTabela();
        }
    });
}

// Inicializa a tabela ao carregar a página
renderTabela();