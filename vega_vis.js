import vegaEmbed from 'vega-embed';

looker.plugins.visualizations.add({
    id: 'vega_lite_engine',
    label: 'Vega-Lite Automático',
    options: {
        chart_type: {
            type: 'string',
            label: 'Tipo de Gráfico',
            section: 'Configuração',
            default: 'bar',
            values: [
                { 'Barra': 'bar' },
                { 'Linha': 'line' },
                { 'Área': 'area' },
                { 'Dispersão (Scatter)': 'point' }
            ]
        }
    },
    updateAsync: function (data, element, config, queryResponse, details, done) {
        element.innerHTML = '<div id="vis" style="width: 100%; height: 100%;"></div>';

        try {
            // 1. Identifica automaticamente as colunas que o usuário arrastrou no Looker
            const dimensions = queryResponse.fields.dimension_like;
            const measures = queryResponse.fields.measure_like;

            if (dimensions.length === 0 || measures.length === 0) {
                element.innerHTML = '<div style="padding: 20px; color: #333;">Por favor, selecione pelo menos 1 Dimensão e 1 Métrica.</div>';
                done();
                return;
            }

            const dimField = dimensions[0].name;
            const meaField = measures[0].name;

            // 2. Lê o tipo de gráfico escolhido nas opções (padrão: bar)
            const chartMark = config.chart_type || 'bar';

            // 3. Monta a especificação do Vega-Lite de forma 100% dinâmica
            const userSpec = {
                $schema: "https://vega.github.io/schema/vega-lite/v5.json",
                width: "container",
                height: "container",
                data: { values: data },
                mark: chartMark,
                encoding: {
                    x: {
                        field: dimField,
                        type: "nominal",
                        axis: { labelAngle: -30 },
                        title: dimensions[0].label_short || dimensions[0].label
                    },
                    y: {
                        field: meaField,
                        type: "quantitative",
                        title: measures[0].label_short || measures[0].label
                    }
                }
            };

            // 4. Renderiza o gráfico
            vegaEmbed('#vis', userSpec, { actions: false }).then((result) => {
                done();
            }).catch((error) => {
                console.error(error);
                element.innerHTML = `<div style="color: red;">Erro ao renderizar: ${error.message}</div>`;
                done();
            });

        } catch (e) {
            element.innerHTML = `<div style="color: red;">Erro interno: ${e.message}</div>`;
            done();
        }
    }
});