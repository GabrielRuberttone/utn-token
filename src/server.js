//1 importamos los paquertes 
import express from 'express';
import jwt, { verify } from 'jsonwebtoken'; //si el token lo genero en otra carpeta como deberia hacerlo en la vida real, esto estaria importado ahi Ej: helpers, utils, midlewares..


const PORT = 3020; //2 creamos el puerto en 3020
const server = express(); //3 le asignamos a server los metodos de express

//4 creamos un endpint (no hacemos ni rutas ni controladores para el ejemplo)
server.get("/api", (req, res)=>{
    res.status(200).json({message: "Mensaje inicial para ver si funciona y practicar Jsonn web token"});
})

//simulamos un login por medio de un post
server.post("/api/login", (req, res)=>{
 //t1 si el login va bien, obtenemos de la BD la info del usuario, me dovolveria un objeto con el id, nombre, usuario, etc
 const useData  ={
    id: 'kldasdf09009900',
    name: 'Gabriel',
    emai: 'carhue40tv@gmail.com'
 };
 //t2 si el login sale bien genero el token y se lo paso al usuario. (en la vida real al token lo genero en una carpeta aparte como helpers, o utils, o midlewares)
 jwt.sign(//uso jwt con uno de sus metodos, el primero que debo usar es firmar el token: o sea el metodo sign
  {user: useData}, //primero pasa el payload que va a estar dentro del token
 "secretKey0001234",//segundo tiene la clave secreta que traemos de procces.env.secreKey. La clave permite crear y verificar la validez de un token
  {expiresIn: "120s"},//tercero paso un objeto de configuracion (estaria diciendo que caduque en 30 dias, chequear)

  (err, token)=>{//cuarto, paso un callback con la funcion para atrapar un error si ocurre y si no ocurre, generar un token
  if (err) return err;
    res.json({token}); //si pasa el if con el error, envia el token en la respuesta, el cual va a tener toda la data anterior. 
  }
)
})
//t3 chequeamos si funciona en postman 
//----

//v1 Creamos un endponit al que le agregamos un middleware -verifytoken-  que va a verificar si el token es valido
server.post("/api/posts", verifytoken, (req, res)=>{ //entra a la rutal: "/api/post", luego pasa a verificar el token:verifytoken, si es valido me deja pasar al siguiente controlador. 
  //v4 si llego la req.token ahora aca chequeo si el token es mio y si no esta vencido:
  //con el metodo verify verifico el token, necesito 2 parametros: 1 el token (req.token) 2 la clave secreta ("secretKey0001234"). Luego un callback que va a hacer el trabajo.
 jwt.verify(req.token, "secretKey0001234", (error, authData)=>{ //el callback le paso un error, y authData(datos de autorizacion) si no hubo un error estoy autorizado.
     if(error) {
      res.status(400).json({message:"Forbidden access - Invalid token"});
     } else { //si paso el if, tuvo permiso para crear el posteo
      res.json({message:"Post created!", autor: authData});
   }
   });
});

//v2 middleware para verificar la validez del token que trae la request
//el token puede venir de varias maneras, una de ellas en con el protocolo Bearer, el cual tiene esta sintaxis: la palabra "bearer token" (palabra "bearer" espacio token)
function verifytoken (req, res, next ){//tiene que incluir next porque si el token es correcto deja pasar a la siguiente instruccion
const bearerHeader = req.headers["authorization"]; //v3 creo una variable llamada bearerHeader (encabezado del portador). A la peticion tengo que extraerle el token que viene con el protocolo Bearer (bearer token). Lo extraigo asi: req.headers['authorization']
  if(typeof bearerHeader === "undefined"){ //si bearerHeader en undefined, o sea no hay token
    res.status(403).json({message:"Forbidden access - NO TOKEN PROVIDED!"})
  } else {//si hay un token y pasa el if, ahora hay que ver si el token es correcto
    const bearerToken = bearerHeader.split(" ").pop();//tenemos que extraer la ultima palabra del protocolo Bearer y quedarnos con el token, hay muchas formas...partimos bearerHeader en dos y se genero un array: [0]="bearer", [1]=token
    req.token = bearerToken; //en req.token ingreso lo que esta en bearerToken
    next();//le doy pasar, en este caso al controlador server.post("/api/post", verifytoken, (req, res)=>{...
  }
}

//----
//5 escuchamos el servidor
server.listen(PORT, (error)=> {
    error? console.log(error) : console.log(`http://localhost:${PORT} - Funcionando OK`);
}) 
//6 ahora tenemos que crear el script para poder correrlo "dev":"nodemon src/server"
//7 instalamos nodemon: npm i nodemon -D