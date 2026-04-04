async function buscarFinanceiro() {
    const titulo = document.getElementById('titulo').value.trim().toUpperCase();
    const actions = document.getElementById('return-actions');

    if (!titulo) {
        Swal.fire({
            title: 'Título deve ser declarado',
            text: 'Digite: USD, EUR, BTC, IBOVESPA, NASDAQ, DOWJONES, CAC, NIKKEI, IFIX',
            icon: 'warning'
        });
        return;
    }

    try {
        const url = new URL("/finance", "https://api.hgbrasil.com");
        url.searchParams.set("key", "9b6f1e7a");
        url.searchParams.set("format", "json-cors");

        const response = await fetch(url.href);
        const data = await response.json();

        if (!data.valid_key) {
            Swal.fire({
                title: 'Chave de API inválida',
                icon: 'error'
            });
            return;
        }

        const { currencies, stocks, bitcoin } = data.results;

        const moeda = currencies[titulo];
        const bolsa = stocks[titulo];
        const crypto = bitcoin[titulo.toLowerCase()];


        if (moeda) {
            actions.innerHTML = `
                <div class="card">
                    <h2>${moeda.name} (${titulo})</h2>
                    <p>Compra: R$ ${moeda.buy?.toFixed(4)}</p>
                    <p>Venda: R$ ${moeda.sell?.toFixed(4) ?? 'N/A'}</p>
                </div>`;

        } else if (bolsa) {
            actions.innerHTML = `
                <div class="card">
                    <h2>${bolsa.name}</h2>
                    <p>${bolsa.location}</p>
                    <p>Pontos: ${bolsa.points?.toLocaleString('pt-BR')}</p>
                </div>`;

        } else if (crypto) {
            actions.innerHTML = `
                <div class="card">
                    <h2>${crypto.name}</h2>
                    <p>Último: $ ${crypto.last?.toLocaleString('en-US')}</p>
                    <p>Compra: $ ${crypto.buy?.toLocaleString('en-US') ?? 'N/A'}</p>
                    <p>Venda: $ ${crypto.sell?.toLocaleString('en-US') ?? 'N/A'}</p>
                </div>`;

        } else {
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

    } catch (err) {
        console.error("Erro:", err);
        Swal.fire({ title: 'Erro ao buscar', text: err.message, icon: 'error' });
    }
}