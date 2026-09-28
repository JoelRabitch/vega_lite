import vegaEmbed from 'vega-embed';

looker.plugins.visualizations.add({
    id: 'vega_lite_engine',
    label: 'Vega-Lite Universal Engine',
    options: {
        vega_json: {
            type: 'string',
            label: 'Especificação Vega-Lite (JSON)',
            section: 'Configuração',
            placeholder: 'Cole aqui o trecho JSON do seu gráfico...',
            default: '{"mark": "bar", "encoding": {"x": {"field": "dimensao", "type": "nominal"}, "y": {"field": "metrica", "type": "quantitative"}}}'
        }
    },
    updateAsync: function (data, element, config, queryResponse, details, done) {
        // 1. Limpa o elemento visual anterior
        element.innerHTML = '<div id="vis" style="width: 100%; height: 100%;"></div>';

        try {
            // 2. Lê o JSON customizado que o usuário colou nas opções do Looker
            let userSpec = JSON.parse(config.vega_json || '{}');

            // 3. Injeta os dados que vieram da query do Looker no formato que o Vega-Lite lê
            userSpec.data = { values: data };

            // 4. Renderiza o gráfico usando o vega-embed
            vegaEmbed('#vis', userSpec, { actions: false }).then((result) => {
                // Sucesso na renderização
                done();
            }).catch((error) => {
                console.error(error);
                element.innerHTML = `<div style="color: red;">Erro ao renderizar Vega-Lite: ${error.message}</div>`;
                done();
            });

        } catch (e) {
            element.innerHTML = `<div style="color: red;">Erro no JSON de configuração: ${e.message}</div>`;
            done();
        }
    }
});