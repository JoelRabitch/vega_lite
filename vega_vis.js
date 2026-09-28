import vegaEmbed from 'vega-embed';

looker.plugins.visualizations.add({
    id: 'vega_lite_engine',
    label: 'Vega-Lite Inteligente (Automático)',
    options: {
        vega_json: {
            type: 'string',
            label: 'Especificação Vega-Lite (JSON)',
            section: 'Configuração',
            placeholder: 'Cole aqui o JSON...',
            default: '{"mark": "circle"}'
        }
    },
    updateAsync: function (data, element, config, queryResponse, details, done) {
        element.innerHTML = '<div id="vis" style="width: 100%; height: 100%;"></div>';

        try {
            let userSpec = JSON.parse(config.vega_json || '{}');

            // 1. Pega automaticamente os nomes das colunas que vieram da query do Looker
            const fields = queryResponse.fields.dimension_like.concat(queryResponse.fields.measure_like);

            if (fields.length >= 2) {
                // Mapeia automaticamente as colunas baseando-se na ordem em que você as arrastou:
                // Coluna 1 = Longitude, Coluna 2 = Latitude, Coluna 3 (se houver) = Métrica/Valor
                const colLon = fields[0] ? fields[0].name : '';
                const colLat = fields[1] ? fields[1].name : '';
                const colVal = fields[2] ? fields[2].name : colLon;

                // Converte o JSON para texto para substituir os curingas de forma universal
                let specString = JSON.stringify(userSpec);
                specString = specString.replace(/__AUTO_LON__/g, colLon);
                specString = specString.replace(/__AUTO_LAT__/g, colLat);
                specString = specString.replace(/__AUTO_VAL__/g, colVal);

                userSpec = JSON.parse(specString);
            }

            // 2. Injeta os dados da query na última camada ou na raiz
            if (userSpec.layer && Array.isArray(userSpec.layer)) {
                let targetLayer = userSpec.layer[userSpec.layer.length - 1];
                targetLayer.data = { values: data };
            } else {
                userSpec.data = { values: data };
            }

            userSpec.width = userSpec.width || "container";
            userSpec.height = userSpec.height || "container";

            // 3. Renderiza o gráfico
            vegaEmbed('#vis', userSpec, { actions: false }).then((result) => {
                done();
            }).catch((error) => {
                console.error(error);
                element.innerHTML = `<div style="color: red; padding: 10px;">Erro ao renderizar: ${error.message}</div>`;
                done();
            });

        } catch (e) {
            element.innerHTML = `<div style="color: red; padding: 10px;">Erro no JSON: ${e.message}</div>`;
            done();
        }
    }
});