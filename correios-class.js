/* V1.0 */

/*
 *
 *  Classe para Extrair dados de endereço da base dos correios
 *  Javascript
 *
 *  por Renato Igleziaz
 *  em 19/05/2017
 *
 */

function converteResposta(input) {
    // processa a resposta do site e converte em Object

    var tagSearchStart = "respostadestaque"
    var tagSearchEnd   = "</span>"
    var pos            = 1
    var fieldArray     = []
    var searchPosStart = -1
    var searchPosEnd   = -1
    var buffer         = ""
    var bufferStart    = false
    var arrayReturn    = []
    var estadosBingo   = false
    var estados        = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
                          'PB','PR','PE','PI','RN','RS','RJ','RO','RR','SC','SP','SE','TO','EX']

    for (;;) {

        // le posição inicial e final procurando a classe "RespostaDestaque"
        searchPosStart = input.indexOf(tagSearchStart, pos)
        searchPosEnd   = input.indexOf(tagSearchEnd, searchPosStart)

        if (searchPosStart === -1 || searchPosEnd === -1) {
            break
        }
        else {

            // pega tudo que achou do resultado apartir de ">"
            buffer = ""
            bufferStart = false

            for ( var i = searchPosStart; i < searchPosEnd; i++ ) {
                if (bufferStart) {
                    buffer = buffer + input.charAt(i)
                }

                if (input.charAt(i).trim()===">") {
                    bufferStart = true
                }
            }

            // verifica se o retorno carregou a variavel com texto
            if (buffer.trim().length > 0) {

                estadosBingo = false

                // define se a resposta é um endereço ou bairro ou cidade/UF.
                // a cidade/UF deve ser separada, então eu separo pela "/"
                // e verifico se o que ficou do lado direito é um estado
                // da federação
                if (buffer.trim().indexOf("/") > 0) {
                    if (buffer.split("/").length === 2) {
                        for (var x = 0; x < estados.length; x++) {
                            if (buffer.split("/")[1].trim() === estados[x]) {
                                estadosBingo = true
                                break
                            }
                        }
                        if (!estadosBingo) {
                            fieldArray.push(buffer.trim())
                        }
                        else {
                            fieldArray.push(buffer.split("/")[0].trim())
                            fieldArray.push(buffer.split("/")[1].trim())
                        }
                    }
                    else {
                        fieldArray.push(buffer.trim())
                    }
                }
                else {
                    fieldArray.push(buffer.trim())
                }
            }
        }

        // grava a ultima posição atingida no arquivo
        pos = searchPosEnd
    }

    var data

    if (fieldArray.length === 3) {
        // retornou apenas cidade, uf e cep
        data = [
            {"endereco":"",
             "bairro":"",
             "cidade":fieldArray[0],
             "uf":fieldArray[1],
             "cep":fieldArray[2]}
        ]
    }
    else if (fieldArray.length === 5) {
        // retornou endereço, bairro, cidade, uf e cep
        data = [
            {"endereco":fieldArray[0],
             "bairro":fieldArray[1],
             "cidade":fieldArray[2],
             "uf":fieldArray[3],
             "cep":fieldArray[4]}
        ]
    }
    else {
        // endereço não encontrado
        data = [
            {"endereco":"",
             "bairro":"",
             "cidade":"",
             "uf":"",
             "cep":""}
        ]
    }

    return data
}

function consultarCep(cep, callback) {
    // processa um HTTP POST Web Request

    if (cep.length === 0) return false

    var xhr = new XMLHttpRequest()
    var url = "http://m.correios.com.br/movel/buscaCepConfirma.do"
    var data = "&cepEntrada=" + cep + "&tipoCep=&cepTemp=&metodo=buscarCep"

    try {
        // processa o pedido
        xhr.open("POST", url, true)
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        xhr.send(data)
        xhr.onreadystatechange = function() {
            try {
                var datarec = ""
                if (xhr.readyState == xhr.DONE) {
                    // sem erro
                    if (xhr.status == 200) {
                        var vm_response = xhr.responseText
                        datarec = vm_response
                    }
                    // Emite um sinal de retorno
                    var obj = converteResposta(datarec)
                    callback(obj)
                }
            }
            catch (e) {
                // Emite um sinal de retorno com erro grave
                data = [
                    {"endereco":"",
                     "bairro":"",
                     "cidade":"",
                     "uf":"",
                     "cep":""}
                ]
                callback(data)
            }
        }
    }
    catch (e) {
        console.error("ui-correios", e)
    }

    return true
}
