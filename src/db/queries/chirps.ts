import { db } from "../index.js";
import {
 chirps,
 NewChirp
} from "../schema.js";

import { asc,eq } from "drizzle-orm";
export async function createChirp(
 chirp: NewChirp
){

const [result] = await db
.insert(chirps)
.values(chirp)
.returning();


return result;

}



export async function getChirps(
authorId?: string
){

if(authorId){

const result =
await db
.select()
.from(chirps)
.where(
eq(chirps.userId, authorId)
)
.orderBy(
asc(chirps.createdAt)
);


return result;

}


const result =
await db
.select()
.from(chirps)
.orderBy(
asc(chirps.createdAt)
);


return result;

}











export async function getChirpById(
  chirpId:string
){

const results = await db
.select()
.from(chirps)
.where(
  eq(chirps.id, chirpId)
);


return results[0];

}


export async function deleteChirp(chirpId:string){

await db
.delete(chirps)
.where(
    eq(chirps.id, chirpId)
);



}
