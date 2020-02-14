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
    	// Este código foi apenas o primeiro protótipo, alguma coisa eu tinha q enregar ----------
    	client.addMessageReceiver(true, function(message) {
    		if(message.type == 'text/plain'){
    			if(message.content.toLowerCase() == "c#"){
    				var resp = "";
    				octokit.repos.listForOrg({
    					org: "takenet",
    					type: "public"
    				}).then(({ data }) => {
    					let count = 0;
    					data.forEach(function(val,idx){
    						if(val.language == "C#"){
    							if(count++ < 5){
    								resp += "<b>Repo #"+count+"</b> \n Nome:"+val.name+"\n Data de criação: "+val.created_at + "\n Linguagem: "+val.language + "\n";
    							}
    							if(count == 5){
    								var msg = {
    									type: "text/plain",
    									content: resp,
    									to: message.from
    								};
    								client.sendMessage(msg);
    							}
    						}
    					});    
    				});                       
    			} else{
    				var msg = {
    					type: "text/plain",
    					content: "Desculpa, não entendi! Digite \"C#\" para a listagem de repositórios :(",
    					to: message.from
    				};
    				console.log(msg);
    				client.sendMessage(msg);
    			}
    		}
    	});
    	// Final do trecho a se melhorar -----------------------------------------------------
    })
	.catch(function(err) { 
    	// Pega o erro e printa
    	// Catch error
    	console.log(err); 
    });