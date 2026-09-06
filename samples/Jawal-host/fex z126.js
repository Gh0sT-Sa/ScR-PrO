navigator.n.userAgentData=null;
for(var k in navigator){
    if(typeof navigator[k]!= "function" && k!="n"){
    try{navigator.n[k]=JSON.parse(JSON.stringify(navigator[k]))}catch(er){}
    }
    }