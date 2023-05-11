// TODO: Change to local requests
function updateServerStatus() {
    let servers = document.getElementsByClassName("server");
    let serversList = Array.prototype.slice.call(servers);
    serversList.forEach(server => {
        let online = server.getElementsByClassName("server-online")[0];
        let maxOnline = server.getElementsByClassName("server-max-online")[0];

        let ip = server.getAttribute("data-ip");
        let port = server.getAttribute("data-port");
        fetch(`https://api.mcstatus.io/v2/status/java/${ip}:${port}`)
        .then(res => res.json())
        .then(data => {
            if(data.online){
                console.log(data.players.online);
                console.log(data.players.max);
                online.innerHTML = data.players.online;
                maxOnline.innerHTML = data.players.max;
            }
        })
    });
}
updateServerStatus()
setInterval(() => {
    updateServerStatus()
}, 60000);