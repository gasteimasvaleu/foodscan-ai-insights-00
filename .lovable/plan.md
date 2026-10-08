# Corrigir o build de Live Update no Appflow

## Por que está falhando
O arquivo que lista os pacotes do app (package-lock.json) tem 81 pacotes apontando para um endereço de download interno do Lovable, e não para o endereço público oficial (npm). O Appflow não aceita esse endereço interno, então a instalação para no meio.

Como a instalação falhou, o TypeScript também não foi instalado. Por isso aparece o segundo erro ("Could not find installation of TypeScript"). É só consequência do primeiro problema.

## O que vou fazer
1. Trocar, nesse arquivo, todos os endereços internos pelo endereço público oficial (registry.npmjs.org). Os pacotes e as versões continuam exatamente os mesmos.
2. Conferir que não ficou nenhum endereço interno e que o arquivo continua válido.
3. Não mexo em mais nada do app.

## Depois
Você roda o build de Live Update no Appflow de novo. Se no futuro adicionarmos pacotes novos e o erro voltar, é só pedir que eu faço a mesma troca.
