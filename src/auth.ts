import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import crypto from "crypto";
import { UnauthorizedError } from "./errors.js";



export async function hashPassword(
  password: string
): Promise<string> {
  return await argon2.hash(password);
}




export async function checkPasswordHash(
  password: string,
  hash: string
): Promise<boolean> {
  return await argon2.verify(hash, password);
}


type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string
): string {

  const issuedAt = Math.floor(Date.now() / 1000);

  const payload: Payload = {
    iss: "chirpy",
    sub: userID,
    iat: issuedAt,
    exp: issuedAt + expiresIn,
  };

  return jwt.sign(payload, secret);



}








export function validateJWT(
 tokenString:string,
 secret:string
):string {


try{

const payload = jwt.verify(
tokenString,
secret
);


if(
typeof payload === "string" ||
!payload.sub
){

throw new UnauthorizedError(
"Invalid token"
);

}


return payload.sub;


}catch(err){


throw new UnauthorizedError(
"Invalid token"
);


}


}


export function getBearerToken(req: Request): string {


const authHeader = req.get("Authorization");


if(!authHeader){

throw new UnauthorizedError(
"No authorization header"
);

}


const parts = authHeader.split(" ");


if(parts.length !== 2){

throw new UnauthorizedError(
"Invalid authorization header"
);

}


if(parts[0] !== "Bearer"){

throw new UnauthorizedError(
"Invalid token type"
);

}


return parts[1];

}






export function makeRefreshToken(){

return crypto
.randomBytes(32)
.toString("hex");

}




export function getAPIKey(req: Request): string {

const authHeader = req.get("Authorization");


if(!authHeader){
 throw new UnauthorizedError(
 "Missing API key"
 );
}


const parts = authHeader.split(" ");


if(parts.length !== 2){
 throw new UnauthorizedError(
 "Invalid API key format"
 );
}


if(parts[0] !== "ApiKey"){
 throw new UnauthorizedError(
 "Invalid API key type"
 );
}


return parts[1];

}
