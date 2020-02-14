'use strict'

// Variáveis
// Variables
const BlipSdk = require('blip-sdk');
const WebSocketTransport = require('lime-transport-websocket');
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit();

// "Usuário" e chave de acesso
// Kinda user and acess key
let IDENTIFIER = 'rob1';
let ACCESS_KEY = 'elRUM2tzZzVzN2FaaG9RTnVsc3I=';

// Criando as configurações de conexão
// Create connection configs
let client = new BlipSdk.ClientBuilder()
                        .withIdentifier(IDENTIFIER)
                        .withAccessKey(ACCESS_KEY)
                        .withTransportFactory(() => new WebSocketTransport())
                        .build();

client.connect() // This method returns a 'promise'
    .then(function(session) {
        // Conexão OK!
        // Connected!
        console.log("Connected!");
        let welcome_count = 0;
        client.addMessageReceiver(true, function(message) {
            if(welcome_count < 1 && message.content.state == "composing"){
                welcome_count++;
                client.sendMessage({
                  type: "application/vnd.lime.select+json",
                  to: message.from,
                  content: {
                    scope:"immediate",
                    text: "Olá! Vamos começar?",
                    options: [
                        {
                            text: "Sim"
                        },
                        {
                            text: "Não"
                        }
                    ]
                  }
                });
            } else if (message.type == 'text/plain' && message.content.toLowerCase() == "sim") {
                var rspnse = {
                    type: "application/vnd.lime.collection+json",
                    to: message.from,
                    content: {
                        itemType: "application/vnd.lime.document-select+json",
                        items: []
                    }
                }
                octokit.repos.listForOrg({
                    org: "takenet",
                    type: "public"
                }).then(({ data }) => {
                    let count = 0;
                    data.forEach(function(val,idx){
                        if(val.language == "C#"){
                            if(count++ < 5){
                                rspnse.content.items.push({
                                    header: {
                                        type: "application/vnd.lime.media-link+json",
                                        value: {
                                            title: val.name,
                                            text: val.description == null ? "" : val.description,
                                            type: "image/jpeg",
                                            uri: "https://avatars1.githubusercontent.com/u/4369522?s=200&v=4"
                                        }
                                    }
                                });
                                if(count == 5){
                                    client.sendMessage(rspnse);
                                }
                            }
                        }
                        });
                    });
            } else if (message.content.state == "paused"){
                setTimeout(function(){ 
                    client.sendMessage({
                       type: "text/plain",
                       content: "Esperando sua resposta... rs ;)",
                       to: message.from
                    }); 
                }, 3000);
                setTimeout(function(){
                    client.sendMessage({
                      type: "application/vnd.lime.select+json",
                      to: message.from,
                      content: {
                            scope:"immediate",
                            text: "Deseja listar mais uma vez?",
                            options: [
                            {
                                text: "Sim"
                            },
                            {
                                text: "Não"
                            }
                            ]
                        }
                    });
                }, 6000);
            } else if (message.type == 'text/plain' && message.content.toLowerCase() == "não") {
                let msg = {
                     type: "text/plain",
                     content: "Poxa... Tudo bem ;-;",
                     to: message.from
                };
                client.sendMessage(msg);
            } else if (message.type == 'text/plain') {
                setTimeout(function(){
                    client.sendMessage({
                      type: "application/vnd.lime.select+json",
                      to: message.from,
                      content: {
                            scope:"immediate",
                            text: "Desculpa, não entendi! Deseja listar mais uma vez?",
                            options: [
                            {
                                text: "Sim"
                            },
                            {
                                text: "Não"
                            }
                            ]
                        }
                    });
                }, 3000);
            } 
        });
    })
    .catch(function(err) { 
        // Pega o erro e printa
        // Catch error
        console.log(err); 
    });