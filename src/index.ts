import express, { Request, Response, NextFunction } from "express";
import { config } from "./config.js";
import {
 BadRequestError,
 UnauthorizedError,
 ForbiddenError,
 NotFoundError
} from "./errors.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { createUser } from "./db/queries/users.js";
import { deleteAllUsers,getUserByEmail,updateUser,upgradeUserToRed } from "./db/queries/users.js";
import { createChirp,getChirps,getChirpById,deleteChirp } from "./db/queries/chirps.js";
import {hashPassword,checkPasswordHash,makeJWT,validateJWT,getBearerToken,makeRefreshToken,getAPIKey} from "./auth.js";

import {
createRefreshToken,
getRefreshToken,
revokeRefreshToken
}
from "./db/queries/refreshTokens.js";



const migrationClient = postgres(
  config.db.url,
  {
    max:1
  }
);


await migrate(
  drizzle(migrationClient),
  config.db.migrationConfig
);



const app = express();

const PORT = 8080;

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {

console.log(err);


if(err instanceof BadRequestError){

res.status(400).json({
 error: err.message
});

return;

}


if(err instanceof UnauthorizedError){

res.status(401).json({
 error: err.message
});

return;

}


if(err instanceof ForbiddenError){

res.status(403).json({
 error: err.message
});

return;

}


if(err instanceof NotFoundError){

res.status(404).json({
 error: err.message
});

return;

}



res.status(500).json({
 error:"Something went wrong on our end"
});


}


function middlewareLogResponses(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.on("finish", () => {
    if (res.statusCode !== 200) {
      console.log(
        `[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`
      );
    }
  });

  next();
}
  

function middlewareMetricsInc(
  req: Request,
  res: Response,
  next: NextFunction
) {

  config.api.fileserverHits++;

  next();
}








function handlerReadiness(req: Request, res: Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
}

function handlerMetrics(
  req: Request,
  res: Response
) {

  res.set(
    "Content-Type",
    "text/html; charset=utf-8"
  );

  res.send(`
    <html>
      <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>
          Chirpy has been visited ${config.api.fileserverHits} times!
        </p>
      </body>
    </html>
  `);

}

async function handlerReset(
 req: Request,
 res: Response
){


if(config.api.platform !== "dev"){

res.status(403).send("Forbidden");

return;

}


await deleteAllUsers();


res.status(200).send("Database reset");

}
async function handlerChirp(
  req: Request,
  res: Response
) {

type parameters = {
 body:string;
};


const params:parameters = req.body;


if(params.body.length > 140){

throw new BadRequestError(
"Chirp is too long. Max length is 140"
);

}



const badWords=[
"kerfuffle",
"sharbert",
"fornax"
];


const words=params.body.split(" ");



const cleanedWords=words.map((word)=>{


if(
badWords.includes(
word.toLowerCase()
)
){

return "****";

}


return word;

});


const cleanedBody=
cleanedWords.join(" ");

const token =
getBearerToken(req);

const userId =
validateJWT(
token,
config.api.jwtSecret
);

const chirp = await createChirp({

body:cleanedBody,

userId:userId
});


res
.status(201)
.json(chirp);




}
//=============create user=================
async function handlerCreateUser(
req:Request,
res:Response
){


  type parameters = {
    email: string;
    password: string;
  };



const params: parameters = req.body;

  const hashedPassword = await hashPassword(
    params.password
  );

const user =await createUser(
{
 email: params.email,
    hashed_password: hashedPassword,

});



  const response = {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
isChirpyRed:user.isChirpyRed
  };




res.status(201).json(response);

}
//====================get chirps===================
async function handlerGetChirps(
req: Request,
res: Response
){

let sort = "asc";


const sortQuery = req.query.sort;


if(typeof sortQuery === "string"){
    sort = sortQuery;
}


const chirps = await getChirps();


chirps.sort((a,b)=>{


if(sort === "desc"){

return (
b.createdAt.getTime()
-
a.createdAt.getTime()
);

}


return (
a.createdAt.getTime()
-
b.createdAt.getTime()
);


});


res.status(200).json(chirps);

}
//====================get single chirp ======================

async function handlerGetChirp(
req: Request,
res: Response
){


const chirpid = req.params.chirpId as string;


const chirp = await getChirpById(chirpid);

if(!chirp){
res.status(404).json(
{
error:"Chirp not found"
}
);
return ;
}


res.status(200).json(chirp);

}



//==================log in handler===============
async function handlerLogin(
req:Request,
res:Response
){

type parameters = {
 email:string;
 password:string;
};

const params:parameters=req.body;


const user = await getUserByEmail(
params.email
);


if(!user){

throw new UnauthorizedError(
"incorrect email or password"
);

}


const matched =
await checkPasswordHash(
params.password,
user.hashed_password
);


if(!matched){

throw new UnauthorizedError(
"incorrect email or password"
);

}


const token = makeJWT(
user.id,
3600,
config.api.jwtSecret
);


const refreshTokenValue =
makeRefreshToken();


const expiresAt =
new Date(
Date.now()
+
60*24*60*60*1000
);


await createRefreshToken(
refreshTokenValue,
user.id,
expiresAt
);



res.status(200).json({

id:user.id,

createdAt:user.createdAt,

updatedAt:user.updatedAt,

email:user.email,

token,

refreshToken:refreshTokenValue,
isChirpyRed:user.isChirpyRed

});


}
//==================refresh handler ===============================

async function handlerRefresh(
req:Request,
res:Response
){

const refreshToken =
getBearerToken(req);



const session =
await getRefreshToken(refreshToken);



if(!session){

throw new UnauthorizedError(
"Invalid refresh token"
);

}



if(session.revokedAt){

throw new UnauthorizedError(
"Token revoked"
);

}



if(session.expiresAt < new Date()){

throw new UnauthorizedError(
"Token expired"
);

}



const token =
makeJWT(
session.userId,
3600,
config.api.jwtSecret
);



res.json({

token

});


}

//=========================revoke ==========================
async function handlerRevoke(
req:Request,
res:Response
){


const token =
getBearerToken(req);


await revokeRefreshToken(token);


res.status(204).send();

}

//============update user=======================


async function handlerUpdateUser(
  req: Request,
  res: Response){

  type parameters = {
    email: string;
    password: string;
  };

  const params: parameters = req.body;

const token = getBearerToken(req);

const userId = validateJWT(
  token,
  config.api.jwtSecret
)



const hashedPassword =
  await hashPassword(
    params.password
  );


const user = await updateUser(
  userId,
  params.email,
  hashedPassword,
);



res.status(200).json({
  id: user.id,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
isChirpyRed:user.isChirpyRed,
});






}

//===========delete chirp==================
async function handlerDeleteChirp(
 req: Request,
 res: Response
){

const token = getBearerToken(req);


const userId = validateJWT(
 token,
 config.api.jwtSecret
);


const chirpId = req.params.chirpId as string;


const chirp = await getChirpById(chirpId);


if(!chirp){

res.status(404).json({
 error:"Chirp not found"
});

return;

}



if(chirp.userId !== userId){

res.status(403).json({
 error:"Forbidden"
});

return;

}



await deleteChirp(chirpId);


res.status(204).send();


}

//=====================polka=====================
async function handlerPolkaWebhook(
req:Request,
res:Response
){
const body=req.body;
const apiKey = getAPIKey(req);

if(apiKey !== config.api.polkaKey){

res.status(401).json({
error:"Unauthorized"
});

return;

}



if(body.event !== "user.upgraded"){

res.status(204).send();

return;

}


const userId =
body.data.userId;



const user =
await upgradeUserToRed(userId);



if(!user){

res.status(404).json({
error:"User not found"
});

return;

}


res.status(204).send();


}







app.use(express.json());

app.post("/api/users", handlerCreateUser);

app.use(middlewareLogResponses);

app.get("/api/healthz", handlerReadiness);

app.get("/admin/metrics", handlerMetrics);

app.post("/admin/reset", handlerReset);

app.post ("/api/chirps",handlerChirp);


app.get("/api/chirps",handlerGetChirps);

app.get( "/api/chirps/:chirpId",handlerGetChirp);

app.use("/app", middlewareMetricsInc);

app.use("/app", express.static("./src/app"));


app.post("/api/login",handlerLogin);

app.post("/api/refresh",handlerRefresh);
app.post("/api/revoke",handlerRevoke);

app.put("/api/users", handlerUpdateUser);
app.delete("/api/chirps/:chirpId",handlerDeleteChirp);
app.post("/api/polka/webhooks",handlerPolkaWebhook);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
