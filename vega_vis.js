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
        element.innerHTML = '<div id="vis" style="width: 100%; height: 100%;"></div>';

        try {
            let userSpec = JSON.parse(config.vega_json || '{}');

            // Se o gráfico tiver camadas (Layers), injeta os dados do Looker na última camada (dados principais)
            if (userSpec.layer && Array.isArray(userSpec.layer)) {
                let targetLayer = userSpec.layer[userSpec.layer.length - 1];
                targetLayer.data = { values: data };
            } else {
                // Gráfico simples de uma camada só
                userSpec.data = { values: data };
            }

            vegaEmbed('#vis', userSpec, { actions: false }).then((result) => {
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